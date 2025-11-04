import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
    const { data, error } = await supabase
      .from('access_logs')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      Sentry.captureException(error);
    await notifySlack(error, req.url);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    Sentry.captureException(error);
    await notifySlack(error, req.url);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
