import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// 보안상, 미들웨어에서는 Service Role Key를 권장(RLS 무시하고 확실하게 차단 가능)
// (절대 클라이언트로 전달되지 않음)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export function createClient(request: NextRequest) {
  // 원본 요청 헤더로 초기 Response 생성
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  
  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!, 
    {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // 요청 쿠키 업데이트(내부 상태 유지)
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        // 응답 객체를 재생성하고, 응답 쿠키도 동기화
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // supabase 인스턴스와, 쿠키 동기화된 response를 함께 반환
  return { supabase, response };
}
