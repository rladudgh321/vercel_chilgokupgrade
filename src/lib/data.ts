// src/lib/data.ts
import { supabase } from "@/app/utils/supabase/public";
import { BuildFindAll } from "@/app/apis/build";
import { unstable_cache as cache } from 'next/cache';

const DEFAULT_SETTINGS = {
  showKeyword: true,
  showPropertyType: true,
  showDealType: true,
  showPriceRange: true,
  showAreaRange: true,
  showTheme: true,
  showRooms: true,
  showFloor: true,
  showBathrooms: true,
  showSubwayLine: true,
};

export const getFloorOptions = cache(async () => {
    const { data, error } = await supabase
      .from("FloorOption")
      .select("*")
      .order("order", { ascending: true, nullsFirst: false });

    if (error) {
        console.error("Error fetching floor options:", error);
        throw new Error("Could not fetch floor options.");
    }
    return data;
}, ['floor-options'], { tags: ['public'] });

export const getSearchBarSettings = cache(async () => {
    const { data: settings, error } = await supabase
      .from("SearchBarSetting")
      .select("*")
      .eq("id", 1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = 'exact-single-row-not-found'
        console.error("Error fetching search bar settings:", error);
        throw new Error("Could not fetch search bar settings.");
    }
    
    if (!settings) {
        return DEFAULT_SETTINGS;
    }
    const { id, updatedAt, ...rest } = settings;
    return rest;
}, ['search-bar-settings'], { tags: ['public'] });

export const getRoomOptions = cache(async () => {
    const { data, error } = await supabase
      .from("RoomOption")
      .select("*")
      .order("order", { ascending: true, nullsFirst: false });

    if (error) {
        console.error("Error fetching room options:", error);
        throw new Error("Could not fetch room options.");
    }
    return data;
}, ['room-options'], { tags: ['public'] });

export const getBathroomOptions = cache(async () => {
    const { data, error } = await supabase
      .from("BathroomOption")
      .select("*")
      .order("order", { ascending: true, nullsFirst: false });

    if (error) {
        console.error("Error fetching bathroom options:", error);
        throw new Error("Could not fetch bathroom options.");
    }
    return data;
}, ['bathroom-options'], { tags: ['public'] });

export const getAreaPresets = cache(async () => {
    const { data, error } = await supabase
      .from("AreaPreset")
      .select("*")
      .order("order", { ascending: true, nullsFirst: false });

    if (error) {
        console.error("Error fetching area presets:", error);
        throw new Error("Could not fetch area presets.");
    }
    return data;
}, ['area-presets'], { tags: ['public'] });

export const getThemeImages = cache(async () => {
    const { data, error } = await supabase
      .from("ThemeImage")
      .select("*")
      .is("deletedAt", null)
      .order("order", { ascending: true, nullsFirst: false });

    if (error) {
        console.error("Error fetching theme images:", error);
        throw new Error("Could not fetch theme images.");
    }
    return (data || []).filter((row: any) => {
      const name = row?.imageName ?? '';
      return typeof name === 'string' && name.startsWith('theme-images');
    });
}, ['theme-images'], { tags: ['public'] });

export const getListingTypes = cache(async () => {
    const { data, error } = await supabase
      .from("ListingType")
      .select("*")
      .order("order", { ascending: true, nullsFirst: false });

    if (error) {
        console.error("Error fetching listing types:", error);
        throw new Error("Could not fetch listing types.");
    }
    return data;
}, ['listing-types'], { tags: ['public'] });

export const getBuyTypes = cache(async () => {
    const { data, error } = await supabase
      .from("BuyType")
      .select("*")
      .order("order", { ascending: true, nullsFirst: false });

    if (error) {
        console.error("Error fetching buy types:", error);
        throw new Error("Could not fetch buy types.");
    }
    return data;
}, ['buy-types'], { tags: ['public'] });

export const getListings = cache(async (searchParams: { [key: string]: string | string[] | undefined }) => {
    // This function uses BuildFindAll which likely uses the cookie-based supabase client.
    // To make this work with ISR, BuildFindAll would also need to be refactored
    // to not rely on cookies for public data.
    // For now, I'm assuming BuildFindAll can be called on the server at build time.
    // If it can't, this will also need to be refactored to use the public supabase client.
    const page = parseInt(searchParams.page as string || "1", 10);
    const limit = parseInt(searchParams.limit as string || "12", 10);
    const keyword = searchParams.keyword as string || undefined;
    const theme = searchParams.theme as string || undefined;
    const propertyType = searchParams.propertyType as string || undefined;
    const buyType = searchParams.buyType as string || undefined;
    const rooms = searchParams.rooms as string || undefined;
    const bathrooms = searchParams.bathrooms as string || undefined;
    const sortBy = searchParams.sortBy as string || "latest";
    const popularity = searchParams.popularity as string || undefined;

    try {
        const { data: processedListings, totalPages } = await BuildFindAll(
          page,
          limit,
          keyword,
          {
            theme,
            propertyType,
            buyType,
            rooms,
            bathrooms,
            popularity,
          },
          sortBy
        );
    
        return {
          listings: processedListings,
          totalPages,
          currentPage: page,
        };
      } catch (error) {
        console.error("Failed to fetch listings", error);
        throw new Error("Failed to fetch listings");
      }
}, ['listings'], { tags: ['public'] });


export const getMapListings = cache(async (searchParams: { [key: string]: string | string[] | undefined }) => {
    const keywordRaw = (searchParams.keyword as string)?.trim() ?? "";
    const keyword = keywordRaw.length ? keywordRaw : undefined;
    const theme = (searchParams.theme as string)?.trim();
    const propertyType = (searchParams.propertyType as string)?.trim();
    const buyType = (searchParams.buyType as string)?.trim();

    let q = supabase
      .from("Build")
      .select('id, title, address, isAddressPublic, lat, lng')
      .is("deletedAt", null)
      .eq("visibility", true)
      .not("isAddressPublic", "eq", "private")
      .not("isAddressPublic", "eq", "exclude")
      .order("createdAt", { ascending: false });

    if (keyword) {
      if (/^\d+$/.test(keyword)) {
        q = q.eq("id", Number(keyword));
      } else {
        q = q.ilike("address", `%${keyword}%`);
      }
    }
    if (theme) {
      q = q.contains("themes", [theme]);
    }
    if (propertyType) {
      const { data: typeRec } = await supabase.from("ListingType").select("id").eq("name", propertyType).single();
      if (typeRec) {
          q = q.eq("listingTypeId", typeRec.id);
      } else {
          q = q.eq("listingTypeId", -1); // Return no results if propertyType doesn't exist
      }
    }

    if (buyType) {
      const { data: typeRec } = await supabase.from("BuyType").select("id").eq("name", buyType).single();
      if (typeRec) {
          q = q.eq("buyTypeId", typeRec.id);
      } else {
          q = q.eq("buyTypeId", -1); // Return no results if buyType doesn't exist
      }
    }

    const { data, error } = await q;

    if (error) {
        console.error("Error fetching map listings:", error);
        throw new Error("Could not fetch map listings.");
    }
    return data ?? [];
}, ['map-listings', JSON.stringify(searchParams)], { tags: ['public'] });  