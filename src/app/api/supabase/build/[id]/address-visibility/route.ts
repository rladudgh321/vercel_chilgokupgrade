import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

// body 유효성
const BodySchema = z.object({
  isAddressPublic: z.enum(["public", "private", "exclude"]),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ✅ Next 15: params는 Promise
    const { id } = await params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return NextResponse.json({ message: "유효하지 않은 ID" }, { status: 400 });
    }

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ message: "잘못된 요청", issues: parsed.error.issues }, { status: 400 });
    }

    const cookieStore = await cookies();      // ✅ Next 15: cookies()도 await
    const supabase = createClient(cookieStore);

    // ⚠️ 실제 스키마에 맞게 조정 (확실하지 않음: snake_case 일 수도 있음)
    const table = "Build";          // snake_case면 "builds"
    const deletedCol = "deletedAt"; // snake_case면 "deleted_at"

    // 존재 & 삭제여부 확인 (삭제된 건 업데이트 안 함)
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
    if (!found) return NextResponse.json({ message: "매물이 존재하지 않습니다." }, { status: 404 });
    if (found[deletedCol] != null) {
      return NextResponse.json({ message: "삭제된 매물은 수정할 수 없습니다." }, { status: 400 });
    }

    // 업데이트
    const { data: updated, error: updErr } = await supabase
      .from(table)
      .update({ isAddressPublic: parsed.data.isAddressPublic })
      .eq("id", idNum)
      .is(deletedCol, null) // 활성 것만
      .select("id, isAddressPublic")
      .maybeSingle();



    if (updErr) {
      Sentry.captureException(updErr);
      await notifySlack(updErr, req.url);
      return NextResponse.json({ message: updErr.message }, { status: 500 });
    }
    if (!updated) return NextResponse.json({ message: "업데이트 대상이 없습니다." }, { status: 409 });

    return NextResponse.json({
      message: "주소 공개여부 업데이트 완료",
      id: updated.id,
      isAddressPublic: updated.isAddressPublic,
    });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}
