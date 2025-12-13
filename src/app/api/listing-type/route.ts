import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";


// GET: 모든 매물 유형 조회
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. 모든 매물 유형 조회
    const { data: listingTypes, error: listingTypesError } = await supabase
      .from("ListingType")
      .select("*")
      .order("order", { ascending: true, nullsFirst: false });

    if (listingTypesError) {
      console.error("Error fetching listing types:", listingTypesError);
      throw new Error("Could not fetch listing types.");
    }

    // 2. 모든 매물(Build)의 listingTypeId 조회 (null이 아닌 것만)
    const { data: builds, error: buildsError } = await supabase
      .from("Build")
      .select("listingTypeId")
      .not("listingTypeId", "is", null);

    if (buildsError) {
      console.error("Error fetching builds for count:", buildsError);
      throw new Error("Could not fetch builds for count.");
    }

    // 3. 매물 유형별 개수 집계
    const counts = builds.reduce((acc, build) => {
      if (build.listingTypeId) {
        acc[build.listingTypeId] = (acc[build.listingTypeId] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    // 4. 매물 유형 데이터에 개수 정보 추가
    const dataWithCounts = listingTypes.map((type) => ({
      ...type,
      count: counts[type.id] || 0,
    }));

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

// POST: 새 매물 유형 추가
export async function POST(request: NextRequest) {
  try {
    const { label, imageUrl, imageName } = await request.json();
    if (!label) {
      return NextResponse.json(
        { ok: false, error: { message: "이름은 필수입니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("ListingType")
      .insert([{ name: label.trim(), imageUrl, imageName }])
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
        if (error.code === '23505') {
            return NextResponse.json(
                { ok: false, error: { message: "이미 존재하는 유형입니다." } },
                { status: 400 }
              );
        }
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "매물 유형이 추가되었습니다.", data: data[0] },
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

// PUT: 매물 유형 수정
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, newName, imageUrl, imageName } = body;

    if (!id) {
        return NextResponse.json({ ok: false, error: { message: "ID is required for update" } }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const updateData: { name?: string; imageUrl?: string; imageName?: string } = {};
    if (newName) {
        updateData.name = newName;
    }
    if (imageUrl !== undefined) {
        updateData.imageUrl = imageUrl;
    }
    if (imageName !== undefined) {
        updateData.imageName = imageName;
    }

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ ok: false, error: { message: "No fields to update" } }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("ListingType")
        .update(updateData)
        .eq("id", id)
        .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
        if (error.code === '23505') {
            return NextResponse.json(
                { ok: false, error: { message: "이미 존재하는 유형입니다." } },
                { status: 400 }
              );
        }
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: data[0] }, { status: 200 });

  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, request.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}

// DELETE: 매물 유형 삭제
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

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from("ListingType")
      .delete()
      .eq("id", id);

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "매물 유형이 삭제되었습니다." },
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