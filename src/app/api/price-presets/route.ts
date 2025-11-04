import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

// GET: Fetch presets for a given buyTypeId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyTypeId = searchParams.get("buyTypeId");

    if (!buyTypeId) {
      return NextResponse.json(
        { ok: false, error: { message: "buyTypeId가 필요합니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("PricePreset")
      .select("*")
      .eq("buyTypeId", buyTypeId)
      .order("order", { ascending: true, nullsFirst: false });

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, request.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}

// POST: Create a new preset
export async function POST(request: NextRequest) {
  try {
    const { name, buyTypeId } = await request.json();
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { ok: false, error: { message: "이름은 필수입니다." } },
        { status: 400 }
      );
    }
    if (!buyTypeId) {
      return NextResponse.json(
        { ok: false, error: { message: "buyTypeId가 필요합니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("PricePreset")
      .insert([{ name: name.trim(), buyTypeId: parseInt(buyTypeId) }])
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
        if (error.code === '23505') { // unique constraint violation - though there is no unique constraint on name alone
            return NextResponse.json(
                { ok: false, error: { message: "이미 존재하는 이름입니다." } },
                { status: 400 }
              );
        }
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "금액이 추가되었습니다.", data: data[0] },
      { status: 201 }
    );
  } catch (e: any) {
    Sentry.captureException(e);
      await notifySlack(e, request.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}
