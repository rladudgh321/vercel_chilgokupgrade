import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

// POST: Reorder presets
export async function POST(request: NextRequest) {
  try {
    const items: { id: number; order: number }[] = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { ok: false, error: { message: "잘못된 요청입니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const updates = items.map(({ id, order }) =>
      supabase.from("PricePreset").update({ order }).eq("id", id)
    );

    const results = await Promise.all(updates);

    const errorResult = results.find((res) => res.error);

    if (errorResult) {
      Sentry.captureException(errorResult);
      await notifySlack(errorResult, request.url);
      return NextResponse.json({ ok: false, error: errorResult.error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "순서가 변경되었습니다." },
      { status: 200 }
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
