import { NextRequest, NextResponse } from "next/server";
import { getBathroomOptions } from "@/lib/data"; // Import the cached function
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

// GET: 모든 화장실 옵션 조회
export async function GET(req: NextRequest) {
  try {
    const data = await getBathroomOptions(); // Call the cached function

    return new NextResponse(JSON.stringify({
      ok: true,
      data: data
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}

// POST: 새 화장실 옵션 추가
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { label, imageUrl, imageName } = await request.json();

    if (!label) {
      return NextResponse.json(
        { ok: false, error: { message: "이름은 필수입니다." } },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("BathroomOption")
      .insert([{
        name: label.trim(),
        imageUrl: imageUrl?.trim(),
        imageName: imageName?.trim(),
      }])
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return new NextResponse(JSON.stringify({
      ok: true,
      message: "화장실 옵션이 추가되었습니다.",
      data: data?.[0]
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, request.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}

// PUT: 화장실 옵션 수정
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { id, newName, imageUrl, imageName } = await request.json();

    if (!id) {
      return NextResponse.json(
        { ok: false, error: { message: "ID는 필수입니다." } },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { ok: false, error: { message: "ID는 유효한 숫자여야 합니다." } },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (newName !== undefined) updateData.name = newName.trim();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
    if (imageName !== undefined) updateData.imageName = imageName?.trim() || null;

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ ok: false, error: { message: "수정할 필드가 없습니다." } }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("BathroomOption")
      .update(updateData)
      .eq("id", parsedId)
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return new NextResponse(JSON.stringify({
      ok: true,
      message: "화장실 옵션이 수정되었습니다.",
      data: data?.[0]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, request.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}

// DELETE: 화장실 옵션 삭제
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: { message: "ID는 필수입니다." } },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("BathroomOption")
      .delete()
      .eq("id", parseInt(id));

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return new NextResponse(JSON.stringify({
      ok: true,
      message: "화장실 옵션이 삭제되었습니다."
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, request.url);
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}