import { supabaseAdmin } from "@/app/utils/supabase/admin";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

// GET: 모든 거래유형 조회
export async function GET(req: NextRequest) {
  try {
    const supabase = supabaseAdmin;

    const { data, error } = await supabase
      .from("BuyType")
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

// POST: 새 거래유형 추가
export async function POST(request: NextRequest) {
  try {
    const { label } = await request.json();
    if (!label || typeof label !== "string" || label.trim() === "") {
      return NextResponse.json(
        { ok: false, error: { message: "이름은 필수입니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("BuyType")
      .insert([{ name: label.trim() }])
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
        if (error.code === '23505') { // unique constraint violation
            return NextResponse.json(
                { ok: false, error: { message: "이미 존재하는 이름입니다." } },
                { status: 400 }
              );
        }
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "거래유형이 추가되었습니다.", data: data[0] },
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

// PUT: 거래유형 수정
export async function PUT(request: NextRequest) {
  try {
    const { id, newName } = await request.json();
    if (!id || !newName || typeof newName !== "string") {
      return NextResponse.json(
        { ok: false, error: { message: "ID와 새 이름이 필요합니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("BuyType")
      .update({ name: newName.trim() })
      .eq("id", id)
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
        if (error.code === '23505') { // unique constraint violation
            return NextResponse.json(
                { ok: false, error: { message: "이미 존재하는 이름입니다." } },
                { status: 400 }
              );
        }
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    if (data.length === 0) {
        return NextResponse.json(
            { ok: false, error: { message: "수정할 거래유형을 찾을 수 없습니다." } },
            { status: 404 }
          );
    }

    return NextResponse.json(
      { ok: true, message: "거래유형이 수정되었습니다.", data: data[0] },
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

// DELETE: 거래유형 삭제
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
      .from("BuyType")
      .delete()
      .eq("id", Number(id));

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "거래유형이 삭제되었습니다." },
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
