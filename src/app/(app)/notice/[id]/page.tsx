import { notFound } from 'next/navigation';
import PostView from './PostView';
import type { BoardPost } from './PostView';

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? '';

// (선택) 라우트 전역 ISR 주기: 모든 fetch에 개별 revalidate를 주지 않아도 됨
export const revalidate = 28_800; // 8시간

// 전체 게시글 ID를 수집해 정적 경로로 생성
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  // 전체 목록을 반환하는 엔드포인트를 사용하세요.
  // (예: /api/board 가 { data: [{id,...}, ...] } 형태라고 가정)
  const res = await fetch(`${BASE}/api/board`, {
    // 목록은 상대적으로 자주 안 바뀌면 캐시 가능
    next: { revalidate: 28_800, tags: ['public', 'board', 'board-list'] },
  });

  if (!res.ok) {
    // 목록을 못 가져오면 최소한 빈 배열 반환(빌드 실패 방지)
    return [];
  }

  const json = await res.json();
  const items: Array<{ id: number | string }> = json?.data ?? [];

  // 정적 경로: 문자열 id로 normalize
  return items.map((p) => ({ id: String(p.id) }));
}

// (옵션) generateStaticParams에 없는 id 접근 시 404로 처리하고 싶다면:
// export const dynamicParams = false;

async function getPost(id: string): Promise<BoardPost> {
  const res = await fetch(`${BASE}/api/board/${id}`, {
    // 상세도 캐시/태그 적용 가능(위 revalidate가 있으면 생략 가능)
    next: { revalidate: 28_800, tags: ['public', 'board'] },
  });

  if (!res.ok) {
    notFound();
  }

  const data = await res.json();

  return {
    ...data,
    createdAt: new Date(data.createdAt).toISOString(),
    registrationDate: data.registrationDate
      ? new Date(data.registrationDate).toISOString()
      : undefined,
  };
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // generateStaticParams와 동일 shape 권장
}) {
  const { id } = await params;
  const post = await getPost(id);
  return <PostView post={post} />;
}
