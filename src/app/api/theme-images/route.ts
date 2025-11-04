import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

// GET: 모든 테마 이미지 조회
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("ThemeImage")
      .select("*")
      .is("deletedAt", null)
      .order("order", { ascending: true, nullsLast: true });

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    // theme-settings 전용: theme-images prefix로 업로드된 항목만 노출
    const filtered = (data || []).filter((row: any) => {
      const name = row?.imageName ?? '';
      return typeof name === 'string' && name.startsWith('theme-images');
    });

    return new NextResponse(JSON.stringify({
      ok: true,
      data: filtered
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

// POST: 새 테마 이미지 추가
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { label, imageUrl, imageName } = await request.json();

    if (!label || !imageUrl) {
      return NextResponse.json(
        { ok: false, error: { message: "라벨과 이미지 URL은 필수입니다." } },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("ThemeImage")
      .insert([{
        label: label.trim(),
        imageUrl: imageUrl.trim(),
        imageName: imageName?.trim() || null,
        isActive: true
      }])
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return new NextResponse(JSON.stringify({
      ok: true,
      message: "테마 이미지가 추가되었습니다.",
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

// PUT: 테마 이미지 수정
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { id, newName, label, imageUrl, imageName, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { ok: false, error: { message: "ID는 필수입니다." } },
        { status: 400 }
      );
    }

    const updateData: any = {};
    const nameToUpdate = newName || label;
    if (nameToUpdate !== undefined) updateData.label = nameToUpdate.trim();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
    if (imageName !== undefined) updateData.imageName = imageName?.trim() || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ ok: false, error: { message: "수정할 필드가 없습니다." } }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ThemeImage")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return new NextResponse(JSON.stringify({
      ok: true,
      message: "테마 이미지가 수정되었습니다.",
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

// DELETE: 테마 이미지 삭제
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
      .from("ThemeImage")
      .update({ deletedAt: new Date().toISOString() })
      .eq("id", parseInt(id));

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return new NextResponse(JSON.stringify({
      ok: true,
      message: "테마 이미지가 삭제되었습니다."
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
