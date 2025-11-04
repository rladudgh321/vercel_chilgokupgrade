import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const id = (await params).id;

    const { data, error } = await supabase
      .from('BoardPost')
      .select('id, title, content, createdAt, registrationDate, BoardCategory(name)')
      .eq('id', id)
      .single();
      
    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
      return NextResponse.json({ message: "Error fetching post", error }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}
