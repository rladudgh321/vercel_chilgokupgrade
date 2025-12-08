import CardList from "./CardList";
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
} from "@/lib/data";

export default async function CardPage({
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
    listingsData,
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