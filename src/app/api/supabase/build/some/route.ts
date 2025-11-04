import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

const BodySchema = z.object({
  ids: z.array(z.union([z.number().int(), z.string()]))
    .min(1, "삭제할 매물 ID가 최소 1개 필요합니다.")
    .transform(arr =>
      Array.from(
        new Set(
          arr.map(v => (typeof v === "string" ? Number(v) : v))
             .filter(n => Number.isInteger(n))
        )
      )
    ),
});

export async function DELETE(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ message: "잘못된 요청", issues: parsed.error.issues }, { status: 400 });
    }

    // ✅ 여기서 반드시 배열만 추출
    const ids: number[] = parsed.data.ids; // ← 객체 전체가 아니라 필드만!

    const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

    const table = "Build";
    const deletedCol = "deletedAt";

    // 조회
    const { data: rows, error: selErr } = await supabase
      .from(table)
      .select(`id, ${deletedCol}`)
      .in("id", ids); // ✅ number[]만 전달

    if (selErr) {
      Sentry.captureException(selErr);
      await notifySlack(selErr, req.url);
      return NextResponse.json({ message: "조회 중 오류", error: selErr.message }, { status: 500 });
    }

    const already = (rows ?? [])
      .filter((r: any) => r[deletedCol] !== null)
      .map((r: any) => r.id);
    if (already.length) {
      return NextResponse.json(
        { message: `이미 삭제된 매물: ${already.join(", ")}`, alreadyDeletedIds: already },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { data: updated, error: updErr } = await supabase
      .from(table)
      .update({ [deletedCol]: now })
      .in("id", ids)                 // ✅ number[]만 전달
      .is(deletedCol, null)
      .select("id");

    if (updErr) {
      Sentry.captureException(updErr);
      await notifySlack(updErr, req.url);
      return NextResponse.json({ message: "삭제 처리 중 오류", error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "소프트 삭제 완료",
      deletedCount: updated?.length ?? 0,
      deletedIds: (updated ?? []).map((r: any) => r.id),
      deletedAt: now,
    });
  } catch (e: any) {
    Sentry.captureException(e);
      await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}
