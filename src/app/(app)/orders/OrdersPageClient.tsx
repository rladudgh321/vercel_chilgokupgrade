"use client"; // 클라이언트 컴포넌트

import { useEffect, useState } from "react";
import OrderForm from "./OrderForm";

async function fetchIpStatus(): Promise<{ isBanned: boolean }> {
  const res = await fetch("/api/ip-status"); // 클라이언트 전용 API
  if (!res.ok) return { isBanned: false };
  return res.json();
}

interface OrdersPageProps {
  propertyTypes: Array<{ id: number; name: string }>;
  buyTypes: Array<{ id: number; name: string }>;
}

export default function OrdersPageClient({ propertyTypes, buyTypes }: OrdersPageProps) {
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    fetchIpStatus().then((res) => setIsBanned(res.isBanned));
  }, []);

  return (
    <main className="container mx-auto p-4 sm:px-4 sm:py-8 mt-14">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">매물 의뢰</h1>
      <OrderForm propertyTypes={propertyTypes} buyTypes={buyTypes} isBanned={isBanned} />
    </main>
  );
}
