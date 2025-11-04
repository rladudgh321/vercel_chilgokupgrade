import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

const TABLE = "Build";
const ID_COL = "id";

// 한국 시간대 (UTC+9)로 날짜를 처리하는 함수
const toKoreanDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString();
};

const zDateISO = z.preprocess((v) => {
  if (v === "" || v === undefined || v === null) return null;
  
  // 문자열이 YYYY-MM-DD 형식인지 확인
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return toKoreanDateTime(v);
  }
  
  const d = new Date(v as any);
  return isNaN(d.getTime()) ? null : d.toISOString();
}, z.string().datetime().nullable());

const ConfirmDateSchema = z.object({
  confirmDate: zDateISO,
});

// PATCH: 확인일 갱신(오늘)
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return NextResponse.json({ message: "유효하지 않은 ID" }, { status: 400 });
    }

    // 오늘 날짜를 한국 시간대 기준으로 생성
    const now = new Date();
    const koreanTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    const today = koreanTime.toISOString().split('T')[0]; // YYYY-MM-DD 형식

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from(TABLE)
      .update({ 
        confirmDate: today
      })
      .eq(ID_COL, idNum)
      .select("id, confirmDate")
      .single();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ message: "업데이트 실패 또는 대상 없음" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "현장 확인일이 오늘로 갱신되었습니다", 
      id: data.id, 
      confirmDate: data.confirmDate 
    });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}

// PUT: 확인일 수정(사용자 입력)
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return NextResponse.json({ message: "유효하지 않은 ID" }, { status: 400 });
    }

    const raw = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ message: "잘못된 요청 본문" }, { status: 400 });
    }

    const { confirmDate } = ConfirmDateSchema.parse(raw);

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from(TABLE)
      .update({ 
        confirmDate
      })
      .eq(ID_COL, idNum)
      .select("id, confirmDate")
      .single();

    if (error) {
       Sentry.captureException(error);
      await notifySlack(error, req.url);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ message: "업데이트 실패 또는 대상 없음" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "현장 확인일 업데이트 완료", 
      id: data.id, 
      confirmDate: data.confirmDate 
    });
  } catch (e: any) {
     Sentry.captureException(e);
      await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}
