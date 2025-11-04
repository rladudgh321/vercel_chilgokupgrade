import BuildDetailModalWithRouting from '@/app/components/root/BuildDetailModalWithRouting';
import { IBuild } from "@/app/interface/build";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

async function getBuild(id: number): Promise<IBuild> {
  const res = await fetch(`${BASE_URL}/api/supabase/build/${id}`, {
    next: { revalidate: 28_800, tags: ["public", "build", `build:${id}`] }
  });
  if (!res.ok) throw new Error("Build fetch failed");
  return res.json();
}

export default async function ModalPage({ params }: { params: Promise<{ id: string }> }) {
  const buildId = Number((await params).id);
  const build = await getBuild(buildId); // ✅ 서버에서 await로 패칭
  return <BuildDetailModalWithRouting build={build} />;
}
