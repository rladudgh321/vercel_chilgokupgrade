import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { path, tag, tags } = body as {
      path?: string;
      tag?: string;
      tags?: string[];
    };

    console.log('[revalidate] called', { path, tag, tags });

    // 최소 하나의 무효화 대상이 있어야 함
    if (!path && !tag && !(Array.isArray(tags) && tags.length > 0)) {
      return NextResponse.json(
        { ok: false, error: { message: 'path, tag or tags are required' } },
        { status: 400 }
      );
    }

    if (tag) {
      console.log('[revalidate] revalidateTag single', tag);
      revalidateTag(tag);
    }

    if (Array.isArray(tags)) {
      for (const t of tags) {
        console.log('[revalidate] revalidateTag each', t);
        revalidateTag(t);
      }
    }

    if (path) {
      console.log('[revalidate] revalidatePath', path);
      // revalidatePath는 동기 호출(무효화만 함). 필요하면 await로 감싸도 무방.
      revalidatePath(path);
    }

    return NextResponse.json({ ok: true, message: 'Revalidation triggered' });
  } catch (e: any) {
    console.error('[revalidate] error', e);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? 'Unknown error' } },
      { status: 500 }
    );
  }
}
