import DashboardClient from '../shared/DashboardClient';

async function getDashboardData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/dashboard`);
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

// Server Component
export default async function DashboardPage() {
  const dashboardData = await getDashboardData();
  return <DashboardClient dashboardData={dashboardData} />;
}