import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

// zod: visibility는 선택(없으면 현재값을 토글)
const BodySchema = z.object({
  visibility: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // ✅ Next 15: params는 Promise
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return NextResponse.json({ message: "유효하지 않은 ID" }, { status: 400 });
    }

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ message: "잘못된 요청", issues: parsed.error.issues }, { status: 400 });
    }

    const cookieStore = await cookies();                // ✅ Next 15: cookies()도 async
    const supabase = createClient(cookieStore);

    // ⚠️ 실제 스키마에 맞게 테이블/컬럼명 확인
    const table = "Build";           // snake_case면 "builds"
    const deletedCol = "deletedAt";  // snake_case면 "deleted_at"

    // 1) 토글 대상 레코드 조회 (삭제되지 않은 것만)
    const { data: found, error: findErr } = await supabase
      .from(table)
      .select(`id, visibility, ${deletedCol}`)
      .eq("id", idNum)
      .is(deletedCol, null) // 삭제되지 않은 것만
      .maybeSingle();

    if (findErr) {
      Sentry.captureException(findErr);
      await notifySlack(findErr, req.url);
      return NextResponse.json({ message: findErr.message }, { status: 500 });
    }
    if (!found) {
      return NextResponse.json({ message: "해당 매물이 없거나 이미 삭제되었습니다." }, { status: 404 });
    }

    const nextVisibility =
      typeof parsed.data.visibility === "boolean" ? parsed.data.visibility : !Boolean(found.visibility);

    // 2) 업데이트
    const { data: updated, error: updErr } = await supabase
      .from(table)
      .update({ visibility: nextVisibility })
      .eq("id", idNum)
      .is(deletedCol, null)
      .select("id, visibility")
      .maybeSingle();

    if (updErr) {
      Sentry.captureException(updErr);
      await notifySlack(updErr, req.url);
      return NextResponse.json({ message: updErr.message }, { status: 500 });
    }
    if (!updated) {
      return NextResponse.json({ message: "업데이트 대상이 없습니다." }, { status: 409 });
    }

    return NextResponse.json({
      message: "토글 완료",
      id: updated.id,
      visibility: updated.visibility,
    });
  } catch (e: any) {
    Sentry.captureException(e);
      await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}
