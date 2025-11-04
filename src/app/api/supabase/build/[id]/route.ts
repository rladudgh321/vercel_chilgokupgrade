import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
import { toZonedTime } from 'date-fns-tz';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return NextResponse.json({ message: "유효하지 않은 ID" }, { status: 400, headers: corsHeaders });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("Build")
      .select(`
        *,
        label:Label(name),
        buildingOptions:BuildingOption(id, name, imageUrl, imageName),
        listingType:ListingType(name),
        buyType:BuyType(name),
        roomOption:RoomOption(id, name, imageUrl, imageName),
        bathroomOption:BathroomOption(id, name, imageUrl, imageName),
        floorOption:FloorOption(id, name, imageUrl, imageName)
      `)
      .eq("id", idNum)
      .single();

    if (error) {
      Sentry.captureException(error);
            await notifySlack(error, req.url);
      return NextResponse.json({ message: error.message }, { status: 500, headers: corsHeaders });
    }
    if (!data) {
      return NextResponse.json({ message: "매물을 찾을 수 없습니다." }, { status: 404, headers: corsHeaders });
    }

    // Increment view count asynchronously
    const newViews = (data.views || 0) + 1;
    supabase
      .from('Build')
      .update({ views: newViews })
      .eq("id", idNum)
      .then(async ({ error: updateError }) => {
        if (updateError) {
          Sentry.captureException(updateError);
          await notifySlack(updateError, req.url);
        }
      });

    const result = {
      ...data,
      label: (data.label as any)?.name,
      propertyType: (data.listingType as any)?.name,
      buyType: (data.buyType as any)?.name,
    };

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return NextResponse.json({ message: "유효하지 않은 ID" }, { status: 400, headers: corsHeaders });
    }

    const raw = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ message: "잘못된 요청 본문" }, { status: 400, headers: corsHeaders });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { label, buildingOptions, propertyType, buyType, id: rawId, ...restOfBody } = raw as any;

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

    let buyTypeId: number | null = null;
    if (buyType) {
        const { data: typeRec } = await supabase.from("BuyType").select("id").eq("name", buyType).single();
        if (!typeRec) {
            const { data: newType } = await supabase.from("BuyType").insert({ name: buyType }).select("id").single();
            if (newType) buyTypeId = newType.id;
        } else {
            buyTypeId = typeRec.id;
        }
    }

    const dataToUpdate: any = {
        ...restOfBody,
        updatedAt: toZonedTime(new Date(), 'Asia/Seoul'),
    };
    if (label !== undefined) dataToUpdate.labelId = labelId;
    if (propertyType !== undefined) dataToUpdate.listingTypeId = listingTypeId;
    if (buyType !== undefined) dataToUpdate.buyTypeId = buyTypeId;

    // 날짜 필드 "" -> null 변환
    const dateFields = [
      'constructionYear',
      'permitDate',
      'approvalDate',
      'moveInDate',
      'contractEndDate',
      'confirmDate'
    ];

    for (const field of dateFields) {
      if (dataToUpdate[field] === '') {
        dataToUpdate[field] = null;
      }
    }

    const { error: updateError } = await supabase
        .from("Build")
        .update(dataToUpdate)
        .eq("id", idNum);

    if (updateError) {
      Sentry.captureException(updateError);
    await notifySlack(updateError, req.url);
        return NextResponse.json({ ok: false, error: updateError }, { status: 400, headers: corsHeaders });
    }

    if (buildingOptions && typeof buildingOptions === 'object' && 'set' in buildingOptions && Array.isArray(buildingOptions.set)) {
        // First, remove existing relations for this build
        await supabase.from("_BuildToBuildingOption").delete().eq("A", idNum);

        // Extract the IDs from the 'set' array. The items are objects like { id: ... }
        const optionIds = buildingOptions.set.map(opt => opt.id).filter(id => typeof id === 'number');

        if (optionIds.length > 0) {
            const joinTableData = optionIds.map(optionId => ({
                A: idNum, // buildId
                B: optionId, // buildingOptionId
            }));

            const { error: joinError } = await supabase.from("_BuildToBuildingOption").insert(joinTableData);
            if (joinError) {
                Sentry.captureException(joinError);
                await notifySlack(joinError, req.url);
                // We might want to return an error response here
                return NextResponse.json({ ok: false, error: joinError }, { status: 400, headers: corsHeaders });
            }
        }
    }

    const { data: finalData, error } = await supabase
        .from("Build")
        .select(`*, label:Label(name), buildingOptions:BuildingOption(id, name), listingType:ListingType(name), buyType:BuyType(name)`)
        .eq("id", idNum)
        .single();
    
    const result = {
        ...finalData,
        label: (finalData as any).label?.name,
        buildingOptions: (finalData as any).buildingOptions.map((o: any) => o.name),
        propertyType: (finalData as any).listingType?.name,
        buyType: (finalData as any).buyType?.name,
    };

    if(error) {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
    } 

    return NextResponse.json({ message: "수정 완료", data: result }, { headers: corsHeaders });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500, headers: corsHeaders });
  }
}