import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. 활성 상태인 모든 테마 이미지 조회
    const { data: themeImages, error: themeImagesError } = await supabase
      .from("ThemeImage")
      .select("*")
      .is("deletedAt", null)
      .eq("isActive", true)
      .order("order", { ascending: true, nullsFirst: false });

    if (themeImagesError) {
      console.error("Error fetching theme images:", themeImagesError);
      throw new Error("Could not fetch theme images.");
    }

    // 2. 모든 Build에서 themes 배열 조회
    const { data: builds, error: buildsError } = await supabase
      .from("Build")
      .select("themes");

    if (buildsError) {
      console.error("Error fetching builds for theme count:", buildsError);
      throw new Error("Could not fetch builds for theme count.");
    }

    // 3. 테마별 개수 집계
    const counts: Record<string, number> = {};
    if (builds) {
      for (const build of builds) {
        if (build.themes) {
          for (const themeLabel of build.themes) {
            counts[themeLabel] = (counts[themeLabel] || 0) + 1;
          }
        }
      }
    }
    
    // 4. 테마 이미지 데이터에 개수 정보 추가
    const dataWithCounts = themeImages.map((theme) => ({
      ...theme,
      count: counts[theme.label] || 0,
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