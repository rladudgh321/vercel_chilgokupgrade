
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("BannedIp")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      throw error;
    }
    return NextResponse.json(data || []);
  } catch (error) {
    Sentry.captureException(error);
    await notifySlack(error, req.url);
    return NextResponse.json({ error: "Failed to fetch banned IPs" }, { status: 500 });
  }
}
