import { Suspense } from 'react';
import type { Metadata } from "next";
import Header, { HeaderProps } from "../layout/app/Header";
import Footer from "../layout/app/Footer";
import SnsIcon, { SnsSetting } from "@/app/components/SnsIcon";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

export async function getWorkInfo(): Promise<{data?: HeaderProps; ok: boolean;}> {
  const response = await fetch(`${BASE_URL}/api/workinfo`, { cache: 'force-cache', next: { tags: ["public", "workInfo"] } });
  if (!response.ok) {
    console.error('Error fetching posts:', await response.text());
    return { ok: false };
  }
  return response.json();
}

export async function getSnsSettings(): Promise<SnsSetting[]> {
  const res = await fetch(`${BASE_URL}/api/sns-settings`, { cache: 'force-cache', next: { tags: ["public", "sns-settings"] } });
  if (!res.ok) throw new Error("Network response was not ok");
  const data = await res.json();
  return data.data;
}

import { generatePageMetadata } from '@/app/utils/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: '칠곡군 부동산 정보',
  description: '칠곡군의 최신 부동산 매물, 아파트, 상가, 원룸 정보를 확인하세요.',
});

export default function AppLayout({
  children, modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
   const headerPromise = getWorkInfo();
   const snsSettingsPromise = getSnsSettings();
  return (
    <>
      <Suspense>
        <Header headerPromise={headerPromise} />
      </Suspense>
      <main className="flex-grow">{children}</main>
      <Suspense>
       <SnsIcon snsSettingsPromise={snsSettingsPromise} />
      </Suspense>
      <Suspense>
        <Footer headerPromise={headerPromise} />
      </Suspense>
      {modal}
    </>
  );
}
