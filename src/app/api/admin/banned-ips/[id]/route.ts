import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from("BannedIp")
      .delete()
      .eq("id", (await params).id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: "IP unbanned successfully" });
  } catch (error) {
    console.error("Failed to unban IP:", error);
    return NextResponse.json({ error: "Failed to unban IP" }, { status: 500 });
  }
}