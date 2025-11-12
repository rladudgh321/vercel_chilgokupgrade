import BuildDetailModalWithRouting from '@/app/components/root/BuildDetailModalWithRouting';
import { IBuild } from "@/app/interface/build";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

async function getBuild(id: number): Promise<IBuild> {
  const res = await fetch(`${BASE_URL}/api/supabase/build/${id}`, {
    next: { revalidate: 28800, tags: ["public", "build", `build:${id}`] }
  });
  if (!res.ok) throw new Error("Build fetch failed");
  return res.json();
}

export default async function ModalPage({ params }: { params: Promise<{ id: string }> }) {
  const buildId = Number((await params).id);
  const build = await getBuild(buildId); // ✅ 서버에서 await로 패칭
  return <BuildDetailModalWithRouting build={build} />;
}

/*
아래는 ISR
import BuildDetailModalWithRouting from '@/app/components/root/BuildDetailModalWithRouting';
import { IBuild } from "@/app/interface/build";
import notFound from '@/app/not-found';
import {createClient as createClientClient } from '@/app/utils/supabase/client';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  const supabase = createClientClient(); // 쿠키 없이 빌드 시점에서 안전
  const { data, error } = await supabase
    .from("Build")
    .select("id")
  console.log('createClient 클라이언트 작동할까?', data?.map((p) => ({ id: String(p.id) })));
  if (error || !data) return [];

  return data.map((p) => ({ id: String(p.id) }));
}

async function getBuild(id: number): Promise<IBuild> {
const cookieStore = await cookies(); // 요청 스코프 쿠키
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('Build')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) notFound();
  return data;
}

export default async function ModalPage({ params }: { params: Promise<{ id: string }> }) {
  const buildId = Number((await params).id);
  const build = await getBuild(buildId); // ✅ 서버에서 await로 패칭
  return <BuildDetailModalWithRouting build={build} />;
}

 */