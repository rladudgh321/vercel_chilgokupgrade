"use client";

import { useRouter } from "next/navigation";
import RecommendLand from "./5RecommendLand";
import QuickSale from "./6QuickSale";
import RecentlyLand from "./7RecentlyLand";
import { ListingSectionProps } from "@/app/(app)/page";
import { use } from 'react';

export type Listing = {
  id: number;
  title?: string;
  address?: string;
  salePrice?: number;
  isSalePriceEnabled?: boolean;
  lumpSumPrice?: number;
  isLumpSumPriceEnabled?: boolean;
  actualEntryCost?: number;
  isActualEntryCostEnabled?: boolean;
  rentalPrice?: number;
  isRentalPriceEnabled?: boolean;
  halfLumpSumMonthlyRent?: number;
  isHalfLumpSumMonthlyRentEnabled?: boolean;
  deposit?: number;
  isDepositEnabled?: boolean;
  managementFee?: number;
  isManagementFeeEnabled?: boolean;
  propertyType?: string;
  currentFloor?: number;
  totalFloors?: number;
  rooms?: number;
  bathrooms?: number;
  actualArea?: number;
  supplyArea?: number;
  mainImage?: string;
  label?: string;
  popularity?: string;
  themes?: string[];
  buildingOptions?: string[];
  parking?: string[];
  isAddressPublic?: string;
  visibility?: boolean;
};
const ListingSection = ({ RecommendData, QuickSaleData, RecentlyData }:{
  RecommendData: Promise<ListingSectionProps>; QuickSaleData: Promise<ListingSectionProps>; RecentlyData: Promise<ListingSectionProps>;
}) => {
  const router = useRouter();
  const handleCardClick = (id: number) => {
    // Increment views
    fetch(`/api/build/${id}/increment-views`, { method: 'POST' })
      .then(response => {
        if (!response.ok) {
          console.error('Failed to increment views');
        }
      })
      .catch(error => console.error('Error incrementing views:', error));

    router.push(`/build/${id}`, { scroll: false }); // ← 모달 인터셉트 라우트로 이동
  };
  const RecommendDataPromise = use(RecommendData);
  const QuickSaleDataPromise = use(QuickSaleData);
  const RecentlyDataPromise = use(RecentlyData);
  return (
    <>
      <RecommendLand RecommendData={RecommendDataPromise.listings} onCardClick={handleCardClick} />
      <QuickSale QuickSaleData={QuickSaleDataPromise.listings} onCardClick={handleCardClick} />
      <RecentlyLand RecentlyData={RecentlyDataPromise.listings} onCardClick={handleCardClick} />
    </>
  );
};
export default ListingSection;