import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";

export const runtime = "nodejs";
const TABLE = "ContactRequest";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from(TABLE)
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (error) return NextResponse.json({ ok: false, error }, { status: 400 });
    return NextResponse.json({ ok: true, data: data ?? [], count });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: { message: e?.message ?? "Unknown error" } }, { status: 500 });
  }
}


async function notifySlack(row: {
  author: string;
  contact: string;
  description: string;
  note: string | null;
  ipAddress: string;
  confirm: boolean;
  date: Date | string;
}) {
  const webhook = process.env.SLACK_WEBHOOK_CONTACT!;
  if (!webhook) return; // 설정 안 되어 있으면 조용히 패스(운영에 영향 X)

  // 보기 좋게 블록 메시지 구성
  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: "🆕 새로운 문의가 접수되었습니다", emoji: true },
    },
    { type: "divider" },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*작성자*\n${row.author || "-"}` },
        { type: "mrkdwn", text: `*연락처*\n${row.contact || "-"}` },
        { type: "mrkdwn", text: `*확인 여부*\n${row.confirm ? "✅ 확인" : "⏳ 미확인"}` },
        { type: "mrkdwn", text: `*IP*\n\`${row.ipAddress || "-"}\`` },
        { type: "mrkdwn", text: `*작성일*\n${new Date(row.date).toLocaleString("ko-KR")}` },
      ],
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*내용*\n${row.description || "-"}` },
    },
    ...(row.note
      ? [
          {
            type: "context",
            elements: [{ type: "mrkdwn", text: `*비고*: ${row.note}` }],
          },
        ]
      : []),
  ];

  const payload = {
    text: "새로운 문의가 접수되었습니다.", // Fallback
    blocks,
  };

  // 기본적으로 Next 15의 fetch는 no-store라 캐시 옵션 불필요
  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // 실패해도 API 응답은 막지 않도록 로깅만
    console.error("[Slack] webhook failed", await res.text());
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const body = await req.json();

    // 클라이언트 IP 추출(프록시 헤더 우선)
    const headers = req.headers;
    const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const realIp = headers.get("x-real-ip");
    const cfIp = headers.get("cf-connecting-ip");
    const vercelFwd = headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
    const flyIp = headers.get("fly-client-ip");
    const clientIp = forwardedFor || realIp || cfIp || vercelFwd || flyIp || "";

    const row = {
      confirm: !!body?.confirm,
      author: String(body?.author ?? "").trim(),
      contact: String(body?.contact ?? "").trim(),
      ipAddress: clientIp,
      description: String(body?.description ?? "").trim(),
      note: body?.note ? String(body.note) : null,
      date: body?.date ? new Date(body.date) : new Date(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase.from(TABLE).insert([row]).select();
    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    // 🔔 Slack 알림 (DB 성공 이후, 응답 지연 최소화를 원하면 await 제거 가능)
    await notifySlack(row);

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const body = await req.json();
    const id = Number(body?.id);
    if (!id) return NextResponse.json({ ok: false, error: { message: "id required" } }, { status: 400 });

    const patch: Record<string, any> = {};
    if (typeof body?.confirm === "boolean") patch.confirm = body.confirm;
    if (typeof body?.note === "string") patch.note = body.note;
    if (typeof body?.author === "string") patch.author = body.author;
    if (typeof body?.contact === "string") patch.contact = body.contact;
    if (typeof body?.ipAddress === "string") patch.ipAddress = body.ipAddress;
    if (typeof body?.description === "string") patch.description = body.description;
    if (body?.date) patch.date = new Date(body.date);
    patch.updatedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from(TABLE)
      .update(patch)
      .eq("id", id)
      .select();

    if (error) return NextResponse.json({ ok: false, error }, { status: 400 });
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: { message: e?.message ?? "Unknown error" } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) return NextResponse.json({ ok: false, error: { message: "id required" } }, { status: 400 });

    const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select();
    if (error) return NextResponse.json({ ok: false, error }, { status: 400 });
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: { message: e?.message ?? "Unknown error" } }, { status: 500 });
  }
}


