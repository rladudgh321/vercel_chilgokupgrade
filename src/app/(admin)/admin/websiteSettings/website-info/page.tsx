import WebsiteInfoForm from "./WebsiteInfoForm";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

async function getWorkInfoAdmin() {
  const response = await fetch(`${BASE_URL}/api/admin/website-info`);
  if (!response.ok) {
    console.error('Error fetching posts:', await response.text());
    return [];
  }
  return response.json();
}

export default async function WebsiteInfoPage() {
  const workInfo = await getWorkInfoAdmin();
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">웹사이트 정보 관리</h1>
        <WebsiteInfoForm initialData={workInfo} />
      </div>
    </div>
  );
}