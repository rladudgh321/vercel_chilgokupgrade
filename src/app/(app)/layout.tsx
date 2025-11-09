import type { Metadata } from "next";
import Header, { HeaderProps } from "../layout/app/Header";
import Footer from "../layout/app/Footer";
import SnsIcon, { SnsSetting } from "@/app/components/SnsIcon";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

export async function getWorkInfo(): Promise<HeaderProps> {
  const response = await fetch(`${BASE_URL}/api/workinfo`, { next: { tags: ["public", "workInfo"], revalidate: 28800 } });
  if (!response.ok) {
    console.error('Error fetching posts:', await response.text());
    return {};
  }
  return response.json();
}

export async function getSnsSettings(): Promise<SnsSetting[]> {
  const res = await fetch(`${BASE_URL}/api/sns-settings`, { next: { tags: ["public", "sns-settings"], revalidate: 28800 } });
  if (!res.ok) throw new Error("Network response was not ok");
  const data = await res.json();
  return data.data;
}

export const metadata: Metadata = {
  title: "부동산",
  description: "수정 사항 있을시 편히 말씀해주세요",
};

export default async function AppLayout({
  children, modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
   const [headerPromise, snsSettings] = await Promise.all([getWorkInfo(), getSnsSettings()]);
  return (
    <>
      <Header headerPromise={headerPromise} />
      <main className="flex-grow">{children}</main>
       {Boolean(snsSettings?.length) && <SnsIcon snsSettings={snsSettings} />}
      <Footer headerPromise={headerPromise} />
      {modal}
    </>
  );
}
