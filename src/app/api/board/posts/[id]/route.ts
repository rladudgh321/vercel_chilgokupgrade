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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
        return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

    const { data: post, error } = await supabase
      .from("BoardPost")
      .select("*")
      .eq("id", postId)
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
        return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

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
      .eq("id", postId)
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
        return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from("BoardPost")
      .delete()
      .eq("id", postId);

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