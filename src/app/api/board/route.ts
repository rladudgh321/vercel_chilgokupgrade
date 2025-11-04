import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from('BoardPost')
      .select('id, title, content, createdAt, registrationDate, BoardCategory(name)')
      .eq('isPublished', true)
      .order('createdAt', { ascending: false });
      
    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
      return NextResponse.json({ message: "Error fetching posts", error }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}
