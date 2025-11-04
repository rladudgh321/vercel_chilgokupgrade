import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: categories, error } = await supabase
      .from('BoardCategory')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
      throw error;
    }

    return NextResponse.json(categories);
  } catch (error: any) {
    Sentry.captureException(error);
    await notifySlack(error, req.url);
    return NextResponse.json({ message: 'Error fetching categories', error: error.message }, { status: 500 });
  }
}