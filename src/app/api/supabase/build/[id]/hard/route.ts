import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;                 // ✅ params await
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return NextResponse.json({ message: "유효하지 않은 ID" }, { status: 400 });
    }

    const cookieStore = await cookies();         // ✅ cookies() await
    const supabase = createClient(cookieStore);

    const table = "Build";                       // 필요 시 "builds"로 변경

    const { data: deleted, error } = await supabase
      .from(table)
      .delete()
      .eq("id", idNum)
      .select("id")
      .maybeSingle();

    if (error) {
       Sentry.captureException(error);
        await notifySlack(error, req.url);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
    if (!deleted) return NextResponse.json({ message: "삭제 대상 없음" }, { status: 404 });

    return NextResponse.json({ message: "영구 삭제 완료", deletedId: deleted.id });
  } catch (e: any) {
    Sentry.captureException(e);
      await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}
