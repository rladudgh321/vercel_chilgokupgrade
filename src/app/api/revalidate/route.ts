// src/app/api/revalidate/route.ts
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function GET() {
  try {
    revalidateTag('public', "max");
    return NextResponse.json({ ok: true, message: `Revalidation successful` });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: { message: e?.message ?? 'Unknown error' } }, { status: 500 });
  }
}
