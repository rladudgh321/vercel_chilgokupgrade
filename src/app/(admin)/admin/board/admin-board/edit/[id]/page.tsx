import AdminBoardEditClient from "./client";
import { notFound } from 'next/navigation'; // Import notFound

interface PostForForm {
  id: number;
  title: string;
  content: string;
  popupContent: string | null;
  representativeImage: string | null;
  registrationDate: string;
  manager: string;
  isAnnouncement?: boolean;
  isPopup: boolean;
  popupWidth: number | null;
  popupHeight: number | null;
  isPublished: boolean;
  popupType?: 'IMAGE' | 'CONTENT';
  createdAt: string;
  updatedAt: string;
  views: number;
  order?: number | null;
}

interface Category {
  id: number;
  name: string;
}

interface AdminBoardEditPageProps {
  params: Promise<{
    id: string;
  }>
}

export default async function AdminBoardEditPage({ params }: AdminBoardEditPageProps) {
  const { id: postIdString } = await params;

  // Validate postIdString
  const postId = parseInt(postIdString, 10);
  if (isNaN(postId)) {
    console.error('Invalid post ID provided:', postIdString);
    notFound(); // Redirect to 404 page
  }

  const postResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/board/posts/${postId}`); // Use postId

  if (!postResponse.ok) {
    const errorText = await postResponse.text();
    console.error('Error fetching post:', errorText);
    // Consider handling specific HTTP statuses, e.g., if (postResponse.status === 404) notFound();
    throw new Error('Failed to fetch post');
  }

  const post: PostForForm = await postResponse.json();

  const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`);
  if (!categoriesResponse.ok) {
    console.error('Failed to fetch categories');
    return <AdminBoardEditClient post={post} categories={[]} />;
  }
  const categories: Category[] = await categoriesResponse.json();

  const plainPost = {
    ...post,
    registrationDate: new Date(post.registrationDate).toISOString(),
    createdAt: new Date(post.createdAt).toISOString(),
    updatedAt: new Date(post.updatedAt).toISOString(),
  };

  return <AdminBoardEditClient post={plainPost} categories={categories} />;
};
