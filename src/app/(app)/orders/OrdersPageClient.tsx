"use client"; // 클라이언트 컴포넌트

import { useEffect, useState } from "react";
import OrderForm from "./OrderForm";

type SelectOption = { id: number; name: string };

async function fetchInitialData(): Promise<{
  isBanned: boolean;
  propertyTypes: SelectOption[];
  buyTypes: SelectOption[];
}> {
  const [ipRes, propTypeRes, buyTypeRes] = await Promise.all([
    fetch("/api/ip-status", { cache: 'force-cache', next: { tags: ['public'] } }),
    fetch("/api/listing-type", { cache: 'force-cache', next: { tags: ['public'] } }),
    fetch("/api/buy-types-public", { cache: 'force-cache', next: { tags: ['public'] } }),
  ]);

  const ipStatus = ipRes.ok ? await ipRes.json() : { isBanned: false };
  const propertyTypes = propTypeRes.ok ? await propTypeRes.json() : [];
  const buyTypes = buyTypeRes.ok ? await buyTypeRes.json() : [];

  return {
    isBanned: ipStatus.isBanned,
    propertyTypes: propertyTypes.data,
    buyTypes: buyTypes.data,
  };
}

export default function OrdersPageClient() {
  const [isBanned, setIsBanned] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState<SelectOption[]>([]);
  const [buyTypes, setBuyTypes] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData().then((data) => {
      setIsBanned(data.isBanned);
      setPropertyTypes(data.propertyTypes || []);
      setBuyTypes(data.buyTypes || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto p-4 sm:px-4 sm:py-8 mt-14 flex justify-center items-center">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 sm:px-4 sm:py-8 mt-14">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-900 dark:text-gray-900">매물 의뢰</h1>
      <OrderForm propertyTypes={propertyTypes} buyTypes={buyTypes} isBanned={isBanned} />
    </main>
  );
}
