import BoardClient from './BoardClient';
import { BoardPost } from './BoardClient';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

async function getPostsAdmin() {

  const response = await fetch(`${BASE_URL}/api/board/posts`);
  if (!response.ok) {
    console.error('Error fetching posts:', await response.text());
    return [];
  }
  const { data } = await response.json();
  return data;
}

function serializePosts(posts: any[]): BoardPost[] {
  return posts.map(post => ({
    ...post,
    id: post.id,
    title: post.title,
    content: post.content,
    popupContent: post.popupContent,
    representativeImage: post.representativeImage,
    externalLink: post.externalLink,
    registrationDate: post.registrationDate ? new Date(post.registrationDate).toISOString() : undefined,
    manager: post.manager,
    isAnnouncement: post.isAnnouncement,
    isPopup: post.isPopup,
    popupWidth: post.popupWidth,
    popupHeight: post.popupHeight,
    isPublished: post.isPublished,
    views: post.views,
    createdAt: new Date(post.createdAt).toISOString(),
    updatedAt: new Date(post.updatedAt).toISOString(),
  }));
}


export default async function AdminBoardPage() {
  const posts = await getPostsAdmin();
  const serializedPosts = serializePosts(posts);
  return <BoardClient initialPosts={serializedPosts} />;
}