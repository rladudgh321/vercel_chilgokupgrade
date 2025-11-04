"use client";

import AdminBoardForm from '@/app/(admin)/admin/board/admin-board/components/AdminBoardForm';

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

interface AdminBoardEditClientProps {
  post: PostForForm;
  categories: Category[];
}

const AdminBoardEditClient = ({ post, categories }: AdminBoardEditClientProps) => {
  return <AdminBoardForm initialData={post} isEdit={true} categories={categories} />;
};

export default AdminBoardEditClient;