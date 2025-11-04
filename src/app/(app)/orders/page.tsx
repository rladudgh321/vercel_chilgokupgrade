import OrderForm from "./OrderForm";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";

async function jfetch<T>(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) throw new Error(`Fetch failed: ${path}`);
  return res.json() as Promise<T>;
}

async function getBootstrap() {
  const [propTypes, buyTypes] = await Promise.all([
    jfetch<{ data: Array<{ id: number; name: string }> }>("/api/property-types", {
      // 옵션성 데이터 → 캐시
      next: { revalidate: 60 * 30, tags: ["orders", "types"] },
    }),
    jfetch<{ data: Array<{ id: number; name: string }> }>("/api/buy-types", {
      next: { revalidate: 60 * 30, tags: ["orders", "types"] },
    }),
  ]);

  // IP 차단 여부는 사용자/요청마다 다름 → 캐시 X
  const ip = await jfetch<{ isBanned: boolean }>("/api/ip-status", { cache: "no-store" });

  return {
    propertyTypes: propTypes?.data ?? [],
    buyTypes: buyTypes?.data ?? [],
    isBanned: ip?.isBanned ?? false,
  };
}

export default async function OrdersPage() {
  const { propertyTypes, buyTypes, isBanned } = await getBootstrap();

  return (
    <main className="container mx-auto p-4 sm:px-4 sm:py-8 mt-14">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">매물 의뢰</h1>
      <OrderForm propertyTypes={propertyTypes} buyTypes={buyTypes} isBanned={isBanned} />
    </main>
  );
}
