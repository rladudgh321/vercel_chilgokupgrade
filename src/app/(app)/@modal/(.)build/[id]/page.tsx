import BuildDetailModalWithRouting from '@/app/components/root/BuildDetailModalWithRouting';
import { IBuild } from "@/app/interface/build";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

// 기존 getBuild 재사용
async function getBuild(id: number): Promise<IBuild> {
  const res = await fetch(`${BASE_URL}/api/supabase/build/${id}`, {
    next: { tags: ["public", "build", `build:${id}`] }
  });
  if (!res.ok) throw new Error("Build fetch failed");
  return res.json();
}

// === generateStaticParams: 빌드 시 호출되어 정적 페이지 목록을 생성 ===
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  try {
    // 빌드 시점에 가져올 목록 엔드포인트 (주의: 자기 배포 URL 사용시 Vercel 빌드에서 실패할 수 있음)
    const res = await fetch(`${BASE_URL}/api/supabase/build?onlyIds=true`, {
      // 빌드에서 캐시/재검증 정도를 제어하려면 next 옵션 사용 가능
      next: { tags: ['public']} // (선택) 1시간 재검증
    });

    if (!res.ok) {
      console.error('generateStaticParams: failed to fetch build ids', res.status);
      return []; // 실패 시 빌드가 멈추지 않게 빈 배열 반환 (원치 않으면 throw)
    }

    // 예상 반환형: [{ id: 1 }, { id: 2 }, ...] 또는 [1,2,3]
    const body = await res.json();

    // body 형태에 맞춰 매핑: 가능한 두 케이스를 처리
    if (Array.isArray(body)) {
      // case A: [{ id: 1 }, ...]
      if (body.length > 0 && typeof body[0] === 'object' && 'id' in body[0]) {
        return body.map((b: any) => ({ id: String(b.id) }));
      }
      // case B: [1,2,3]
      return body.map((b: any) => ({ id: String(b) }));
    }

    return [];
  } catch (err) {
    console.error('generateStaticParams error', err);
    // 빌드 중 에러 발생시 빌드를 중단시키지 않으려면 빈 배열 반환
    // (원하면 throw err; 로 바꿔 빌드 실패하게 할 수 있음)
    return [];
  }
}

// 페이지 컴포넌트: 이제 SSG로 사전생성됩니다.
export default async function ModalPage({ params }: { params: { id: string } }) {
  const buildId = Number(params.id);
  const build = await getBuild(buildId);
  return <BuildDetailModalWithRouting build={build} />;
}
