"use client";

import { useState, use } from 'react';
import { useRouter } from "next/navigation";
import RecommendLand from "../components/root/5RecommendLand";
import QuickSale from "../components/root/6QuickSale";
import RecentlyLand from "../components/root/7RecentlyLand";
import { ListingSectionProps } from "@/app/(app)/page";
import { IBuild } from '../interface/build';
import BuildDetailModalClient from '../components/root/BuildDetailModal';
import { Listing } from '../components/root/ListingSection';


const HomePageClient = ({ RecommendData, QuickSaleData, RecentlyData }:{
  RecommendData: Promise<ListingSectionProps>; QuickSaleData: Promise<ListingSectionProps>; RecentlyData: Promise<ListingSectionProps>;
}) => {
  const [selectedBuild, setSelectedBuild] = useState<IBuild | null>(null);

  const RecommendDataPromise = use(RecommendData);
  const QuickSaleDataPromise = use(QuickSaleData);
  const RecentlyDataPromise = use(RecentlyData);

  const allListings: Listing[] = [
    ...(RecommendDataPromise?.listings || []),
    ...(QuickSaleDataPromise?.listings || []),
    ...(RecentlyDataPromise?.listings || []),
  ];

  const handleCardClick = (id: number) => {
    fetch(`/api/build/${id}/increment-views`, { method: 'POST' });
    const build = allListings.find((l) => l.id === id);
    setSelectedBuild(build as IBuild || null);
  };

  const handleCloseModal = () => {
    setSelectedBuild(null);
  };

  return (
    <>
      <RecommendLand RecommendData={RecommendDataPromise.listings} onCardClick={handleCardClick} />
      <QuickSale QuickSaleData={QuickSaleDataPromise.listings} onCardClick={handleCardClick} />
      <RecentlyLand RecentlyData={RecentlyDataPromise.listings} onCardClick={handleCardClick} />
      {selectedBuild && (
        <BuildDetailModalClient
          build={selectedBuild}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default HomePageClient;
