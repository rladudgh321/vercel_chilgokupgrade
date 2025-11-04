import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
// GET: 모든 카테고리 조회
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("BoardCategory")
      .select("*")
      .order("order", { ascending: true, nullsFirst: false });

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

// POST: 새 카테고리 추가
export async function POST(request: NextRequest) {
  try {
    const { label } = await request.json();
    if (!label || typeof label !== "string" || label.trim() === "") {
      return NextResponse.json(
        { ok: false, error: { message: "카테고리 이름은 필수입니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("BoardCategory")
      .insert([{ name: label.trim() }])
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
        if (error.code === '23505') { // unique constraint violation
            return NextResponse.json(
                { ok: false, error: { message: "이미 존재하는 카테고리입니다." } },
                { status: 400 }
              );
        }
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "카테고리가 추가되었습니다.", data: data[0] },
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

// PUT: 카테고리 수정
export async function PUT(request: NextRequest) {
  try {
    const { id, newName: name } = await request.json();
    if (!id || !name || typeof name !== "string") {
      return NextResponse.json(
        { ok: false, error: { message: "ID와 새 카테고리 이름이 필요합니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("BoardCategory")
      .update({ name: name.trim() })
      .eq("id", id)
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
        if (error.code === '23505') { // unique constraint violation
            return NextResponse.json(
                { ok: false, error: { message: "이미 존재하는 카테고리입니다." } },
                { status: 400 }
              );
        }
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "카테고리가 수정되었습니다.", data: data[0] },
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

// DELETE: 카테고리 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { ok: false, error: { message: "삭제할 카테고리 ID가 필요합니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.from("BoardCategory").delete().eq("id", id);

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "카테고리가 삭제되었습니다." },
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