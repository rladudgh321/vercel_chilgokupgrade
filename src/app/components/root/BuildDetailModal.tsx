"use client";

import { useMemo, useState } from "react";
import KakaoMapMarker from "@/app/components/shared/KakaoMapMarker";
import OptionIcon from "@/app/components/shared/OptionIcon";
import ImageSlider from "@/app/components/shared/ImageSlider";
import { IBuild } from "@/app/interface/build";

export default function BuildDetailModalClient({ build, onClose }: { build: IBuild, onClose: () => void }) {
  const [areaUnit, setAreaUnit] = useState<"m2" | "pyeong">("m2");
  console.log('build', build);

  const convertToPyeong = (m2: number) => (m2 / 3.305785).toFixed(2);
  const formatPrice = (price?: number | string | null) =>
    price == null || Number.isNaN(Number(price)) ? "-" : `${Number(price).toLocaleString()}원`;

  const allImages = useMemo(
    () =>
      build?.mainImage
        ? [build.mainImage, ...(Array.isArray(build.subImage) ? build.subImage : [])]
        : [],
    [build?.mainImage, build?.subImage]
  );

  const Row = (label: string, value: React.ReactNode) => (
    <>
      <div className="bg-gray-100 px-4 py-3 font-semibold text-sm">{label}</div>
      <div className="px-4 py-3 text-sm">{value ?? "-"}</div>
    </>
  );

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex justify-center items-center p-2 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 sm:p-4 border-b flex justify-between items-center bg-purple-800 text-white rounded-t-lg">
          <h2 className="text-lg sm:text-xl font-bold">매물 상세 정보 (번호: {build?.id})</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold">&times;</button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6" style={{ maxHeight: "85vh", overflowY: "auto" }}>
          <ImageSlider images={allImages as string[]} />

          <div className="pb-4 border-b">
            <h3 className="text-xl sm:text-2xl font-bold">{build.title}</h3>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">{build.address}</p>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 text-purple-800">매물 정보</h4>
            <div className="border rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
              {Row("매물 종류", build.propertyType)}
              {Row("거래 종류", build.buyType)}
              {build.isSalePriceEnabled && Row("매매가", formatPrice(build.salePrice))}
              {build.isLumpSumPriceEnabled && Row("전세가", formatPrice(build.lumpSumPrice))}
              {build.isActualEntryCostEnabled && Row("실입주금", formatPrice(build.actualEntryCost))}
              {build.isDepositEnabled && Row("보증금", formatPrice(build.deposit))}
              {build.isRentalPriceEnabled && Row("월세", formatPrice(build.rentalPrice))}
              {build.isHalfLumpSumMonthlyRentEnabled && Row("반전세의 월세", formatPrice(build.halfLumpSumMonthlyRent))}
              {build.isManagementFeeEnabled && build.managementFee &&
                Row("관리비", `${formatPrice(build.managementFee)}`)}
              {Row("건물 층수", `지상 ${build.totalFloors || '-'}층 / 지하 ${build.basementFloors || '-'}층`)}
              {Row("해당 층수", `${build.floorType || ''} ${build.currentFloor ? (build.currentFloor < 0 ? `B${Math.abs(build.currentFloor)}` : build.currentFloor) + '층' : '-'}`)}
              {Row("방/화장실 수", `${build.roomOption?.name || "-"} / ${build.bathroomOption?.name || "-"}`)}
              {Row(
                "면적",
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm">
                    {areaUnit === "m2"
                      ? `공급 ${build.supplyArea || "-"}m² / 전용 ${build.actualArea || "-"}m²`
                      : `공급 ${convertToPyeong(build.actualArea || 0)}평 / 전용 ${convertToPyeong(
                          build.actualArea || 0
                        )}평`}
                  </span>
                  <button
                    onClick={() => setAreaUnit(areaUnit === "m2" ? "pyeong" : "m2")}
                    className="text-xs bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 transition-colors"
                  >
                    {areaUnit === "m2" ? "평으로 보기" : "m²로 보기"}
                  </button>
                </div>
              )}
              {Row(
                "주차 옵션",
                `총 ${build.totalParking || "-"}대 (세대당 ${build.parkingPerUnit || "-"}대), 주차비: ${formatPrice(
                  build.parkingFee
                )}`
              )}
              {Row("엘리베이터", build.elevatorType ? `${build.elevatorType} (${build.elevatorCount || "-"}대)` : "-")}
              {Row("난방 방식", build.heatingType)}
              {Row(
                "입주 가능일",
                build.moveInType === "즉시"
                  ? "(즉시 입주가능)"
                  : build.moveInDate
                  ? `${new Date(build.moveInDate).toLocaleDateString()} (${build.moveInType})`
                  : "-"
              )}
              {Row("건축 년도", build.constructionYear ? new Date(build.constructionYear).toLocaleDateString() : "-")}
              {Row("방향", build.direction ? `${build.direction} (기준: ${build.directionBase})` : "-")}
              {build.themes && build.themes.length > 0 && Row("테마", build.themes.join(", "))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h4 className="text-base sm:text-lg font-semibold mb-3 text-purple-800">옵션 정보</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4 pt-2">
              {build.buildingOptions?.map((opt, index) => (
                <OptionIcon key={`building-${opt.id || index}`} option={opt} />
              ))}
              {build.floorOption?.id && <OptionIcon key={`floor-${build.floorOption.id}`} option={build.floorOption} />}
            </div>
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 text-purple-800">상세 설명</h4>
            <div
              className="prose max-w-none text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: build.editorContent || "" }}
            />
          </div>

          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 text-purple-800">위치 및 주변 편의시설</h4>
            {build.address && <KakaoMapMarker address={build.address} />}
          </div>
        </div>
      </div>
    </div>
  );
}
