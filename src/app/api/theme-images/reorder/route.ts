import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function POST(request: NextRequest) {
  try {
    const { orderedIds } = await request.json();
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { ok: false, error: { message: "orderedIds must be an array." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const updates = orderedIds.map((id, index) =>
      supabase
        .from("ThemeImage")
        .update({ order: index })
        .eq("id", id)
    );

    const results = await Promise.all(updates);
    const errorResult = results.find(res => res.error);

    if (errorResult) {
      Sentry.captureException(errorResult);
      await notifySlack(errorResult, request.url);
      return NextResponse.json({ ok: false, error: errorResult.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, request.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}
