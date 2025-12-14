export type OptionNameWithCount = { name: string; count: number };
export type BuyTypeWithCount = { id: number; name: string; count: number };
export type ThemeOptionWithCount = { id: number; label: string; count: number };

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
  roomOptions: OptionNameWithCount[];
  bathroomOptions: OptionNameWithCount[];
  floorOptions: OptionNameWithCount[];
  areaOptions: OptionNameWithCount[];
  themeOptions: ThemeOptionWithCount[];
  propertyTypeOptions: OptionNameWithCount[];
  buyTypeOptions: BuyTypeWithCount[];
}
