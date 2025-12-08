import NoticeClient from './NoticeClient';
import { BoardPost } from './NoticeClient';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

async function getPosts() {
  const res = await fetch(`${BASE_URL}/api/board`, {
    next: { tags: ['public', 'board'] },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Failed to fetch posts. Status:", res.status, "Body:", errorText);
    return [];
  }
  
  const data = await res.json();
  return data;
}

function serializePosts(posts: any[]): BoardPost[] {
  if (!Array.isArray(posts)) {
    console.error("serializePosts received non-array:", posts);
    return [];
  }
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
  const posts = await getPosts();
  const serializedPosts = serializePosts(posts || []);
  return <NoticeClient initialPosts={serializedPosts} />;
}
