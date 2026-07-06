import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl;
  const { pathname } = url;

  // Only handle admin subdomain rewrites.
  // API routes are handled by next.config.ts rewrites (afterFiles).
  if (host === "admin.the86connect.com") {
    // Skip paths that should NOT be rewritten to /admin/*
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
  // Run middleware on everything except static assets.
  // API routes are excluded INSIDE the middleware (above) so afterFiles rewrites fire.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
