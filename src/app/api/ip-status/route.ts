import { supabaseAdmin } from "@/app/utils/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";

  if (!supabaseAdmin) {
    console.error("Supabase admin client not initialized. Cannot check IP status.");
    // Return a non-banned status if the server is misconfigured, to avoid blocking legitimate users.
    return NextResponse.json({ isBanned: false });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("BannedIp")
      .select("id")
      .eq("ipAddress", ip)
      .single();

    if (error && error.code !== "PGRST116") {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      throw error;
    }

    // data가 존재하면 true(차단해야함), 존재 안하면 false
    return NextResponse.json({ isBanned: !!data });

  } catch (error) {
    Sentry.captureException(error);
    await notifySlack(error, request.url);
    console.error("Error checking IP status:", error);
    // Return a non-banned status in case of database error.
    return NextResponse.json({ isBanned: false });
  }
}
