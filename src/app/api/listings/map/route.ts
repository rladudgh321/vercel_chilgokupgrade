import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const keywordRaw = searchParams.get("keyword")?.trim() ?? "";
    const keyword = keywordRaw.length ? keywordRaw : undefined;
    const theme = searchParams.get("theme")?.trim();
    const propertyType = searchParams.get("propertyType")?.trim();
    const buyType = searchParams.get("buyType")?.trim();
    const rooms = searchParams.get("rooms")?.trim();

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

    if (rooms) {
      const { data: roomRecs } = await supabase.from("RoomOption").select("id").ilike("name", `${rooms}%`);
      if (roomRecs && roomRecs.length > 0) {
        const roomIds = roomRecs.map(r => r.id);
        q = q.in("roomOptionId", roomIds);
      } else {
        q = q.eq("roomOptionId", -1);
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
