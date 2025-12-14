import { NextRequest, NextResponse } from "next/server";

import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

// GET: 모든 방 옵션 조회
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. 모든 RoomOption 조회
    const { data: roomOptions, error: roomOptionsError } = await supabase
      .from("RoomOption")
      .select("*")
      .order("order", { ascending: true });

    if (roomOptionsError) {
      throw roomOptionsError;
    }

    // 2. 모든 Build에서 roomOptionId 조회
    const { data: builds, error: buildsError } = await supabase
      .from("Build")
      .select("roomOptionId")
      .not("roomOptionId", "is", null)
      .eq("visibility", true)
      .is("deletedAt", null);

    if (buildsError) {
      throw buildsError;
    }

    // 3. roomOptionId별 개수 집계
    const counts = builds.reduce((acc, build) => {
      if (build.roomOptionId) {
        acc[build.roomOptionId] = (acc[build.roomOptionId] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    // 4. RoomOption 데이터에 개수 정보 추가
    const dataWithCounts = roomOptions.map((option) => ({
      ...option,
      count: counts[option.id] || 0,
    }));

    return new NextResponse(JSON.stringify({
      ok: true,
      data: dataWithCounts
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}

// POST: 새 방 옵션 추가
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { label, imageUrl, imageName } = await request.json();

    if (!label) {
      return NextResponse.json(
        { ok: false, error: { message: "이름은 필수입니다." } },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("RoomOption")
      .insert([{
        name: label.trim(),
        imageUrl: imageUrl?.trim(),
        imageName: imageName?.trim(),
      }])
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return new NextResponse(JSON.stringify({
      ok: true,
      message: "방 옵션이 추가되었습니다.",
      data: data?.[0]
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, request.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}

// PUT: 방 옵션 수정
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { id, newName, imageUrl, imageName } = await request.json();

    if (!id) {
      return NextResponse.json(
        { ok: false, error: { message: "ID는 필수입니다." } },
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

    const updateData: any = {};
    if (newName !== undefined) updateData.name = newName.trim();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
    if (imageName !== undefined) updateData.imageName = imageName?.trim() || null;

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ ok: false, error: { message: "수정할 필드가 없습니다." } }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("RoomOption")
      .update(updateData)
      .eq("id", parsedId)
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return new NextResponse(JSON.stringify({
      ok: true,
      message: "방 옵션이 수정되었습니다.",
      data: data?.[0]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, request.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}

// DELETE: 방 옵션 삭제
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: { message: "ID는 필수입니다." } },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("RoomOption")
      .delete()
      .eq("id", parseInt(id));

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return new NextResponse(JSON.stringify({
      ok: true,
      message: "방 옵션이 삭제되었습니다."
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, request.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}