import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";
import { z } from "zod";

const UpdatePostSchema = z.object({
  title: z.string().min(1, "제목은 필수입니다"),
  content: z.string().optional(),
  popupContent: z.string().optional(),
  representativeImage: z.string().optional().nullable(),
  registrationDate: z.string().optional(),
  manager: z.string().optional(),
  categoryId: z.number().optional(),
  isPopup: z.boolean().default(false),
  popupWidth: z.number().optional(),
  popupHeight: z.number().optional(),
  isPublished: z.boolean().default(true),
  popupType: z.enum(['IMAGE', 'CONTENT']).optional(),
  isAnnouncement: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: post, error } = await supabase
      .from("BoardPost")
      .select("*")
      .eq("id", Number(params.id))
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const raw = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ message: "잘못된 요청 본문" }, { status: 400 });
    }

    const validatedData = UpdatePostSchema.parse(raw);

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("BoardPost")
      .update(validatedData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "게시글이 성공적으로 수정되었습니다", 
      data 
    });
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ 
        message: "입력 데이터가 올바르지 않습니다", 
        errors: e.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from("BoardPost")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "게시글이 성공적으로 삭제되었습니다",
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}