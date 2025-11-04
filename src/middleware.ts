// src/middleware.ts  (Edge runtime — Node API 사용 금지)
import { type NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ACCESS_TOKEN_COOKIE_NAME = "sb-access-token"; // <-- 확실하지 않음: 실제 쿠키 이름을 확인하세요 (알 수 없습니다)
const PUBLIC_ADMIN_ROUTES = ["/admin/login", "/admin/signup"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1) 관리자 보호 라우트: 인증 여부만 확인 (Edge-safe)
  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN_ROUTES.includes(pathname)) {
    // 쿠키에서 access token 가져오기 (쿠키 이름은 프로젝트마다 다를 수 있음)
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

    if (!accessToken) {
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }

    // 2) Edge-safe: Supabase Auth의 user 확인 엔드포인트 호출 (fetch 사용 — Edge에서 허용)
    try {
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // apikey 헤더가 필요한지 여부는 프로젝트 설정에 따라 다릅니다 — 확실하지 않음.
        },
        // Next.js Edge: credential 옵션은 필요 없음
      });

      if (!userRes.ok) {
        // 토큰 만료 / 무효인 경우 -> 보호된 라우트 접근 차단
        return NextResponse.rewrite(new URL("/not-found", request.url));
      }
      // user 존재하면 통과 (더 상세한 권한 검사는 서버 API로 위임)
    } catch (e) {
      console.error("Edge middleware user check failed:", e);
      // 안전하게 접근 차단
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }
  }

  // 3) IP 차단(POST 요청만): 미들웨어에서 DB에 직접 접근하지 말고 내부 API로 위임
  if (request.method === "POST") {
    const ip = request.ip ?? "127.0.0.1";
    try {
      // 내부 서버(route handler -> Node 런타임)로 위임
      const checkRes = await fetch(new URL("/api/check-banned-ip", request.url).toString(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ip }),
        // credentials/credentials policy not required in Edge middleware
      });

      if (checkRes.ok) {
        const { banned } = await checkRes.json();
        if (banned) {
          return new NextResponse("Access Denied: Your IP is blocked.", { status: 403 });
        }
      } else {
        // 내부 확인 API가 실패하면 안전상 통과시키거나 차단하겠다는 정책을 정하세요.
        console.warn("check-banned-ip request failed:", checkRes.status);
      }
    } catch (e) {
      console.error("Middleware: failed to check banned IP:", e);
    }
  }

  // 미들웨어는 본래의 응답(쿠키 갱신 등)을 반환할 수 있도록 NextResponse.next()를 유지
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
