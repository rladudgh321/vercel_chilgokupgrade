import { notFound } from 'next/navigation';
import PostView, { BoardPost } from './PostView';
import { createClient as createClientClient } from '@/app/utils/supabase/client';

// -------------------------
// 1. SSG: 정적 경로 수집
// -------------------------
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  // For fetching IDs at build time, the client is fine.
  const supabase = createClientClient();
  const { data, error } = await supabase.from('BoardPost').select('id');
  if (error || !data) return [];

  return data.map((p) => ({ id: String(p.id) }));
}

// -------------------------
// 2. 서버 컴포넌트: 게시글 상세
// -------------------------
async function getPost(id: string): Promise<BoardPost> {
  // Use direct fetch to Supabase REST API to avoid client-side libraries at build time
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase environment variables are not set.");
  }

  const url = `${SUPABASE_URL}/rest/v1/BoardPost?id=eq.${id}&select=*`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    next: { tags: ['public'] },
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    notFound();
  }

  const data = await res.json();
  
  if (!data || data.length === 0) {
    notFound();
  }

  const post = data[0];

  return {
    ...post,
    createdAt: new Date(post.createdAt).toISOString(),
    registrationDate: post.registrationDate
      ? new Date(post.registrationDate).toISOString()
      : undefined,
  };
}

// -------------------------
// 3. 페이지 컴포넌트
// -------------------------
export default async function NoticeDetailPage({
  params,
}: {
  params: { id: string }; 
}) {
  const { id } = params;
  const post = await getPost(id);

  return <PostView post={post} />;
}
