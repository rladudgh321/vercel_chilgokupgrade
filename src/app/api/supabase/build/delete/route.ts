import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limitIn = parseInt(searchParams.get("limit") ?? "10", 10);
    const limit = Math.min(100, Math.max(1, limitIn || 10));
    const keywordRaw = searchParams.get("keyword")?.trim() ?? "";
    const keyword = keywordRaw.length ? keywordRaw : undefined;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // ⚠️ 스키마에 맞게 필요 시 조정 (확실하지 않음)
    const table = "Build";          // snake_case라면 "builds"
    const deletedCol = "deletedAt"; // snake_case라면 "deleted_at"
    const createdCol = "createdAt"; // snake_case라면 "created_at"

    // 기본 쿼리: 항상 "삭제된 것만"
    let q = supabase
      .from(table)
      .select("*, buyType:BuyType(name)", { count: "exact" })
      .not(deletedCol, "is", null)               // ✅ deletedAt IS NOT NULL
      .order(createdCol, { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);

    // 검색: 숫자면 id, 아니면 address ILIKE
    if (keyword) {
      if (/^\d+$/.test(keyword)) q = q.eq("id", Number(keyword));
      else q = q.ilike("address", `%${keyword}%`);
    }

    const { data, error, count } = await q;

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    const processedData = data.map((d: any) => ({
      ...d,
      buyType: d.buyType?.name,
    }));

    return NextResponse.json({
      ok: true,
      totalItems: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
      currentPage: page,
      data: processedData ?? [],
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
