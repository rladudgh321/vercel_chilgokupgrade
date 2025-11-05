import { notFound } from 'next/navigation';
import PostView, { BoardPost } from './PostView';
export const dynamic = 'force-dynamic';

// 서버 전용 클라이언트 (빌드 시점 및 SSR용)
import {createClient as createClientClient } from '@/app/utils/supabase/client';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

export const revalidate = 28800; // 8시간

// -------------------------
// 1. SSG: 정적 경로 수집
// -------------------------
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  const supabase = createClientClient(); // 쿠키 없이 빌드 시점에서 안전
  const { data, error } = await supabase.from('board').select('id');

  if (error || !data) return [];

  return data.map((p) => ({ id: String(p.id) }));
}

// -------------------------
// 2. 서버 컴포넌트: 게시글 상세
// -------------------------
async function getPost(id: string): Promise<BoardPost> {
  const cookieStore = await cookies(); // 요청 스코프 쿠키
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('board')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) notFound();

  return {
    ...data,
    createdAt: new Date(data.createdAt).toISOString(),
    registrationDate: data.registrationDate
      ? new Date(data.registrationDate).toISOString()
      : undefined,
  };
}

// -------------------------
// 3. 페이지 컴포넌트
// -------------------------
export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }> ; // generateStaticParams와 동일 shape
}) {
  const { id } = await params;
  const post = await getPost(id);

  return <PostView post={post} />;
}
