import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { koreanToNumber } from "@/app/utility/koreanToNumber";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const keyword = searchParams.get("keyword")?.trim() || undefined;
    const theme = searchParams.get("theme")?.trim();
    const propertyType = searchParams.get("propertyType")?.trim();
    const buyType = searchParams.get("buyType")?.trim();
    const rooms = searchParams.get("rooms")?.trim();
    const bathrooms = searchParams.get("bathrooms")?.trim();
    const floor = searchParams.get("floor")?.trim();
    const priceRange = searchParams.get("priceRange")?.trim();
    const areaRange = searchParams.get("areaRange")?.trim();

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
          q = q.eq("listingTypeId", -1);
      }
    }

    if (buyType) {
      const { data: typeRec } = await supabase.from("BuyType").select("id").eq("name", buyType).single();
      if (typeRec) {
          q = q.eq("buyTypeId", typeRec.id);
      } else {
          q = q.eq("buyTypeId", -1);
      }
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
      if (bathroomRec) {
          q = q.eq("bathroomOptionId", bathroomRec.id);
      } else {
          q = q.eq("bathroomOptionId", -1);
      }
    }

    if (floor) {
      const cleanedFloor = floor.replace(/층/g, "").trim();
      const filters: string[] = [];

      if (cleanedFloor.includes("~")) {
          const [minStr, maxStr] = cleanedFloor.split("~");
          const min = parseInt(minStr, 10);
          const max = parseInt(maxStr, 10);
          if (!isNaN(min)) {
              filters.push(`currentFloor.gte.${min}`);
          }
          if (!isNaN(max)) {
              filters.push(`currentFloor.lte.${max}`);
          }
      } else if (cleanedFloor.includes("이상")) {
          const min = parseInt(cleanedFloor.replace("이상", "").trim(), 10);
          if (!isNaN(min)) {
              filters.push(`currentFloor.gte.${min}`);
          }
      } else if (cleanedFloor.includes("이하")) {
          const max = parseInt(cleanedFloor.replace("이하", "").trim(), 10);
          if (!isNaN(max)) {
              filters.push(`currentFloor.lte.${max}`);
          }
      } else {
          const singleFloor = parseInt(cleanedFloor, 10);
          if (!isNaN(singleFloor)) {
              filters.push(`currentFloor.eq.${singleFloor}`);
          }
      }

      if (filters.length > 0) {
        filters.forEach(filterString => {
          const [column, operator, value] = filterString.split('.');
          if (column && operator && value) {
            q = q.filter(column, operator, value);
          }
        });
      }
    }

    if (priceRange && buyType) {
        let priceField = "";
        switch (buyType) {
            case "월세":
                priceField = "rentalPrice";
                break;
            case "매매":
                priceField = "salePrice";
                break;
            case "전세":
                priceField = "lumpSumPrice";
                break;
            case "실입주금":
                priceField = "actualEntryCost";
                break;
            case "관리비":
                priceField = "managementFee";
                break;
            case "보증금":
                priceField = "deposit";
                break;
            case "반전세의 월세":
                priceField = "halfLumpSumMonthlyRent";
                break;
        }

        if (priceField) {
            const filters = [];
            const cleanedPriceRange = priceRange.trim();

            if (cleanedPriceRange.includes("~")) {
                const [minStr, maxStr] = cleanedPriceRange.split("~");
                const min = koreanToNumber(minStr);
                const max = koreanToNumber(maxStr);
                if (min !== null) filters.push(`${priceField}.gte.${min}`);
                if (max !== null) filters.push(`${priceField}.lte.${max}`);
            } else if (cleanedPriceRange.includes("이상")) {
                const min = koreanToNumber(cleanedPriceRange.replace("이상", ""));
                if (min !== null) filters.push(`${priceField}.gte.${min}`);
            } else if (cleanedPriceRange.includes("이하")) {
                const max = koreanToNumber(cleanedPriceRange.replace("이하", ""));
                if (max !== null) filters.push(`${priceField}.lte.${max}`);
            }

            if (filters.length > 0) {
                filters.forEach(filterString => {
                    const [column, operator, value] = filterString.split('.');
                    if (column && operator && value) {
                        q = q.filter(column, operator, value);
                    }
                });
            }
        }
    }

    if (areaRange) {
        const PYEONG_TO_SQM = 3.305785;
        const areaColumns = ['actualArea', 'supplyArea', 'landArea', 'buildingArea', 'totalArea', 'NetLeasableArea'];
        let min_sqm: number | null = null;
        let max_sqm: number | null = null;
        const cleanedAreaRange = areaRange.replace(/평/g, "");

        if (cleanedAreaRange.includes("~")) {
            const [minStr, maxStr] = cleanedAreaRange.split("~");
            const min = Number(minStr);
            const max = Number(maxStr);
            if (!isNaN(min)) min_sqm = min * PYEONG_TO_SQM;
            if (!isNaN(max)) max_sqm = max * PYEONG_TO_SQM;
        } else if (cleanedAreaRange.includes("이상")) {
            const min = Number(cleanedAreaRange.replace("이상", ""));
            if (!isNaN(min)) min_sqm = min * PYEONG_TO_SQM;
        } else if (cleanedAreaRange.includes("이하")) {
            const max = Number(cleanedAreaRange.replace("이하", ""));
            if (!isNaN(max)) {
              min_sqm = 0;
              max_sqm = max * PYEONG_TO_SQM;
            }
        }

        const orFilters: string[] = [];
        if (min_sqm !== null && max_sqm !== null) {
            areaColumns.forEach(col => {
                orFilters.push(`and(${col}.gte.${min_sqm},${col}.lte.${max_sqm})`);
            });
        } else if (min_sqm !== null) {
            areaColumns.forEach(col => {
                orFilters.push(`${col}.gte.${min_sqm}`);
            });
        } else if (max_sqm !== null) {
            areaColumns.forEach(col => {
                orFilters.push(`${col}.lte.${max_sqm}`);
            });
        }
        
        if (orFilters.length > 0) {
            q = q.or(orFilters.join(','));
        }
    }


    const { data, error } = await q;

    if (error) {
        console.error("Error fetching map listings:", error);
        throw new Error("Could not fetch map listings.");
    }
    
    return NextResponse.json({
      ok: true,
      data: data ?? [],
    });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}
