// src/middleware.ts  (Edge runtime — Node API 사용 금지)
import { type NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ACCESS_TOKEN_COOKIE_NAME = "sb-access-token"; // <-- This might need to be adjusted based on your Supabase setup
const PUBLIC_ADMIN_ROUTES = ["/admin/login", "/admin/signup"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1) Admin route protection
  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN_ROUTES.includes(pathname)) {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

    if (!accessToken) {
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }

    try {
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // The apikey header might be required depending on your project setup
        },
      });

      if (!userRes.ok) {
        return NextResponse.rewrite(new URL("/not-found", request.url));
      }
    } catch (e) {
      console.error("Edge middleware user check failed:", e);
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }
  }

  // 2) IP ban check for all other routes, excluding the IP check API route itself
  if (pathname !== '/api/ip-status') {
    try {
      const checkRes = await fetch(new URL("/api/ip-status", request.url).toString(), {
        method: "GET",
        headers: {
          "x-forwarded-for": request.ip ?? "127.0.0.1",
        },
      });

      if (checkRes.ok) {
        const { isBanned } = await checkRes.json();
        if (isBanned) {
          return new NextResponse("Access Denied: Your IP is blocked.", { status: 403 });
        }
      } else {
        console.warn("ip-status request failed:", checkRes.status);
      }
    } catch (e) {
      console.error("Middleware: failed to check banned IP:", e);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};