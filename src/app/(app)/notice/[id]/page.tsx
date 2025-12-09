import { notFound } from 'next/navigation';
import PostView, { BoardPost } from './PostView';

import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

// -------------------------
// 2. 서버 컴포넌트: 게시글 상세
// -------------------------
async function getPost(id: string): Promise<BoardPost> {
  const cookieStore = await cookies(); // Re-add cookies for dynamic rendering
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('BoardPost')
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
export default function NoticeDetailPage({
  params,
}: {
  params: { id: string }; 
}) {
  const { id } = params;
  const postPromise = getPost(id);

  return (
    <Suspense fallback={<div>Loading post...</div>}>
      <PostView postPromise={postPromise} />
    </Suspense>
  );
}
