import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  // NOTE: we only block /admin when there's NO cookie at all. We do NOT
  // redirect /admin/login → /admin when a cookie exists, because a cookie
  // existing doesn't guarantee a valid session (the backend may have
  // restarted, wiping the in-memory session store). That check is handled
  // client-side by the login page to avoid infinite redirect loops.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = request.cookies.get("admin_token")?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
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
