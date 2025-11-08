import { NextResponse } from 'next/server';
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  try {
    const { data: workInfo, error } = await supabase
      .from('work_info')
      .select('*')
      .single();

    if (error || !workInfo) {
      console.error('Failed to fetch work info:', error);
      return new NextResponse(JSON.stringify({ message: 'Work info not found' }), { status: 404 });
    }
    
    return NextResponse.json(workInfo);
  } catch (error) {
    console.error('Failed to fetch work info:', error);
    return new NextResponse(JSON.stringify({ message: 'Failed to fetch work info' }), { status: 500 });
  }
}

