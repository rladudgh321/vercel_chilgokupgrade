import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import KakaoMapMarker from "@/app/components/shared/KakaoMapMarker";
import OptionIcon from "@/app/components/shared/OptionIcon";
import ImageSlider from "@/app/components/shared/ImageSlider";
import { IBuild } from "@/app/interface/build";

export default function BuildDetailModalClient({ build, onClose }: { build: IBuild, onClose: () => void }) {
  const [areaUnit, setAreaUnit] = useState<"m2" | "pyeong">("m2");
  const [isExtraInfoVisible, setIsExtraInfoVisible] = useState(false);

  const convertToPyeong = (m2: number) => (m2 / 3.305785);
  const formatPrice = (price?: number | string | null) =>
    price == null || Number.isNaN(Number(price)) ? "-" : `${Number(price).toLocaleString()}원`;

  const getFormattedPriceDisplay = (priceValue: number | string | null | undefined, priceDisplayStatus: string | undefined) => {
    if (priceDisplayStatus === "비공개") {
      return "매물 금액 비공개";
    }

    let formatted = priceValue == null || Number.isNaN(Number(priceValue)) ? "-" : `${Number(priceValue).toLocaleString()}원`;

    if (priceDisplayStatus === "협의가능") {
      formatted = `${formatted} (협의가능)`;
    }
    return formatted;
  };

  const allImages = 
    () =>
      build?.mainImage
        ? [build.mainImage, ...(Array.isArray(build.subImage) ? build.subImage : [])]
        : [];
  console.log('allImages', build);
  const getAreaString = (build: IBuild, unit: "m2" | "pyeong"): string => {
    const areas = [
      { label: "공급", value: build.supplyArea },
      { label: "실", value: build.actualArea },
      { label: "대지", value: build.landArea },
      { label: "건축", value: build.buildingArea },
      { label: "연", value: build.totalArea },
      { label: "전용", value: build.NetLeasableArea },
    ];

    const validAreas = areas.filter(area => area.value && area.value > 0);

    if (validAreas.length === 0) {
      return "";
    }

    if (unit === "m2") {
      return validAreas.map(area => `${area.label} ${area.value!.toLocaleString()}m²`).join(" / ");
    } else {
      return validAreas.map(area => `${area.label} ${convertToPyeong(area.value!).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}평`).join(" / ");
    }
  };

  const Row = (label: string, value: React.ReactNode) => (
    <>
      <div className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-4 py-3 font-semibold text-sm">{label}</div>
      <div className="px-4 py-3 text-sm dark:text-gray-200">{value ?? "-"}</div>
    </>
  );

  const formatAddress = () => {
    if (build.isAddressPublic === 'private') {
      return "주소 비공개";
    }
    if (build.isAddressPublic === 'exclude') {
      const fullAddress = build.address || "";
      if (!fullAddress) {
        return "주소 정보 없음";
      }

      const parts = fullAddress.split(' ');
      let sido = '';
      let sigungu = '';
      let eupmyeondongri = '';

      // Find sido and sigungu
      if (parts.length > 0) {
          sido = parts[0];
      }
      if (parts.length > 1) {
          sigungu = parts[1];
      }

      // Find eupmyeondongri
      // 1. Check in parentheses for new addresses
      const matchParentheses = fullAddress.match(/\(([^)]+(?:동|리|가))\)/);
      if (matchParentheses && matchParentheses[1]) {
          eupmyeondongri = matchParentheses[1];
          // Also need to find eup/myeon if it exists
          const eupmyeonPart = parts.find(p => p.endsWith('읍') || p.endsWith('면'));
          if (eupmyeonPart) {
              return `${sido} ${sigungu} ${eupmyeonPart} ${eupmyeondongri}`.trim();
          }
          return `${sido} ${sigungu} ${eupmyeondongri}`.trim();
      }

      // 2. Find last eup/myeon/dong/ri/ga in the address for old addresses
      const adminParts = parts.filter(p => p.endsWith('읍') || p.endsWith('면') || p.endsWith('동') || p.endsWith('리') || p.endsWith('가'));
      if (adminParts.length > 0) {
          return parts.slice(0, parts.indexOf(adminParts[adminParts.length - 1]) + 1).join(' ');
      }

      // Fallback to first 2 parts if no admin parts found
      return `${sido} ${sigungu}`.trim();
    }
    return build.address || "주소 정보 없음";
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex justify-center items-center p-2 sm:p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-purple-800 text-white rounded-t-lg">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-x-2">
            <span>매물 상세 정보 (번호: {build?.id})</span>
            {build.dealScope === '부분' && (
              <span className="bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded-md">
                부분 소유
              </span>
            )}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6" style={{ maxHeight: "85vh", overflowY: "auto" }}>
          <ImageSlider images={allImages() as string[]} />

          <div className="pb-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-xl sm:text-2xl font-bold dark:text-gray-100">{build.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">{formatAddress()}</p>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 text-purple-800 dark:text-purple-400">매물 정보</h4>
            <div className="border dark:border-gray-600 rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
              {Row("매물 종류", build.propertyType)}
              {Row("거래 종류", build.buyType)}
              {build.isSalePriceEnabled && Row("매매가", getFormattedPriceDisplay(build.salePrice, build.priceDisplay))}
              {build.isLumpSumPriceEnabled && Row("전세가", getFormattedPriceDisplay(build.lumpSumPrice, build.priceDisplay))}
              {build.isActualEntryCostEnabled && Row("실입주금", getFormattedPriceDisplay(build.actualEntryCost, build.priceDisplay))}
              {build.isDepositEnabled && Row("보증금", getFormattedPriceDisplay(build.deposit, build.priceDisplay))}
              {build.isRentalPriceEnabled && Row("월세", getFormattedPriceDisplay(build.rentalPrice, build.priceDisplay))}
              {build.isHalfLumpSumMonthlyRentEnabled && Row("반전세의 월세", getFormattedPriceDisplay(build.halfLumpSumMonthlyRent, build.priceDisplay))}
              {build.isManagementFeeEnabled && build.managementFee &&
                Row("관리비", getFormattedPriceDisplay(build.managementFee, build.priceDisplay))}
              {(build.totalFloors || build.basementFloors) && Row("건물 층수", `지상 ${build.totalFloors || '-'}층 / 지하 ${build.basementFloors || '-'}층`)}
              {build.currentFloor && Row("해당 층수", `${build.floorType || ''} ${build.currentFloor < 0 ? `B${Math.abs(build.currentFloor)}` : build.currentFloor}층`)}
              {(build.roomOption?.name || build.bathroomOption?.name) &&
                Row("방/화장실 수", `${build.roomOption?.name || "-"} / ${build.bathroomOption?.name || "-"}`)}
              {(build.supplyArea || build.actualArea || build.landArea || build.NetLeasableArea || build.buildingArea || build.totalArea) && Row(
                "면적",
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm">
                    {getAreaString(build, areaUnit)}
                  </span>
                  <button
                    onClick={() => setAreaUnit(areaUnit === "m2" ? "pyeong" : "m2")}
                    className="text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 dark:text-gray-200 rounded px-2 py-1 transition-colors"
                  >
                    {areaUnit === "m2" ? "평으로 보기" : "m²로 보기"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={() => setIsExtraInfoVisible(!isExtraInfoVisible)}
              className="w-full flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <span className="font-semibold text-purple-800 dark:text-purple-400">매물 추가 정보 확인하기</span>
              {isExtraInfoVisible ? <ChevronUp className="w-5 h-5 text-purple-800 dark:text-purple-400" /> : <ChevronDown className="w-5 h-5 text-purple-800 dark:text-purple-400" />}
            </button>

            {isExtraInfoVisible && (
              <div className="border dark:border-gray-600 rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 mt-4">
                {build.managementEtc && Row("기타사항", build.managementEtc)}
                {(build.totalParking || build.parkingPerUnit || build.parkingFee) && Row(
                  "주차 옵션",
                  `총 ${build.totalParking || "-"}대 (세대당 ${build.parkingPerUnit || "-"}대), 주차비: ${formatPrice(
                    build.parkingFee
                  )}`
                )}
                {build.elevatorType === "유" ? Row("엘리베이터", `${build.elevatorCount || "-"}개`) : build.elevatorType === "무" ? Row("엘리베이터", "없음") : null}
                {build.heatingType && Row("난방 방식", build.heatingType)}
                {build.yieldType && build.yieldType !== "미사용" &&
                  Row("수익률 사용", build.yieldType === "기타수익률" ? build.otherYield : build.yieldType)}
                {(build.moveInType || build.moveInDate) && Row(
                  "입주 가능일",
                  build.moveInType === "즉시"
                    ? "입주 즉시 가능"
                    : build.moveInDate
                    ? `${new Date(build.moveInDate).toLocaleDateString()} (${build.moveInType})`
                    : build.moveInType
                )}
                {build.contractEndDate && Row("계약만료일", new Date(build.contractEndDate).toLocaleDateString())}
                {build.buildingName && Row("건물명", build.buildingName)}
                {build.floorAreaRatio && Row("용적률 산정면적", build.floorAreaRatio)}
                {build.otherUse && Row("기타용도", build.otherUse)}
                {build.mainStructure && Row("주구조", build.mainStructure)}
                {build.height && Row("높이", build.height)}
                {build.roofStructure && Row("지붕구조", build.roofStructure)}
                {build.constructionYear && Row("건축년도", new Date(build.constructionYear).toLocaleDateString())}
                {build.permitDate && Row("허가일자", new Date(build.permitDate).toLocaleDateString())}
                {build.approvalDate && Row("사용승인일자", new Date(build.approvalDate).toLocaleDateString())}
                {build.direction && Row("햇빛 방향", `${build.direction} (기준: ${build.directionBase})`)}
                {build.landUse && Row("용도지역", build.landUse)}
                {build.landType && Row("지목", build.landType)}
                {build.buildingUse && Row("건축물용도", build.buildingUse)}
                {build.themes && build.themes.length > 0 && Row("테마", build.themes.join(", "))}
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-900  rounded-lg p-3 sm:p-4">
            <h4 className="text-base sm:text-lg font-semibold mb-3 text-purple-800 dark:text-purple-400">옵션 정보</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4 pt-2">
              {build.buildingOptions?.map((opt, index) => (
                <OptionIcon key={`building-${opt.id || index}`} option={opt} className="dark:text-gray-50" />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 text-purple-800 dark:text-purple-400">상세 설명</h4>
            <div
              className="prose dark:prose-invert max-w-none text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: build.editorContent || "" }}
            />
          </div>

          {build.isAddressPublic !== 'exclude' && build.isAddressPublic !== 'private' && (
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 text-purple-800 dark:text-purple-400">위치 및 주변 편의시설</h4>
              {build.address && <KakaoMapMarker address={build.address} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}