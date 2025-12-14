import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
// GET: 로고 정보 조회
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("WorkInfo")
      .select("logoUrl, logoName")
      .eq("id", "main")
      .single();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
      // If the main row doesn't exist, it might not be an error
      if (error.code === 'PGRST116') { 
        return NextResponse.json({ ok: true, data: null }, { status: 200 });
      }
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

// PUT: 로고 정보 수정
export async function PUT(request: NextRequest) {
  try {
    const { logoUrl, logoName } = await request.json();
    const updateData: { logoUrl?: string; logoName?: string; updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (logoUrl) {
      updateData.logoUrl = logoUrl;
    }
    if (logoName) {
      updateData.logoName = logoName;
    }

    if (!logoUrl && !logoName) {
      return NextResponse.json(
        { ok: false, error: { message: "로고 정보가 필요합니다." } },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("WorkInfo")
      .update(updateData)
      .eq("id", "main")
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return NextResponse.json(
      { ok: true, message: "로고가 수정되었습니다.", data: data[0] },
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
