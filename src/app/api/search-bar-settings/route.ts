import { NextRequest, NextResponse } from "next/server";
import { getSearchBarSettings } from "@/lib/data";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(req: NextRequest) {
  try {
    const settings = await getSearchBarSettings();
    return NextResponse.json({ ok: true, data: settings });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}
