import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;                  // ✅ params는 Promise
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return NextResponse.json({ message: "유효하지 않은 ID" }, { status: 400 });
    }

    const cookieStore = await cookies();          // ✅ Next 15는 cookies()도 async
    const supabase = createClient(cookieStore);

    const table = "Build";                        // 스키마에 맞게 필요 시 변경 (예: "builds")
    const deletedCol = "deletedAt";               // snake_case면 "deleted_at"

    // 현재 삭제 상태 확인
    const { data: found, error: findErr } = await supabase
      .from(table)
      .select(`id, ${deletedCol}`)
      .eq("id", idNum)
      .maybeSingle();

    if (findErr) {
      Sentry.captureException(findErr);
      await notifySlack(findErr, req.url);
      return NextResponse.json({ message: findErr.message }, { status: 500 });
    }
    if (!found) return NextResponse.json({ message: "없는 매물" }, { status: 404 });
    if (found[deletedCol] == null) {
      return NextResponse.json({ message: "이미 활성 상태" }, { status: 400 });
    }

    // 복원
    const { data: updated, error: updErr } = await supabase
      .from(table)
      .update({ [deletedCol]: null })
      .eq("id", idNum)
      .not(deletedCol, "is", null) // 삭제된 것만 복원
      .select("id")
      .maybeSingle();

    if (updErr) {
      Sentry.captureException(updErr);
      await notifySlack(updErr, req.url);
      return NextResponse.json({ message: updErr.message }, { status: 500 });
    }
    if (!updated) return NextResponse.json({ message: "복원 대상 없음" }, { status: 409 });

    return NextResponse.json({
      message: "복원 완료",
      restoredId: updated.id,
      restoredAt: new Date().toISOString(),
    });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}
