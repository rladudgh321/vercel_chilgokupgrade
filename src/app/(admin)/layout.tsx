import AdminLayoutClient from "./AdminLayoutClient";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/app/utils/metadata';
import { Suspense } from "react";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logoUrlPromise = getLogoUrl();

  return (
    <Suspense>
      <AdminLayoutClient logoUrlPromise={logoUrlPromise}>{children}</AdminLayoutClient>
    </Suspense>
  );
}
