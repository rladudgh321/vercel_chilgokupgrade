import { Suspense } from "react";
import { fetchBuilds } from "@/app/apis/build";
import CardPageClient from "./CardPageClient";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 28_800, tags: ['public', 'list'] } });
  if (!res.ok) {
    return { data: [] };
  }
  return res.json();
}

export default async function CardPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;

  const query: Record<string, string> = {};
  if (searchParams.keyword) query.keyword = searchParams.keyword as string;
  if (searchParams.theme) query.theme = searchParams.theme as string;
  if (searchParams.propertyType) query.propertyType = searchParams.propertyType as string;
  if (searchParams.buyType) query.buyType = searchParams.buyType as string;
  if (searchParams.rooms) query.rooms = searchParams.rooms as string;
  if (searchParams.bathrooms) query.bathrooms = searchParams.bathrooms as string;
  if (searchParams.sortBy) query.sortBy = searchParams.sortBy as string;
  if (searchParams.page) query.page = searchParams.page as string;
  query.limit = "12";

  const params = new URLSearchParams(query);

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/listings?${params.toString()}`, {
    next: { revalidate: 28_800, tags: ['public', 'card'] }
  });
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const listingsData = await res.json();

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
    <Suspense>
      <CardPageClient 
        listings={listingsData.listings} 
        totalPages={listingsData.totalPages} 
        settings={settings.data}
        roomOptions={roomOptions.data}
        bathroomOptions={bathroomOptions.data}
        floorOptions={floorOptions.data}
        areaOptions={areaOptions.data}
        themeOptions={themeOptions.data}
        propertyTypeOptions={propertyTypeOptions.data}
        buyTypeOptions={buyTypeOptions.data}
      />
    </Suspense>
  );
}