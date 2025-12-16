import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let q = supabase
      .from("Build")
      .select(
        `
        id,
        themes,
        propertyType:listingTypeId,
        buyType:buyTypeId,
        roomOption:roomOptionId,
        floorOption:floorOptionId,
        bathroomOption:bathroomOptionId,
        supplyArea,
        listingType:ListingType(name),
        buyType:BuyType(name),
        roomOption:RoomOption(name),
        bathroomOption:BathroomOption(name),
        floorOption:FloorOption(name)
      `
      )
      .is("deletedAt", null)
      .eq("visibility", true);

    const { data, error } = await q;

    if (error) {
      console.error("Supabase query error in /api/listings/all:", error);
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    const processedData = data.map((d: any) => ({
      ...d,
      propertyType: d.listingType?.name,
      buyType: d.buyType?.name,
      roomOption: d.roomOption?.name,
      bathroomOption: d.bathroomOption?.name,
      floorOption: d.floorOption?.name,
    }));

    return NextResponse.json({
      listings: processedData,
    });
  } catch (error) {
    Sentry.captureException(error);
    await notifySlack(error, request.url);
    return NextResponse.json(
      { message: "Failed to fetch all listings" },
      { status: 500 }
    );
  }
}
