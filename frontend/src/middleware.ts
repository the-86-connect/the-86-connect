import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_PROXY_URL || "http://localhost:3001";

const ADMIN_ROBOTS_TXT = `# Block ALL search engines from crawling the admin subdomain
User-Agent: *
Disallow: /

# Explicitly block specific bots
User-Agent: Googlebot
Disallow: /

User-Agent: Bingbot
Disallow: /

User-Agent: Baiduspider
Disallow: /

User-Agent: YandexBot
Disallow: /

User-Agent: GPTBot
Disallow: /
`;

const ADMIN_SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>
`;

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0].toLowerCase();

  const isAdminSubdomain =
    hostname === "admin.the86connect.com" ||
    hostname === "www.admin.the86connect.com";

  if (hostname === "the86connect.com" && !hostname.includes("www")) {
    const newUrl = request.nextUrl.clone();
    newUrl.hostname = "www.the86connect.com";
    return NextResponse.redirect(newUrl, 301);
  }

  if (isAdminSubdomain) {
    if (pathname === "/robots.txt" || pathname === "/robots") {
      return new NextResponse(ADMIN_ROBOTS_TXT, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow",
        },
      });
    }

    if (pathname === "/sitemap.xml" || pathname === "/sitemap") {
      return new NextResponse(ADMIN_SITEMAP_XML, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow",
        },
      });
    }

    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/og-image") ||
      pathname.startsWith("/fonts") ||
      pathname === "/health"
    ) {
      const response = NextResponse.next();
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
      return response;
    }

    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.rewrite(newUrl);
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  if (pathname.startsWith("/api/") || pathname === "/health") {
    const target = `${BACKEND_URL}${pathname}${search}`;
    return NextResponse.rewrite(target);
  }

  if (pathname.startsWith("/admin/") || pathname === "/admin") {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
