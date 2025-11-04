// src/app/api/admin/cleanup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

// 세션 쿠키 기반 Supabase 클라이언트
async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

// type → 테이블명 매핑 (필요시 수정)
function tableOf(type: string) {
  if (type === "contact-request") return "ContactRequest";
  if (type === "order") return "Order"; // 실제 이름이 Orders라면 "Orders"로 변경
  return null;
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { type, itemId, ipAddress } = await req.json();

    if (!type) {
      return NextResponse.json(
        { success: false, message: "Type is required (contact-request or order)" },
        { status: 400 }
      );
    }

    const table = tableOf(type);
    if (!table) {
      return NextResponse.json({ success: false, message: "Invalid type" }, { status: 400 });
    }

    // 1) 단건 삭제: id 기준
    if (itemId) {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq("id", itemId)
        .select()
        .maybeSingle();

      if (error) {
        Sentry.captureException(error);
            await notifySlack(error, req.url);
        return NextResponse.json(
          { success: false, message: "Failed to delete item" },
          { status: 500 }
        );
      }

      if (!data) {
        // 이미 없거나 잘못된 id
        return NextResponse.json(
          { success: false, message: "Item not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, message: "Item deleted successfully", data });
    }

    // 2) 다건 삭제: ipAddress 기준
    if (ipAddress) {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq("ipAddress", ipAddress)
        .select("id"); // 삭제된 id 목록만 받아와도 충분

      if (error) {
            Sentry.captureException(error);
            await notifySlack(error, req.url);
        return NextResponse.json(
          { success: false, message: "Failed to remove items by IP" },
          { status: 500 }
        );
      }

      const deletedCount = Array.isArray(data) ? data.length : 0;
      return NextResponse.json({
        success: true,
        message: `All ${type}s from IP ${ipAddress} deleted successfully`,
        deletedCount,
      });
    }

    return NextResponse.json(
      { success: false, message: "itemId or ipAddress is required" },
      { status: 400 }
    );
  } catch (error) {
        Sentry.captureException(error);
        await notifySlack(error, req.url);
    return NextResponse.json(
      { success: false, message: "Failed to perform cleanup" },
      { status: 500 }
    );
  }
}
