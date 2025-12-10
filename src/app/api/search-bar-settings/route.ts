import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: settings, error } = await supabase
      .from("SearchBarSetting")
      .select("*")
      .eq("id", 1)
      .single();
    if (error && error.code !== 'PGRST116') { // PGRST116 = 'exact-single-row-not-found'
        console.error("Error fetching search bar settings:", error);
        throw new Error("Could not fetch search bar settings.");
    }
    const { id, updatedAt, ...rest } = settings;

    return NextResponse.json({ ok: true, data: rest });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}
