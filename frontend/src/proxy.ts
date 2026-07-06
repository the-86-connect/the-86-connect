import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Handles admin subdomain rewrite: admin.the86connect.com → /admin/*
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl;
  const { pathname } = url;

  if (host === "admin.the86connect.com") {
    // Skip paths that should NOT be rewritten
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/og-image") ||
      pathname.startsWith("/fonts") ||
      pathname.startsWith("/robots") ||
      pathname.startsWith("/sitemap") ||
      pathname.startsWith("/health")
    ) {
      return NextResponse.next();
    }

    // Rewrite root and other paths to /admin/*
    const newUrl = url.clone();
    newUrl.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Exclude static assets, API routes, and health checks from proxy.
  // API routes are handled by the catch-all route handler at app/api/[...path]/route.ts.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|health).*)"],
};