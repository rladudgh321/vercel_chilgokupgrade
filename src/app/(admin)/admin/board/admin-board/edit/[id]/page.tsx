import AdminBoardEditClient from "./client";

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
  params: {
    id: string;
  }
}

export default async function AdminBoardEditPage({ params }: AdminBoardEditPageProps) {
  const { id } = params;

  const postResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/board/posts/${id}`, { cache: 'no-store' });

  if (!postResponse.ok) {
    const errorText = await postResponse.text();
    console.error('Error fetching post:', errorText);
    throw new Error('Failed to fetch post');
  }

  const post: PostForForm = await postResponse.json();

  const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`, { cache: 'no-store' });
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
