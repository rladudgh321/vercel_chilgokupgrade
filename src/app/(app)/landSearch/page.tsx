import { BuildFindAll } from "@/app/apis/build";
import LandSearchClient from "./LandSearchClient";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    return { data: [] };
  }
  return res.json();
}

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const { 
    keyword: keywordParam,
    theme: themeParam,
    propertyType: propertyTypeParam,
    buyType: buyTypeParam,
    sortBy: sortByParam 
  } = resolvedSearchParams;

  const page = 1; // Always fetch first page on server
  const keyword = typeof keywordParam === 'string' ? keywordParam : undefined;
  const theme = typeof themeParam === 'string' ? themeParam : undefined;
  const propertyType = propertyTypeParam ? decodeURIComponent(propertyTypeParam as string) : undefined;
  const buyType = buyTypeParam ? decodeURIComponent(buyTypeParam as string) : undefined;
  const sortBy = typeof sortByParam === 'string' ? sortByParam : 'latest';

  // API를 통해 초기 데이터만 가져오기
  const { data: processedListings } = await BuildFindAll(page, 10, keyword, {
    theme,
    propertyType,
    buyType,
  }, sortBy);

  const [settings, roomOptions, bathroomOptions, floorOptions, areaOptions, themeOptions, propertyTypeOptions, buyTypeOptions] = await Promise.all([
    fetchJson(`${BASE_URL}/api/admin/search-bar-settings`),
    fetchJson(`${BASE_URL}/api/room-options`),
    fetchJson(`${BASE_URL}/api/bathroom-options`),
    fetchJson(`${BASE_URL}/api/floor-options`),
    fetchJson(`${BASE_URL}/api/area`),
    fetchJson(`${BASE_URL}/api/theme-images`),
    fetchJson(`${BASE_URL}/api/listing-type`),
    fetchJson(`${BASE_URL}/api/buy-types`),
  ]);

  return (
    <LandSearchClient 
      key={JSON.stringify(resolvedSearchParams)}
      initialListings={processedListings ?? []}
      settings={settings.data}
      roomOptions={roomOptions.data}
      bathroomOptions={bathroomOptions.data}
      floorOptions={floorOptions.data}
      areaOptions={areaOptions.data}
      themeOptions={themeOptions.data}
      propertyTypeOptions={propertyTypeOptions.data}
      buyTypeOptions={buyTypeOptions.data}
    />
  )
}