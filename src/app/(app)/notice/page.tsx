import NoticeClient from './NoticeClient';
import { BoardPost } from './NoticeClient';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

async function getPosts() {
  const res = await fetch(`${BASE_URL}/api/board`, {
    next: { revalidate: 28800, tags: ['public', 'board'] },
  });
  if (!res.ok) {
    return { data: [] };
  }
  return res.json();
}

function serializePosts(posts: any[]): BoardPost[] {
  return posts.map(post => ({
    ...post,
    id: post.id,
    title: post.title,
    content: post.content,
    categoryName: post.BoardCategory?.name,
    createdAt: new Date(post.createdAt).toISOString(),
    registrationDate: post.registrationDate ? new Date(post.registrationDate).toISOString() : undefined,
  }));
}


export default async function NoticePage() {
  const response = await getPosts();
  const serializedPosts = serializePosts(response.data || []);
  return <NoticeClient initialPosts={serializedPosts} />;
}
