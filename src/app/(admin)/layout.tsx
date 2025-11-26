import AdminLayoutClient from "./AdminLayoutClient";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/app/utils/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: '관리자 페이지',
  description: '콘텐츠 및 설정을 관리하는 페이지입니다.',
});

async function getLogoUrl() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase
    .from("WorkInfo")
    .select("logoUrl")
    .eq("id", "main")
    .single();
  return data?.logoUrl || null;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logoUrl = await getLogoUrl();

  return (
    <AdminLayoutClient logoUrl={logoUrl}>{children}</AdminLayoutClient>
  );
}
