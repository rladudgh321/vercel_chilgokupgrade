// src/app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag, tags } = body;
 
    if (!tag && !tags) {
      return NextResponse.json({ ok: false, error: { message: 'Tag or tags are required' } }, { status: 400 });
    }

    if (tag) {
      revalidateTag(tag);
    }

    if (tags && Array.isArray(tags)) {
      tags.forEach((t: string) => revalidateTag(t));
    }

    revalidatePath('/');

    return NextResponse.json({ ok: true, message: `Revalidation successful` });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: { message: e?.message ?? 'Unknown error' } }, { status: 500 });
  }
}
