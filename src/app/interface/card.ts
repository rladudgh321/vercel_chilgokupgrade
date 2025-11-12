export type OptionName = { name: string };
export type BuyType = { id: number; name: string };

export interface SearchBarProps {
  settings: {
    showKeyword?: boolean;
    showPropertyType?: boolean;
    showbuyType?: boolean;
    showPriceRange?: boolean;
    showAreaRange?: boolean;
    showTheme?: boolean;
    showRooms?: boolean;
    showFloor?: boolean;
    showBathrooms?: boolean;
    showSubwayLine?: boolean;
  };
  roomOptions: OptionName[];
  bathroomOptions: OptionName[];
  floorOptions: OptionName[];
  areaOptions: OptionName[];
  themeOptions: string[] | Array<{ label: string }>;
  propertyTypeOptions: OptionName[];
  buyTypeOptions: BuyType[];
}
