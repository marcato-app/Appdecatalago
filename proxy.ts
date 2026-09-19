import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, decodeSessionToken } from "@/lib/auth/token";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (see
// node_modules/next/dist/docs/.../file-conventions/proxy.md). This only does
// a cheap redirect based on cookie presence/signature — every dashboard
// page/server action re-checks with requireUser() against the database, per
// Next's own guidance not to rely on Proxy alone for authorization.
const PUBLIC_DASHBOARD_PATHS = ["/dashboard/login", "/dashboard/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(token && decodeSessionToken(token));
  const isPublicPath = PUBLIC_DASHBOARD_PATHS.some((path) => pathname.startsWith(path));

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard/login", request.url));
  }

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};
