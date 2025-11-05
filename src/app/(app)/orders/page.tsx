// app/orders/page.tsx (서버 컴포넌트)
import { createClient as createClientServer } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import OrdersPageClient from "./OrdersPageClient";

export const dynamic = 'force-dynamic';

// export const revalidate = 28800;

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const supabase = createClientServer(cookieStore);

  const [propTypesRes, buyTypesRes] = await Promise.all([
    supabase.from("property_types").select("id, name"),
    supabase.from("buy_types").select("id, name"),
  ]);

  const propertyTypes = propTypesRes.data ?? [];
  const buyTypes = buyTypesRes.data ?? [];

  return <OrdersPageClient propertyTypes={propertyTypes} buyTypes={buyTypes} />;
}
