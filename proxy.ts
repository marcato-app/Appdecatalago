import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (see
// node_modules/next/dist/docs/.../file-conventions/proxy.md). This refreshes
// the Supabase session cookie on every /dashboard request (per Supabase's
// SSR guide) and redirects based on auth state. Every dashboard
// page/server action re-checks with requireUser() against Supabase too —
// this is a first line of defense, not the only one.
const PUBLIC_DASHBOARD_PATHS = ["/dashboard/login", "/dashboard/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_DASHBOARD_PATHS.some((path) => pathname.startsWith(path));

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard/login", request.url));
  }

  if (user && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: "/dashboard/:path*",
};
