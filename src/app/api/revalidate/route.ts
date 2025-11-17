// src/app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { tag } = await request.json();
    if (!tag) {
      return NextResponse.json({ ok: false, error: { message: 'Tag is required' } }, { status: 400 });
    }
    revalidateTag(tag);
    revalidatePath('/')
    return NextResponse.json({ ok: true, message: `Tag ${tag} revalidated` });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: { message: e?.message ?? 'Unknown error' } }, { status: 500 });
  }
}
