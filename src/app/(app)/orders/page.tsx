// app/orders/page.tsx (서버 컴포넌트)
import { createClient as createClientServer } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import OrdersPageClient from "./OrdersPageClient";

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const supabase = createClientServer(cookieStore);

  const [propTypesRes, buyTypesRes] = await Promise.all([
    supabase.from("ListingType").select("id, name"),
    supabase.from("BuyType").select("id, name"),
  ]);

  const propertyTypes = propTypesRes.data ?? [];
  const buyTypes = buyTypesRes.data ?? [];

  return <OrdersPageClient propertyTypes={propertyTypes} buyTypes={buyTypes} />;
}
