import BannedIpList from "./BannedIpList";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!


const getBannedIps = async () => {
  const response = await fetch(`${BASE_URL}/api/banned-ips`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch banned IPs");
  }
  return response.json();
};

const BannedIpsPage = async () => {
  const bannedIps = await getBannedIps();

  return <BannedIpList initialBannedIps={bannedIps} />;
};

export default BannedIpsPage;
