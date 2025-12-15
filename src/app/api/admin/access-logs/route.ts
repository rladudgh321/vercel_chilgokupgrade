import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('access_logs')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to);

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({ data, totalPages });
  } catch (error: any) {
    Sentry.captureException(error);
    await notifySlack(error, req.url);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
