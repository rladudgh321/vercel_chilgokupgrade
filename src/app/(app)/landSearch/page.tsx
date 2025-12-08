import LandSearchClient from "./LandSearchClient";

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

const fetchJson = async (url: string) => {
  const res = await fetch(url, { next: { tags: ["public"] } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  const json = await res.json();
  return json.data;
};

const fetchListings = async (searchParams: any) => {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && typeof value === "string") {
      params.set(key, value);
    }
  });

  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/listings?${params.toString()}`, {
    next: { tags: ["public"] },
  });
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

const fetchMapListings = async (searchParams: any) => {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && typeof value === "string") {
      params.set(key, value);
    }
  });
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/listings/map?${params.toString()}`, {
    next: { tags: ["public"] },
  });
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await res.json();
  return data.data;
};

export default async function Page({
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
    paginatedData,
    mapListings,
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
    fetchMapListings(searchParams),
  ]);

  return (
    <LandSearchClient
      initialSettings={settings}
      initialRoomOptions={roomOptions}
      initialBathroomOptions={bathroomOptions}
      initialFloorOptions={floorOptions}
      initialAreaOptions={areaOptions}
      initialThemeOptions={themeOptions}
      initialPropertyTypeOptions={propertyTypeOptions}
      initialBuyTypeOptions={buyTypeOptions}
      initialPaginatedData={paginatedData}
      initialMapListings={mapListings}
    />
  );
}