import { koreanToNumber } from "@/app/utility/koreanToNumber";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10) || 12)
    );
    const keywordRaw = searchParams.get("keyword")?.trim() ?? "";
    const keyword = keywordRaw.length ? keywordRaw : undefined;
    const theme = searchParams.get("theme")?.trim();
    const propertyType = searchParams.get("propertyType")?.trim();
    const buyType = searchParams.get("buyType")?.trim();
    const rooms = searchParams.get("rooms")?.trim();
    const bathrooms = searchParams.get("bathrooms")?.trim();
    const sortBy = searchParams.get("sortBy")?.trim() ?? "latest";
    const popularity = searchParams.get("popularity")?.trim();

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
        buildingOptions:BuildingOption(id, name),
        listingType:ListingType(name),
        buyType:BuyType(name),
        roomOption:RoomOption(name),
        bathroomOption:BathroomOption(name)
      `,
        { count: "exact" }
      )
      .is("deletedAt", null)


      
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
          q = q.eq("bathroomOptionId", -1); // Return no results if bathroom option doesn't exist
      }
    }

    if (popularity) {
      q = q.eq("popularity", popularity);
    }

    const floor = searchParams.get("floor")?.trim();
    if (floor) {
        console.log(`[DEBUG] Raw floor param: ${floor}`);
        if (floor.includes("~")) {
            const [minStr, maxStr] = floor.replace(/층/g, "").split("~");
            const min = Number(minStr);
            const max = Number(maxStr);
            if (!isNaN(min)) {
                q = q.gte('currentFloor', min);
            }
            if (maxStr && !isNaN(max)) {
                q = q.lte('currentFloor', max);
            }
        } else {
            const singleFloor = Number(floor.replace("층", ""));
            if (!isNaN(singleFloor)) {
                q = q.eq('currentFloor', singleFloor);
            }
        }
    }

    const priceRange = searchParams.get("priceRange")?.trim();
    if (priceRange && buyType) {
        let priceField = "";
        if (buyType === "전세") {
            priceField = "lumpSumPrice";
        } else if (buyType === "월세") {
            priceField = "rentalPrice";
        } else if (buyType === "매매") {
            priceField = "salePrice";
        }

        if (priceField) {
            if (priceRange.includes("~")) {
                const [minStr, maxStr] = priceRange.split("~");
                const min = koreanToNumber(minStr);
                const max = koreanToNumber(maxStr);
                if (min !== null) {
                    q = q.gte(priceField, min);
                }
                if (max !== null) {
                    q = q.lte(priceField, max);
                }
            } else if (priceRange.includes("이상")) {
                const min = koreanToNumber(priceRange.replace("이상", ""));
                if (min !== null) {
                    q = q.gte(priceField, min);
                }
            } else if (priceRange.includes("이하")) {
                const max = koreanToNumber(priceRange.replace("이하", ""));
                if (max !== null) {
                    q = q.lte(priceField, max);
                }
            }
        }
    }
    const { data, error, count } = await q;

    if (error) {
      console.error("Supabase query error in /api/supabase/build:", error);
      Sentry.captureException(error);
      await notifySlack(error, req.url);
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
      ok: true,
      totalItems: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
      currentPage: page,
      data: processedData ?? [],
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

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const { label, buildingOptions, propertyType, id, ...restOfBody } = raw as any;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let labelId: number | null = null;
    if (label) {
      const { data: labelRec } = await supabase.from("Label").select("id").eq("name", label).single();
      if (!labelRec) {
        const { data: newLabel } = await supabase.from("Label").insert({ name: label }).select("id").single();
        if (newLabel) labelId = newLabel.id;
      } else {
        labelId = labelRec.id;
      }
    }

    let listingTypeId: number | null = null;
    if (propertyType) {
        const { data: typeRec } = await supabase.from("ListingType").select("id").eq("name", propertyType).single();
        if (!typeRec) {
            const { data: newType } = await supabase.from("ListingType").insert({ name: propertyType }).select("id").single();
            if (newType) listingTypeId = newType.id;
        } else {
            listingTypeId = typeRec.id;
        }
    }

    const buyTypeId: number | null = raw.buyTypeId ?? null;

    const dataToInsert = {
        ...restOfBody,
        labelId,
        listingTypeId,
        buyTypeId,
    };
    
    const { data: newBuild, error: buildError } = await supabase
        .from("Build")
        .insert(dataToInsert)
        .select()
        .single();

    if (buildError) {
      Sentry.captureException(buildError);
    await notifySlack(buildError, request.url);
        return NextResponse.json({ ok: false, error: buildError }, { status: 400 });
    }
    if (!newBuild) {
        return NextResponse.json({ ok: false, error: { message: "Failed to create build" } }, { status: 500 });
    }

    if (buildingOptions && Array.isArray(buildingOptions)) {
        const existingOptionIds = [];
        for (const optionId of buildingOptions) {
            const { data: optionRec } = await supabase.from("BuildingOption").select("id").eq("id", optionId).single();
            if (optionRec) {
                existingOptionIds.push(optionRec.id);
            }
        }

        const joinTableData = existingOptionIds.map(optionId => ({
            A: newBuild.id,
            B: optionId,
        }));

        if (joinTableData.length > 0) {
            const { error: joinError } = await supabase.from("_BuildToBuildingOption").insert(joinTableData);
            if (joinError) {
                console.error("Error inserting into join table:", joinError);
            }
        }
    }

    return NextResponse.json({ ok: true, data: [newBuild] }, { status: 201 });

  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, request.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}
