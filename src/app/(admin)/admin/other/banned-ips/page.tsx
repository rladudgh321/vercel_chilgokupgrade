import BannedIpList from "./BannedIpList";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

const getBannedIps = async (page: number, limit: number) => {
  const response = await fetch(`${BASE_URL}/api/banned-ips?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch banned IPs");
  }
  const data = await response.json();
  return data;
};

const BannedIpsPage = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page ?? "1", 10);
  const limit = 10;

  const bannedIps = await getBannedIps(page, limit);
  const totalPages = bannedIps.length;
  return <BannedIpList initialBannedIps={bannedIps} totalPages={totalPages} currentPage={page} />;
};

export default BannedIpsPage;
