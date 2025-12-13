import { NextRequest, NextResponse } from "next/server";

import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

// GET: 모든 면적 조회
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: areaPresets, error: areaPresetsError } = await supabase.from("AreaPreset").select("*").order("id", { ascending: true });
    if (areaPresetsError) {
      throw areaPresetsError;
    }

    const { data: builds, error: buildsError } = await supabase.from("Build").select("actualArea, supplyArea, landArea, buildingArea, totalArea, NetLeasableArea").is("deletedAt", null).eq("visibility", true);
    if (buildsError) {
      throw buildsError;
    }

    const PYEONG_TO_SQM = 3.305785;
    const areaColumns = ['actualArea', 'supplyArea', 'landArea', 'buildingArea', 'totalArea', 'NetLeasableArea'];

    const dataWithCounts = areaPresets.map(preset => {
      const cleanedAreaRange = preset.name.replace(/평/g, "").trim();
      let min_sqm: number | null = null;
      let max_sqm: number | null = null;

      if (cleanedAreaRange.includes("~")) {
          const [minStr, maxStr] = cleanedAreaRange.split("~");
          const min = Number(minStr.trim());
          const max = Number(maxStr.trim());
          if (!isNaN(min)) min_sqm = min * PYEONG_TO_SQM;
          if (!isNaN(max)) max_sqm = max * PYEONG_TO_SQM;
      } else if (cleanedAreaRange.includes("이상")) {
          const min = Number(cleanedAreaRange.replace("이상", "").trim());
          if (!isNaN(min)) min_sqm = min * PYEONG_TO_SQM;
      } else if (cleanedAreaRange.includes("이하")) {
          const max = Number(cleanedAreaRange.replace("이하", "").trim());
          if (!isNaN(max)) max_sqm = max * PYEONG_TO_SQM;
      }

      const count = builds.filter(build => {
        return areaColumns.some(col => {
          const area = build[col] as number | null;
          if (area === null || area === undefined) return false;

          if (min_sqm !== null && max_sqm !== null) {
            return area >= min_sqm && area <= max_sqm;
          } else if (min_sqm !== null) {
            return area >= min_sqm;
          } else if (max_sqm !== null) {
            return area <= max_sqm;
          }
          return false;
        });
      }).length;

      return {
        ...preset,
        count
      };
    });

    return NextResponse.json({ ok: true, data: dataWithCounts }, { status: 200 });
  } catch (e: any) {
    Sentry.captureException(e);
          await notifySlack(e, req.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}

// POST: 새 면적 추가
export async function POST(request: NextRequest) {
  try {
    const { label } = await request.json();
    if (!label || typeof label !== "string" || label.trim() === "") {
      return NextResponse.json(
        { ok: false, error: { message: "면적은 필수입니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("AreaPreset")
      .insert([{ name: label.trim() }])
      .select();

    if (error) {
      Sentry.captureException(error);
          await notifySlack(error, request.url);
        if (error.code === '23505') { // unique constraint violation
            return NextResponse.json(
                { ok: false, error: { message: "이미 존재하는 면적입니다." } },
                { status: 400 }
              );
        }
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "면적이 추가되었습니다.", data: data[0] },
      { status: 201 }
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

// PUT: 면적 수정
export async function PUT(request: NextRequest) {
  try {
    const { id, newName } = await request.json();
    if (!id || !newName || typeof newName !== "string") {
      return NextResponse.json(
        { ok: false, error: { message: "ID와 새 면적이 필요합니다." } },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { ok: false, error: { message: "ID는 유효한 숫자여야 합니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("AreaPreset")
      .update({ name: newName.trim() })
      .eq("id", parsedId)
      .select();

    if (error) {
      Sentry.captureException(error);
          await notifySlack(error, request.url);
        if (error.code === '23505') { // unique constraint violation
            return NextResponse.json(
                { ok: false, error: { message: "이미 존재하는 면적입니다." } },
                { status: 400 }
              );
        }
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "면적이 수정되었습니다.", data: data[0] },
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

// DELETE: 면적 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { ok: false, error: { message: "삭제할 ID가 필요합니다." } },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { ok: false, error: { message: "ID는 유효한 숫자여야 합니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from("AreaPreset")
      .delete()
      .eq("id", parsedId);

    if (error) {
      Sentry.captureException(error);
          await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "면적이 삭제되었습니다." },
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
