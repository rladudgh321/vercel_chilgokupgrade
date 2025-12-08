import LandSearchClient from "./LandSearchClient";
import { 
    getSearchBarSettings,
    getRoomOptions,
    getBathroomOptions,
    getFloorOptions,
    getAreaPresets,
    getThemeImages,
    getListingTypes,
    getBuyTypes,
    getListings,
    getMapListings,
} from "@/lib/data";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
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
    getSearchBarSettings(),
    getRoomOptions(),
    getBathroomOptions(),
    getFloorOptions(),
    getAreaPresets(),
    getThemeImages(),
    getListingTypes(),
    getBuyTypes(),
    getListings(searchParams),
    getMapListings(searchParams),
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