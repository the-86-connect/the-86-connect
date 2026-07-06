/**
 * Catch-all API proxy route.
 *
 * Forwards all /api/* requests to the backend (Render).
 * This is more reliable than next.config.ts rewrites on Vercel,
 * which can be blocked by middleware or have pattern-matching issues.
 *
 * Supports: GET, POST, PATCH, DELETE, PUT
 * Passes through: headers, cookies, body, query params
 */

const BACKEND_URL =
  process.env.BACKEND_PROXY_URL || "http://localhost:3001";

async function proxyRequest(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const searchParams = request.nextUrl.searchParams.toString();
  const apiPath = `/api/${path.join("/")}${searchParams ? `?${searchParams}` : ""}`;
  const targetUrl = `${BACKEND_URL}${apiPath}`;

  try {
    const headers = new Headers();

    // Forward relevant headers
    const forwardHeaders = [
      "content-type",
      "authorization",
      "x-csrf-token",
      "accept",
      "accept-language",
      "user-agent",
      "x-forwarded-for",
      "x-real-ip",
      "referer",
      "origin",
    ];
    for (const name of forwardHeaders) {
      const value = request.headers.get(name);
      if (value && name !== "host") {
        headers.set(name, value);
      }
    }

    // Forward cookies
    const cookie = request.headers.get("cookie");
    if (cookie) {
      headers.set("cookie", cookie);
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      redirect: "manual",
    };

    // Forward body for non-GET requests
    if (request.method !== "GET" && request.method !== "HEAD") {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        fetchOptions.body = await request.text();
      } else if (contentType.includes("multipart/form-data")) {
        fetchOptions.body = await request.formData();
      } else {
        fetchOptions.body = await request.text();
      }
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Forward the response
    const responseHeaders = new Headers();
    const setCookieHeaders = response.headers.get("set-cookie");
    if (setCookieHeaders) {
      responseHeaders.set("set-cookie", setCookieHeaders);
    }
    responseHeaders.set("content-type",
      response.headers.get("content-type") || "application/json");
    responseHeaders.set("access-control-allow-origin",
      request.headers.get("origin") || "*");
    responseHeaders.set("access-control-allow-credentials", "true");
    responseHeaders.set("access-control-allow-methods",
      "GET, POST, PATCH, DELETE, PUT, OPTIONS");
    responseHeaders.set("access-control-allow-headers",
      "Content-Type, Authorization, X-CSRF-Token, Cookie");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[API Proxy] Failed to proxy ${apiPath}:`, (error as Error).message);
    return new Response(
      JSON.stringify({ error: "Backend unreachable. Please try again later." }),
      {
        status: 502,
        headers: { "content-type": "application/json" },
      },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const PUT = proxyRequest;

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": request.headers.get("origin") || "*",
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": "GET, POST, PATCH, DELETE, PUT, OPTIONS",
      "access-control-allow-headers": "Content-Type, Authorization, X-CSRF-Token, Cookie",
      "access-control-max-age": "86400",
    },
  });
}