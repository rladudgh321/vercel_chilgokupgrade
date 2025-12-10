import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

     const { data, error } = await supabase
      .from("ThemeImage")
      .select("*")
      .is("deletedAt", null)
      .order("order", { ascending: true, nullsFirst: false });

    if (error) {
        console.error("Error fetching theme images:", error);
        throw new Error("Could not fetch theme images.");
    }

    return NextResponse.json({ ok: true, data: (data || []).filter((row: any) => {
      const name = row?.imageName ?? '';
      return typeof name === 'string' && name.startsWith('theme-images');
    }) });

  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}