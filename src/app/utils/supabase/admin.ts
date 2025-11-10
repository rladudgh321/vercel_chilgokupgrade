// 파일: /app/utils/supabase/admin.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 보안상: 서비스 롤 키는 절대 클라이언트(브라우저)에 노출되면 안 됩니다.
// (확실하지 않음) 배포 환경에서 env 변수 이름이 다르면 여기를 맞춰주세요.
let _supabaseAdmin: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  // 개발 중이라도 콘솔로 경고를 남기되, 프로덕션에서는 노출에 주의하세요.
  console.error(
    "Supabase admin client not initialized. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
  );
}

export const supabaseAdmin = _supabaseAdmin;
