import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET() {

  revalidateTag('public', "max");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}