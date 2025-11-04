import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

// GET: 모든 배너 조회
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("WebViewBanner")
      .select("*")
      .order("order", { ascending: true, nullsLast: true });

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}

// POST: 새 배너 추가
export async function POST(request: NextRequest) {
  try {
    const { imageUrl, imageName } = await request.json();
    if (!imageUrl || !imageName) {
      return NextResponse.json(
        { ok: false, error: { message: "이미지 정보가 필요합니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("WebViewBanner")
      .insert([{ imageUrl, imageName }])
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "배너가 추가되었습니다.", data: data[0] },
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

// PUT: 배너 수정
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, imageUrl, imageName } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: { message: "ID가 필요합니다." } },
        { status: 400 }
      );
    }

    const updateData: {
      imageUrl?: string;
      imageName?: string;
    } = {};

    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (imageName !== undefined) updateData.imageName = imageName;
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { ok: false, error: { message: "수정할 내용이 없습니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("WebViewBanner")
      .update(updateData)
      .eq("id", Number(id))
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
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

// DELETE: 배너 삭제
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
      .from("WebViewBanner")
      .delete()
      .eq("id", Number(id));

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "배너가 삭제되었습니다." },
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