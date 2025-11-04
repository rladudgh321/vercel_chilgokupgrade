import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

const CreatePostSchema = z.object({
  title: z.string().min(1, "제목은 필수입니다"),
  content: z.string().optional(),
  popupContent: z.string().optional(),
  representativeImage: z.string().optional(),
  registrationDate: z.string().optional(),
  manager: z.string().optional(),
  categoryId: z.number().optional(),
  isPopup: z.boolean().default(false),
  popupWidth: z.number().optional(),
  popupHeight: z.number().optional(),
  isPublished: z.boolean().default(true),
  popupType: z.enum(['IMAGE', 'CONTENT']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ message: "잘못된 요청 본문" }, { status: 400 });
    }

    const validatedData = CreatePostSchema.parse(raw);

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("BoardPost")
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "게시글이 성공적으로 생성되었습니다", 
      data 
    });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    if (e.name === 'ZodError') {
      return NextResponse.json({ 
        message: "입력 데이터가 올바르지 않습니다", 
        errors: e.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const publishedOnly = searchParams.get("publishedOnly") === "true";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("BoardPost")
      .select("*", { count: "exact" });

    if (publishedOnly) {
      query = query.eq("isPublished", true);
    }

    const { data, error, count } = await query
      .order('createdAt', { ascending: false })
      .range(from, to);

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}
