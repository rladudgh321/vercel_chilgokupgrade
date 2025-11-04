import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { notifySlack } from '@/app/utils/sentry/slack';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Next 15 동적 파라미터 await 필요
) {
  const postId = parseInt((await params).id, 10);

  if (!Number.isFinite(postId)) {
    return NextResponse.json(
      { ok: false, error: { message: 'ID가 누락되었거나 잘못되었습니다.' } },
      { status: 400 }
    );
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      Sentry.captureException(authError);
      await notifySlack(authError, request.url);
      return NextResponse.json(
        { ok: false, error: { message: '인증되지 않은 사용자입니다.' } },
        { status: 401 }
      );
    }

    // ✅ Prisma의 raw 실행 대신 Supabase RPC 호출
    // increment_post_views(p_id integer/bigint) 형태라고 가정
    const { error: rpcError } = await supabase.rpc('increment_post_views', { p_id: postId });

    if (rpcError) {
      Sentry.captureException(rpcError);
      await notifySlack(rpcError, request.url);
      return NextResponse.json(
        { ok: false, error: { message: rpcError.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: '조회수가 1 증가했습니다.' });
  } catch (error: any) {
    Sentry.captureException(error);
    await notifySlack(error, request.url);
    return NextResponse.json(
      { ok: false, error: { message: error?.message ?? '서버 오류' } },
      { status: 500 }
    );
  }
}
