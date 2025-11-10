import Image from "next/image";
import {
  Building2,
  Square,
  Layers,
  BedDouble,
  Car,
  Coins,
} from "lucide-react";

type Props = {
  listing: {
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
    roomOption?: { name: string };
    bathroomOption?: { name: string };
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
    priceDisplay?: string;
    dealScope?: string;
  };
};

import { numberToKoreanWithDigits } from "@/app/utility/NumberToKoreanWithDigits";

const ListingCard = ({ listing, onClick }: Props & { onClick: (id: number) => void }) => {
  const formatPrice = (price: number | undefined) => {
    if (!price) return "";
    return numberToKoreanWithDigits(price);
  };

  const formatArea = (area: number | undefined) => {
    if (!area) return "";
    return `${area}`;
  };

  const renderPrice = (label: string, value: number | undefined, priceDisplayStatus: string | undefined) => {
    if (priceDisplayStatus === "비공개") {
      return (
        <div>
          <span className="text-sm font-medium text-gray-600 mr-2">{label}</span>
          <span className="text-lg font-bold text-gray-900">매물 금액 비공개</span>
        </div>
      );
    }

    if (!value) return null;
    let formattedPrice = formatPrice(value);

    if (priceDisplayStatus === "협의가능") {
      formattedPrice = `${formattedPrice} (협의가능)`;
    }

    return (
      <div>
        <span className="text-sm font-medium text-gray-600 mr-2">{label}</span>
        <span className="text-lg font-bold text-gray-900">{formattedPrice}</span>
      </div>
    );
  };

  return (
    <div onClick={() => onClick(listing.id)} className="border bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="w-full md:w-48 flex-shrink-0 relative">
          <div className="aspect-w-1 aspect-h-1 w-full h-48 md:h-full">
            {listing.mainImage ? (
              <Image
                src={listing.mainImage}
                alt={listing.title || "매물 이미지"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-x-2">
            {listing.dealScope === '부분' && (
              <span className="bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded-md">
                부분 소유
              </span>
            )}
            <div className="bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
              #{listing.id}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          {/* Labels */}
          <div className="flex flex-wrap gap-2 mb-2">
            {listing.label && (
              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 font-semibold rounded-full">
                {listing.label}
              </span>
            )}
            {listing.popularity && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 font-semibold rounded-full">
                {listing.popularity}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-snug mb-1 line-clamp-2">
            {listing.title || "제목 없음"}
          </h3>

          {/* Address */}
          <p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-1">
            {listing.address || "주소 정보 없음"}
          </p>

          {/* Price */}
          <div className="mb-3 space-y-1">
            {listing.isSalePriceEnabled && renderPrice("매매", listing.salePrice, listing.priceDisplay)}
            {listing.isLumpSumPriceEnabled && renderPrice("전세", listing.lumpSumPrice, listing.priceDisplay)}
            {listing.isActualEntryCostEnabled && renderPrice("실입주금", listing.actualEntryCost, listing.priceDisplay)}
            {listing.isDepositEnabled && renderPrice("보증금", listing.deposit, listing.priceDisplay)}
            {listing.isRentalPriceEnabled && renderPrice("월세", listing.rentalPrice, listing.priceDisplay)}
            {listing.isHalfLumpSumMonthlyRentEnabled && renderPrice("반전세 월세", listing.halfLumpSumMonthlyRent, listing.priceDisplay)}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-xs sm:text-sm text-gray-600 border-t pt-2 sm:pt-3">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>{listing.propertyType || "타입 미정"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Square className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>
                실 {formatArea(listing.actualArea)} / 공{" "}
                {formatArea(listing.supplyArea)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>
                {listing.currentFloor && listing.totalFloors
                  ? `${listing.currentFloor}/${listing.totalFloors}층`
                  : "층수 정보 없음"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>
                방 {listing.roomOption?.name || "-"} / 욕실 {listing.bathroomOption?.name || "-"}
              </span>
            </div>
            {listing.parking && listing.parking.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Car className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span>{listing.parking.join(", ")}</span>
              </div>
            )}
            {listing.isManagementFeeEnabled && listing.managementFee && (
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span>
                  관리비 {formatPrice(listing.managementFee)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
