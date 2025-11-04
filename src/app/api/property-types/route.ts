import { supabaseAdmin } from "@/app/utils/supabase/admin";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

// GET: 모든 매물 종류(propertyType) 조회
export async function GET(req: NextRequest) {
  try {
    const supabase = supabaseAdmin;

    // ThemeImage와 달리 이미지가 없을 수 있으므로, ThemeImage에서 동일 라벨의 이미지가 있으면 합쳐서 반환
    const { data: builds, error: buildError } = await supabase
      .from("Build")
      .select("propertyType")
      .not("propertyType", "is", null)
      .not("propertyType", "eq", "");

    if (buildError) {
      Sentry.captureException(buildError);
      await notifySlack(buildError, req.url);
      return NextResponse.json({ ok: false, error: buildError }, { status: 400 });
    }

    const uniqueTypes = Array.from(new Set((builds || []).map(b => b.propertyType).filter(Boolean))).sort();

    // ThemeImage 테이블에서 label이 propertyType과 일치하는 항목을 조인처럼 매핑
    const { data: themeImages, error } = await supabase
      .from("ThemeImage")
      .select("id,label,imageUrl,imageName")
      .is("deletedAt", null);

    const items = uniqueTypes.map((type, idx) => {
      const img = (themeImages || []).find(t => t.label === type);
      return {
        id: img?.id ?? idx + 1, // 이미지가 없으면 임시 id
        name: type as string,
        // property-types 페이지 전용: property-types prefix인 이미지만 사용
        imageUrl: img && typeof img.imageName === 'string' && img.imageName.startsWith('property-types') ? img.imageUrl : undefined,
        imageName: img && typeof img.imageName === 'string' && img.imageName.startsWith('property-types') ? img.imageName : undefined,
      };
    });

    if(error) {
      Sentry.captureException(buildError);
      await notifySlack(buildError, req.url);
    }

    return new NextResponse(JSON.stringify({ ok: true, data: items }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
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

// POST: 새 매물 종류 추가
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { label, imageUrl, imageName } = await request.json();

    if (!label || typeof label !== "string" || label.trim() === "") {
      return NextResponse.json(
        { ok: false, error: { message: "매물 종류는 필수입니다." } },
        { status: 400 }
      );
    }

    // 이미 존재 여부 체크
    const { data: existing } = await supabase
      .from("Build")
      .select("propertyType")
      .eq("propertyType", label.trim())
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { ok: false, error: { message: "이미 존재하는 매물 종류입니다." } },
        { status: 400 }
      );
    }

    // 더미 Build 레코드 생성 (labels API와 일관)
    const { error: insertError } = await supabase
      .from("Build")
      .insert([{
        propertyType: label.trim(),
        address: `샘플 주소 - ${label.trim()}`,
        visibility: false,
        title: `${label.trim()} 샘플 매물`
      }]);

    if (insertError) {
      return NextResponse.json({ ok: false, error: insertError }, { status: 400 });
    }

    // 이미지 정보가 있는 경우 ThemeImage에 upsert
    let createdImage: any = null;
    if (imageUrl) {
      // 동일 label의 ThemeImage가 있으면 갱신, 없으면 생성
      const { data: exists } = await supabase
        .from("ThemeImage")
        .select("id")
        .eq("label", label.trim())
        .is("deletedAt", null)
        .limit(1);

      if (exists && exists.length > 0) {
        const { data, error } = await supabase
          .from("ThemeImage")
          .update({ imageUrl: imageUrl.trim(), imageName: imageName ?? null })
          .eq("id", exists[0].id)
          .select();
        if (!error) createdImage = data?.[0] ?? null;
      } else {
        const { data, error } = await supabase
          .from("ThemeImage")
          .insert([{ label: label.trim(), imageUrl: imageUrl.trim(), imageName: imageName ?? null }])
          .select();
        if (!error) createdImage = data?.[0] ?? null;
      }
    }

    return new NextResponse(JSON.stringify({ ok: true, message: "매물 종류가 추가되었습니다.", data: { label: label.trim(), image: createdImage } }), {
      status: 201,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}

// PUT: 매물 종류명 수정 (Build.propertyType 일괄 변경)
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const body = await request.json();

    // 이미지 업데이트 케이스: id 기반 ThemeImage 수정
    if (body && (body.id || body.label) && (body.imageUrl !== undefined || body.imageName !== undefined)) {
      const updateData: any = {};
      if (body.imageUrl !== undefined) updateData.imageUrl = String(body.imageUrl).trim();
      if (body.imageName !== undefined) updateData.imageName = body.imageName ?? null;

      if (body.id) {
        const { data, error } = await supabase
          .from("ThemeImage")
          .update(updateData)
          .eq("id", body.id)
          .select();
        if (error) return NextResponse.json({ ok: false, error }, { status: 400 });
        return NextResponse.json({ ok: true, message: "이미지가 수정되었습니다.", data: data?.[0] ?? null });
      }

      if (body.label) {
        // label로 upsert
        const { data: exists } = await supabase
          .from("ThemeImage")
          .select("id")
          .eq("label", String(body.label).trim())
          .is("deletedAt", null)
          .limit(1);
        if (exists && exists.length > 0) {
          const { data, error } = await supabase
            .from("ThemeImage")
            .update(updateData)
            .eq("id", exists[0].id)
            .select();
          if (error) return NextResponse.json({ ok: false, error }, { status: 400 });
          return NextResponse.json({ ok: true, message: "이미지가 수정되었습니다.", data: data?.[0] ?? null });
        } else {
          const { data, error } = await supabase
            .from("ThemeImage")
            .insert([{ label: String(body.label).trim(), ...updateData }])
            .select();
          if (error) return NextResponse.json({ ok: false, error }, { status: 400 });
          return NextResponse.json({ ok: true, message: "이미지가 생성되었습니다.", data: data?.[0] ?? null });
        }
      }
    }

    // 이름 변경 케이스
    const { oldLabel, newLabel } = body;
    if (!oldLabel || !newLabel) {
      return NextResponse.json(
        { ok: false, error: { message: "기존/새 매물 종류가 필요합니다." } },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("Build")
      .update({ propertyType: newLabel.trim() })
      .eq("propertyType", oldLabel.trim());

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    // ThemeImage의 label도 함께 변경
    await supabase
      .from("ThemeImage")
      .update({ label: newLabel.trim() })
      .eq("label", oldLabel.trim());

    return new NextResponse(JSON.stringify({ ok: true, message: "매물 종류가 수정되었습니다." }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}

// DELETE: 매물 종류 삭제 (Build.propertyType null 처리)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { searchParams } = new URL(request.url);
    const label = searchParams.get("label");

    if (!label) {
      return NextResponse.json(
        { ok: false, error: { message: "삭제할 매물 종류가 필요합니다." } },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("Build")
      .update({ propertyType: null })
      .eq("propertyType", label.trim());

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    return new NextResponse(JSON.stringify({ ok: true, message: "매물 종류가 삭제되었습니다." }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: { message: e?.message ?? "Unknown error" } },
      { status: 500 }
    );
  }
}


