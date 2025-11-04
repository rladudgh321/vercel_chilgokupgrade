import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { workInfoSchema } from "@/app/(admin)/admin/websiteSettings/website-info/schema";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("WorkInfo")
      .select("*")
      .eq("id", "main")
      .single();

    if (error && error.code !== 'PGRST116') {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
      throw error
    }

    return NextResponse.json(data);
  } catch (error) {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
    return NextResponse.json({ error: "Failed to fetch data from Supabase" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const body = await request.json();

    const validatedData = workInfoSchema.parse(body);

    // DB가 관리하는 필드 제거 (createdAt/updatedAt은 서버에서 세팅)
    const { id, created_at, createdAt, updatedAt, ...rest } = validatedData;

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("WorkInfo")
      .upsert(
        {
          id: "main",
          ...rest,
          // 새로 생성될 수도, 갱신될 수도 있으니 updatedAt은 항상 세팅
          updatedAt: now,
          // createdAt은 DB DEFAULT가 있으면 생략 권장
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      throw error
    }
    return NextResponse.json(data);
  } catch (err: any) {
    Sentry.captureException(err);
      await notifySlack(err, request.url);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: err?.message ?? "Failed to save data to Supabase" },
      { status: 500 }
    );
  }
}