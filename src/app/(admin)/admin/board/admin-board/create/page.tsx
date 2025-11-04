import AdminBoardForm from "../components/AdminBoardForm";

interface Category {
  id: number;
  name: string;
}

const AdminBoardCreatePage = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`, { cache: 'no-store' });
  if (!response.ok) {
    console.error('Failed to fetch categories');
    return <AdminBoardForm categories={[]} />;
  }
  const categories: Category[] = await response.json();

  return <AdminBoardForm categories={categories} />;
};

export default AdminBoardCreatePage;