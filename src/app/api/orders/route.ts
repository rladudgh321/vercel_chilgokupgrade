import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const [propTypesRes, buyTypesRes] = await Promise.all([
      supabase.from("property_types").select("id, name"),
      supabase.from("buy_types").select("id, name"),
    ]);

    if (propTypesRes.error || buyTypesRes.error) {
        const error = propTypesRes.error || buyTypesRes.error;
        Sentry.captureException(error);
        await notifySlack(error, req.url);
        return NextResponse.json({ message: "Error fetching data", error }, { status: 500 });
    }

    const propertyTypes = propTypesRes.data ?? [];
    const buyTypes = buyTypesRes.data ?? [];

    return NextResponse.json({ propertyTypes, buyTypes });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}
