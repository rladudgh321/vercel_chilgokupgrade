import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. 모든 BuyType 조회
    const { data: buyTypes, error: buyTypesError } = await supabase
      .from("BuyType")
      .select("*")
      .order("order", { ascending: true, nullsFirst: false });

    if (buyTypesError) {
      console.error("Error fetching buy types:", buyTypesError);
      throw new Error("Could not fetch buy types.");
    }

    // 2. 모든 Build에서 buyTypeId 조회
    const { data: builds, error: buildsError } = await supabase
      .from("Build")
      .select("buyTypeId")
      .not("buyTypeId", "is", null);

    if (buildsError) {
      console.error("Error fetching builds for count:", buildsError);
      throw new Error("Could not fetch builds for count.");
    }

    // 3. buyTypeId별 개수 집계
    const counts = builds.reduce((acc, build) => {
      if (build.buyTypeId) {
        acc[build.buyTypeId] = (acc[build.buyTypeId] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    // 4. BuyType 데이터에 개수 정보 추가
    const dataWithCounts = buyTypes.map((type) => ({
      ...type,
      count: counts[type.id] || 0,
    }));

    return NextResponse.json({ ok: true, data: dataWithCounts });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}
