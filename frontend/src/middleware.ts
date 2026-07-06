import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl;
  const { pathname } = url;

  // Admin subdomain rewrite: admin.the86connect.com → /admin/*
  if (host === "admin.the86connect.com") {
    // Skip paths that should NOT be rewritten
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/admin") || // already admin
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/og-image") ||
      pathname.startsWith("/fonts") ||
      pathname.startsWith("/robots") ||
      pathname.startsWith("/sitemap")
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
  // Skip middleware for static assets AND api routes (api routes are proxied via next.config.ts rewrites)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
