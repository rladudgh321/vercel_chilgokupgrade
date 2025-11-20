import { createClient } from "@/app/utils/supabase/middlewareClient";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refresh session cookies. This is the primary purpose of the Supabase middleware.
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // --- Route Protection Logic ---
  const publicAdminRoutes = ['/admin/login'];

  if (pathname.startsWith('/admin') && !publicAdminRoutes.includes(pathname)) {
    if (!user) {
      // Unauthenticated user trying to access a protected admin route.
      // Rewrite to the not-found page.
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }
  }

  // --- IP Ban Logic ---
  if (request.method === "POST") {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? request.ip ?? '127.0.0.1';
    try {
      const { data: bannedIp, error } = await supabase
        .from("BannedIp")
        .select("ipAddress")
        .eq("ipAddress", ip)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking banned IP in middleware:", error.message);
      } else if (bannedIp) {
        console.log(`Blocked POST request from banned IP: ${ip}`);
        return new NextResponse("Access Denied: Your IP is blocked.", { status: 403 });
      }
    } catch (e) {
      console.error("Exception in middleware while checking IP:", e);
    }
  }

  // Return the response object to apply any session cookie updates.
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};