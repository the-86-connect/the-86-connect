import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_PROXY_URL || "http://localhost:3001";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0].toLowerCase();

  if (hostname === "the86connect.com" && !hostname.includes("www")) {
    const newUrl = request.nextUrl.clone();
    newUrl.hostname = "www.the86connect.com";
    return NextResponse.redirect(newUrl, 301);
  }

  if (pathname.startsWith("/api/") || pathname === "/health") {
    const target = `${BACKEND_URL}${pathname}${search}`;
    return NextResponse.rewrite(target);
  }

  if (hostname === "admin.the86connect.com" || hostname === "www.admin.the86connect.com") {
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/og-image") ||
      pathname.startsWith("/fonts") ||
      pathname.startsWith("/robots") ||
      pathname.startsWith("/sitemap") ||
      pathname === "/health"
    ) {
      return NextResponse.next();
    }

    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
