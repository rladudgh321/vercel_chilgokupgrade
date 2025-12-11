import { koreanToNumber } from "@/app/utility/koreanToNumber";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const keyword = searchParams.get("keyword") || undefined;
    const theme = searchParams.get("theme") || undefined;
    const propertyType = searchParams.get("propertyType") || undefined;
    const buyType = searchParams.get("buyType") || undefined;
    const rooms = searchParams.get("rooms") || undefined;
    const bathrooms = searchParams.get("bathrooms") || undefined;
    const sortBy = searchParams.get("sortBy") || "latest";
    const popularity = searchParams.get("popularity") || undefined;
    const areaRange = searchParams.get("areaRange") || undefined;
    const floor = searchParams.get("floor")?.trim();
    const priceRange = searchParams.get("priceRange")?.trim();
    console.log('1111', areaRange);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let q = supabase
      .from("Build")
      .select(
        `
        *,
        label:Label(name),
        buildingOptions:BuildingOption(id, name, imageUrl),
        listingType:ListingType(name),
        buyType:BuyType(name),
        roomOption:RoomOption(name),
        bathroomOption:BathroomOption(name),
        floorOption:RoomOption(id, name, imageUrl)
      `,
        { count: "exact" }
      )
      .is("deletedAt", null)
      .eq("visibility", true)
      .not("isAddressPublic", "eq", "private")
      .not("isAddressPublic", "eq", "exclude");

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
      const idToFilter = typeRec ? typeRec.id : -1;
      q = q.eq("listingTypeId", idToFilter);
    }
    if (buyType) {
      const { data: typeRec } = await supabase.from("BuyType").select("id").eq("name", buyType).single();
      const idToFilter = typeRec ? typeRec.id : -1;
      q = q.eq("buyTypeId", idToFilter);
    }
    if (rooms) {
      const { data: roomRecs } = await supabase.from("RoomOption").select("id").ilike("name", `${rooms}%`);
      if (roomRecs && roomRecs.length > 0) {
        const roomIds = roomRecs.map(r => r.id);
        q = q.in("roomOptionId", roomIds);
      } else {
        q = q.eq("roomOptionId", -1);
      }
    }
    if (bathrooms) {
      const { data: bathroomRec } = await supabase.from("BathroomOption").select("id").eq("name", bathrooms).single();
      const idToFilter = bathroomRec ? bathroomRec.id : -1;
      q = q.eq("bathroomOptionId", idToFilter);
    }
    if (popularity) {
      q = q.eq("popularity", popularity);
    }
     if (floor) {
        const filters = [];
        if (floor.includes("~")) {
            const [minStr, maxStr] = floor.replace(/층/g, "").split("~");
            const min = Number(minStr);
            if (!isNaN(min)) filters.push(`currentFloor.gte.${min}`);
            if (maxStr && !isNaN(Number(maxStr))) filters.push(`currentFloor.lte.${Number(maxStr)}`);
        } else {
            const singleFloor = Number(floor.replace("층", ""));
            if (!isNaN(singleFloor)) filters.push(`currentFloor.eq.${singleFloor}`);
        }
        if (filters.length > 0) {
          q = q.and(filters.join(","));
        }
    }
    if (priceRange && buyType) {
        let priceField = "";
        if (buyType === "전세") priceField = "lumpSumPrice";
        else if (buyType === "월세") priceField = "rentalPrice";
        else if (buyType === "매매") priceField = "salePrice";

        if (priceField) {
            const filters = [];
            if (priceRange.includes("~")) {
                const [minStr, maxStr] = priceRange.split("~");
                const min = koreanToNumber(minStr);
                const max = koreanToNumber(maxStr);
                if (min !== null) filters.push(`${priceField}.gte.${min}`);
                if (max !== null) filters.push(`${priceField}.lte.${max}`);
            } else if (priceRange.includes("이상")) {
                const min = koreanToNumber(priceRange.replace("이상", ""));
                if (min !== null) filters.push(`${priceField}.gte.${min}`);
            } else if (priceRange.includes("이하")) {
                const max = koreanToNumber(priceRange.replace("이하", ""));
                if (max !== null) filters.push(`${priceField}.lte.${max}`);
            }
            if (filters.length > 0) {
              q = q.and(filters.join(","));
            }
        }
    }
    if (areaRange) {
      console.log('**', areaRange);
        const PYEONG_TO_SQM = 3.305785;
        const areaColumns = ['actualArea', 'supplyArea', 'landArea', 'buildingArea', 'totalArea', 'NetLeasableArea'];
        let min_sqm: number | null = null;
        let max_sqm: number | null = null;
        const cleanedAreaRange = areaRange.replace(/평/g, "").trim();

        if (cleanedAreaRange.includes("~")) {
            const [minStr, maxStr] = cleanedAreaRange.split("~");
            const min = Number(minStr.trim());
            const max = Number(maxStr.trim());
            if (!isNaN(min)) min_sqm = min * PYEONG_TO_SQM;
            if (!isNaN(max)) max_sqm = max * PYEONG_TO_SQM;
        } else if (cleanedAreaRange.includes("이상")) {
            const min = Number(cleanedAreaRange.replace("이상", "").trim());
            if (!isNaN(min)) min_sqm = min * PYEONG_TO_SQM;
        } else if (cleanedAreaRange.includes("이하")) {
            const max = Number(cleanedAreaRange.replace("이하", "").trim());
            if (!isNaN(max)) {
              max_sqm = max * PYEONG_TO_SQM;
            }
        }

        const orFilters: string[] = [];
        if (min_sqm !== null && max_sqm !== null) { // Handles "X ~ Y"
            areaColumns.forEach(col => {
                orFilters.push(`and(${col}.gte.${min_sqm},${col}.lte.${max_sqm})`);
            });
        } else if (min_sqm !== null) { // Handles "X 이상"
            areaColumns.forEach(col => {
                orFilters.push(`${col}.gte.${min_sqm}`);
            });
        } else if (max_sqm !== null) { // Handles "Y 이하"
            areaColumns.forEach(col => {
                orFilters.push(`${col}.lte.${max_sqm}`);
            });
        }
        
        if (orFilters.length > 0) {
            q = q.or(orFilters.join(','));
        }
    }
      
    // Sorting logic
    switch (sortBy) {
      case 'popular':
      case 'popular-desc':
        q = q.order('views', { ascending: false, nullsFirst: true });
        break;
      case 'popular-asc':
        q = q.order('views', { ascending: true, nullsFirst: true });
        break;
      case 'price-desc':
        q = q.order('max_price', { ascending: false, nullsFirst: true });
        break;
      case 'price-asc':
        q = q.order('max_price', { ascending: true, nullsFirst: true });
        break;
      case 'area-desc':
        q = q.order('max_area', { ascending: false, nullsFirst: true });
        break;
      case 'area-asc':
        q = q.order('max_area', { ascending: true, nullsFirst: true });
        break;
      case 'latest':
      default:
        q = q.order("createdAt", { ascending: false });
        break;
    }

    q = q.range(from, to);

    const { data, error, count } = await q;

    if (error) {
      console.error("Supabase query error in /api/listings:", error);
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    const processedData = data.map((d: any) => ({
      ...d,
      label: d.label?.name,
      propertyType: d.listingType?.name,
      buyType: d.buyType?.name,
      floorType: d.floorType,
    }));

    return NextResponse.json({
      listings: processedData,
      totalPages: Math.ceil((count ?? 0) / limit),
      currentPage: page,
    });
  } catch (error) {
    Sentry.captureException(error);
    await notifySlack(error, request.url);
    return NextResponse.json(
      { message: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
