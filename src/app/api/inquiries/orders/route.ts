import { NextResponse } from 'next/server';
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const SLACK_WEBHOOK_CONTACT = process.env.SLACK_WEBHOOK_CONTACT!;

// Slack 알림 (웹훅만 사용)
async function notifySlackContact(payload: {
  title: string;
  color?: string;
  fields?: Array<{ title: string; value: string; short?: boolean }>;
}) {
  if (!SLACK_WEBHOOK_CONTACT) return;
  const body = {
    text: payload.title,
    attachments: [
      {
        color: payload.color ?? "#4A154B",
        text: payload.title,
        fields: payload.fields ?? [],
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };
  try {
    await fetch(SLACK_WEBHOOK_CONTACT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    // 알림 실패는 API 동작을 막지 않음
    console.error("[Slack webhook failed]", e);
  }
}

function getClientIp(headers: Headers) {
  const fwd = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = headers.get("x-real-ip");
  const cf = headers.get("cf-connecting-ip");
  const vercel = headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  const fly = headers.get("fly-client-ip");
  return fwd || real || cf || vercel || fly || "unknown";
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const body = await request.json();
    const {
      category,
      transactionType,
      author,
      propertyType,
      estimatedAmount,
      contact,
      region,
      title,
      description,
      note,
    } = body;

    const ipAddress = getClientIp(request.headers);

    const { data: newOrder, error } = await supabase
      .from("Order")
      .insert([
        {
          category,
          transactionType,
          author,
          propertyType,
          estimatedAmount,
          contact,
          ipAddress,
          region,
          title,
          description,
          note,
          updatedAt: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('#####', error);
      Sentry.captureException(error);
      await notifySlackContact({
        title: "🚨 주문 생성 실패",
        color: "#e01e5a",
        fields: [
          { title: "URL", value: request.url, short: false },
          { title: "Error", value: String(error.message ?? error), short: false },
        ],
      });
      return NextResponse.json({ error: "Error creating order" }, { status: 500 });
    }

    // 성공 알림
    await notifySlackContact({
      title: "🟣 새 주문 생성",
      fields: [
        { title: "작성자", value: String(author ?? "-"), short: true },
        { title: "연락처", value: String(contact ?? "-"), short: true },
        { title: "제목", value: String(title ?? "-"), short: false },
        { title: "IP", value: "`" + ipAddress + "`", short: true },
      ],
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    Sentry.captureException(error);
    await notifySlackContact({
      title: "🚨 주문 처리 중 예외",
      color: "#e01e5a",
      fields: [
        { title: "URL", value: request.url, short: false },
        { title: "Error", value: String(error?.message ?? error), short: false },
      ],
    });
    return NextResponse.json({ error: "Error creating order" }, { status: 500 });
  }
}


export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("Order")
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 });
    }
    
    return NextResponse.json({ data, count });

  } catch (error) {
    Sentry.captureException(error);
    await notifySlack(error, request.url);
    return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 });
  }
}