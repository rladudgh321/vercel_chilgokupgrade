import CardList from "./CardList";

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Use NEXT_PUBLIC_BASE_URL if available, otherwise fallback to localhost
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};

const fetchJson = async (url: string) => {
  const res = await fetch(url, { next: { tags: ["public"] } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  const json = await res.json();
  return json.data;
};

const fetchListings = async (queryParams: Record<string, any>) => {
  const params = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      params.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    }
  });
  params.set("limit", "12");

  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/listings?${params.toString()}`, {
    next: { tags: ["public"] },
  });
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

export default async function CardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const baseUrl = getBaseUrl();
  const [
    settings,
    roomOptions,
    bathroomOptions,
    floorOptions,
    areaOptions,
    themeOptions,
    propertyTypeOptions,
    buyTypeOptions,
    listingsData,
  ] = await Promise.all([
    fetchJson(`${baseUrl}/api/admin/search-bar-settings`),
    fetchJson(`${baseUrl}/api/room-options`),
    fetchJson(`${baseUrl}/api/bathroom-options`),
    fetchJson(`${baseUrl}/api/floor-options`),
    fetchJson(`${baseUrl}/api/area`),
    fetchJson(`${baseUrl}/api/theme-images`),
    fetchJson(`${baseUrl}/api/listing-type`),
    fetchJson(`${baseUrl}/api/buy-types`),
    fetchListings(searchParams),
  ]);

  return (
    <CardList
      initialSettings={settings}
      initialRoomOptions={roomOptions}
      initialBathroomOptions={bathroomOptions}
      initialFloorOptions={floorOptions}
      initialAreaOptions={areaOptions}
      initialThemeOptions={themeOptions}
      initialPropertyTypeOptions={propertyTypeOptions}
      initialBuyTypeOptions={buyTypeOptions}
      initialListingsData={listingsData}
    />
  );
}