import Image from "next/image";
import { formatAddress } from "@/app/utility/address";
import {
  Building2,
  Square,
  Layers,
  BedDouble,
  Car,
  Coins,
} from "lucide-react";
import { numberToKoreanWithDigits } from "@/app/utility/NumberToKoreanWithDigits";
import OptionIcon from "../../components/shared/OptionIcon";

type Props = {
  listing: {
    id: number;
    title?: string;
    address?: string;
    dong?: string;
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
    floorType?: string;
    currentFloor?: number;
    totalFloors?: number;
    basementFloors?: number;
    rooms?: number;
    bathrooms?: number;
    roomOption?: { name: string };
    bathroomOption?: { name: string };
    floorOption?: { id: number; name: string; imageUrl?: string };
    actualArea?: number;
    supplyArea?: number;
    landArea?: number;
    NetLeasableArea?: number;
    buildingArea?: number;
    totalArea?: number;
    mainImage?: string;
    label?: string;
    popularity?: string;
    themes?: string[];
    buildingOptions?: { id: number; name: string; imageUrl?: string }[];
    parking?: string[];
    isAddressPublic?: "public" | "private" | "exclude";
    visibility?: boolean;
    yieldType?: string;
    otherYield?: string;
    priceDisplay?: string;
    dealScope?: string;
    blogUrl?: string;
    isBlogURL?: boolean;
  };
};

const CardItem = ({ listing, onClick, priority }: Props & { onClick: (id: number) => void; priority?: boolean }) => {
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return "";
    return numberToKoreanWithDigits(price);
  };

  const formatArea = (area: number | undefined) => {
    if (!area) return "";
    const pyeong = area / 3.305785;
    return `${pyeong.toFixed(2)}평`;
  };

  const formatFloor = (floorType?: string, currentFloor?: number, totalFloors?: number, basementFloors?: number) => {
    if (currentFloor === undefined || currentFloor === null) {
      return null;
    }

    let currentFloorDisplay = `${currentFloor}`;
    if (floorType === '지하' || currentFloor < 0) {
      currentFloorDisplay = `B${Math.abs(currentFloor)}`;
    }

    const floorTypeDisplay = floorType ? `${floorType} ` : '';

    let details = "";
    if (totalFloors) {
      details = `${totalFloors}F`;
      if (basementFloors && basementFloors > 0) {
        details += ` / B${basementFloors}`;
      }
    }

    if (details) {
      return `${floorTypeDisplay}${currentFloorDisplay}층(${details})`;
    }

    return `${floorTypeDisplay}${currentFloorDisplay}층`;
  };

  const renderPrice = (label: string, value: number | undefined, priceDisplayStatus: string | undefined) => {
    if (priceDisplayStatus === "비공개") {
      return (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">{label}</span>
          <span className="text-base font-bold text-gray-900">매물 금액 비공개</span>
        </div>
      );
    }

    if (value === undefined || value === null) return null;
    let formattedPrice = formatPrice(value);
    if (!formattedPrice) return null;

    if (priceDisplayStatus === "협의가능") {
      formattedPrice = `${formattedPrice} (협의가능)`;
    }

    return (
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-base font-bold text-gray-900">{formattedPrice}</span>
      </div>
    );
  };

  const getAreaString = () => {
    const areas = [
      { label: "실", value: listing.actualArea },
      { label: "공급", value: listing.supplyArea },
      { label: "대지", value: listing.landArea },
      { label: "건축", value: listing.buildingArea },
      { label: "연", value: listing.totalArea },
      { label: "전용", value: listing.NetLeasableArea },
    ];

    const validAreas = areas.filter(area => area.value && area.value > 0);

    if (validAreas.length === 0) {
      return "면적 정보 없음";
    }

    return validAreas.map(area => `${area.label} ${area.value!.toLocaleString()}m²`).join(" / ");
  };

  return (
    <div onClick={() => onClick(listing.id)} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
      {/* 매물 이미지 */}
      <div className="relative h-32 sm:h-40 md:h-48 bg-gray-200">
        {listing.mainImage ? (
          <Image
            src={listing.mainImage}
            alt={listing.title || "매물 이미지"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
            <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
          </div>
        )}

        {/* 기존 좌측 상단 라벨들 */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1">
          {listing.label && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {listing.label}
            </span>
          )}
          {listing.popularity && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
              {listing.popularity}
            </span>
          )}
          {listing.themes && listing.themes.length > 0 && (
            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
              {listing.themes[0]}
            </span>
          )}
        </div>

        {/* 기존 우측 상단 라벨들 (매물 ID 및 dealScope) */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-x-2">
          {listing.dealScope === '부분' && (
            <span className="bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded-md">
              부분 소유
            </span>
          )}
          <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            #{listing.id}
          </div>
        </div>

        {/* 블로그 URL 라벨 (오른쪽 하단) */}
        {listing.blogUrl && listing.isBlogURL === true && (
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
              블로그
            </span>
          </div>
        )}
      </div>

      {/* 매물 정보 */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-snug mb-1 line-clamp-2 h-12 sm:h-14">
          {listing.title || "제목 없음"}
        </h3>

        {/* Address */}
        <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 line-clamp-1">
          {formatAddress(listing.address, listing.isAddressPublic)}
        </p>

        {/* Price */}
        <div className="mb-3 sm:mb-4 space-y-1 border-t pt-2 sm:pt-3">
            {listing.isSalePriceEnabled && renderPrice("매매", listing.salePrice, listing.priceDisplay)}
            {listing.isLumpSumPriceEnabled && renderPrice("전세", listing.lumpSumPrice, listing.priceDisplay)}
            {listing.isActualEntryCostEnabled && renderPrice("실입주금", listing.actualEntryCost, listing.priceDisplay)}
            {listing.isDepositEnabled && renderPrice("보증금", listing.deposit, listing.priceDisplay)}
            {listing.isRentalPriceEnabled && renderPrice("월세", listing.rentalPrice, listing.priceDisplay)}
            {listing.isHalfLumpSumMonthlyRentEnabled && renderPrice("반전세 월세", listing.halfLumpSumMonthlyRent, listing.priceDisplay)}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-xs sm:text-sm text-gray-600 border-t pt-2 sm:pt-3 mt-auto">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>{listing.propertyType || "타입 미정"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Square className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>
                {getAreaString()}
              </span>
            </div>
            {formatFloor(listing.floorType, listing.currentFloor, listing.totalFloors, listing.basementFloors) && (
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span>
                  {formatFloor(listing.floorType, listing.currentFloor, listing.totalFloors, listing.basementFloors)}
                </span>
              </div>
            )}
            {(listing.roomOption || listing.bathroomOption) && (
              <div className="flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span>
                  방 {listing.roomOption?.name || "-"} / 욕실 {listing.bathroomOption?.name || "-"}
                </span>
              </div>
            )}
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
            {listing.yieldType && listing.yieldType !== "미사용" && (
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span>
                  수익률 {listing.yieldType === "기타수익률" ? listing.otherYield : listing.yieldType}
                </span>
              </div>
            )}
        </div>
        {/* <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4 pt-2">
          {listing.buildingOptions?.map((opt, index) => (
            <OptionIcon key={`building-${opt.id || index}`} option={opt} />
          ))}
          {listing.floorOption?.id && <OptionIcon key={`floor-${listing.floorOption.id}`} option={listing.floorOption} />}
        </div> */}
      </div>
    </div>
  )
}

export default CardItem