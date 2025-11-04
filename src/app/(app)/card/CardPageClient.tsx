'use client'

import { Suspense } from 'react';
import CardList from "./CardList";
import Pagination from "@/app/components/shared/Pagination";
import { useSearchParams, useRouter } from 'next/navigation';

export default function CardPageClient({ 
  listings, 
  totalPages, 
  settings,
  roomOptions,
  bathroomOptions,
  floorOptions,
  areaOptions,
  themeOptions,
  propertyTypeOptions,
  buyTypeOptions
}: { 
  listings: any[], 
  totalPages: number, 
  settings: any,
  roomOptions: any[],
  bathroomOptions: any[],
  floorOptions: any[],
  areaOptions: any[],
  themeOptions: any[],
  propertyTypeOptions: any[],
  buyTypeOptions: any[]
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/card?${params.toString()}`);
  };

  return (
    <Suspense>
      <CardList 
        settings={settings}
        roomOptions={roomOptions}
        bathroomOptions={bathroomOptions}
        floorOptions={floorOptions}
        areaOptions={areaOptions}
        themeOptions={themeOptions}
        propertyTypeOptions={propertyTypeOptions}
        buyTypeOptions={buyTypeOptions}
      />
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </Suspense>
  );
}
