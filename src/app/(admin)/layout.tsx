import AdminLayoutClient from "./AdminLayoutClient";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

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
