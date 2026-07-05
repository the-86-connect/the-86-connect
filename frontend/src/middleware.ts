import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const isAdminSubdomain = hostname.startsWith("admin.");
  const { pathname } = request.nextUrl;

  // ── Admin subdomain (admin.the86connect.com) ──
  if (isAdminSubdomain) {
    // Allow /admin/login without auth
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    // Redirect non-admin paths to /admin
    if (!pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // Protect /admin/* except /admin/login
    const adminToken = request.cookies.get("admin_token")?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Main site (the86connect.com) ──
  // Block /admin/* — rewrite to 404 page
  // Skip in dev (localhost) so admin panel can be tested without subdomain
  if (pathname.startsWith("/admin") && !hostname.startsWith("localhost")) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  // Protect /account routes — requires user_token
  if (pathname.startsWith("/account")) {
    const userToken = request.cookies.get("user_token")?.value;
    if (!userToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect to /account if already logged in and visiting /login
  if (pathname === "/login") {
    const userToken = request.cookies.get("user_token")?.value;
    if (userToken) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/login"],
};