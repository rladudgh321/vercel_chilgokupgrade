"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { numberToKoreanWithDigits } from "@/app/utility/NumberToKoreanWithDigits";
import { FormData } from "@/app/(admin)/admin/listings/(menu)/listings/shared/BuildForm";

const PriceInput = ({ name, label, enabledName }) => {
  const { register, control, watch } = useFormContext();
  const isEnabled = useWatch({ control, name: enabledName });
  const value = watch(name);

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-1">
        <input
          id={`${enabledName}-checkbox`}
          type="checkbox"
          {...register(enabledName)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor={name} className="ml-2 block text-sm font-medium text-gray-700">{label}</label>
      </div>
      <div className="flex items-center">
        <input
          id={name}
          type="number"
          {...register(name, { setValueAs: v => v === "" ? 0 : Number(v) })}
          className={`mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEnabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="숫자로만 입력"
          disabled={!isEnabled}
        />
        {isEnabled && value > 0 && <span className="ml-2 text-sm text-gray-500 whitespace-nowrap">{numberToKoreanWithDigits(value)}</span>}
      </div>
    </div>
  );
};

const LandInfo = () => {
  const { register, setValue, control } = useFormContext<FormData>();

  // ✅ RHF 값 구독 (reset로 내려온 서버 데이터가 바로 들어옴)
  const propertyType = useWatch({ control, name: "propertyType" }) ?? "";
  const buyTypeId = useWatch({ control, name: "buyTypeId" });
  const dealScope = useWatch({ control, name: "dealScope" });
  const visibility = useWatch({ control, name: "visibility" }); // 불린
  const priceDisplay = useWatch({ control, name: "priceDisplay" });

  const onPick = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setValue(field, value, { shouldDirty: true, shouldTouch: true });
  };

  const isActive = (curr: any, item: any) => curr === item;

  const chip = (active: boolean) =>
    ({
      backgroundColor: active ? "#2b6cb0" : "white",
      color: active ? "white" : "gray",
      borderColor: "#cbd5e0",
      padding: "0.4rem 0.8rem",
      fontSize: "0.75rem",
      fontWeight: 500,
      borderRadius: "0.375rem",
      cursor: "pointer",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      transition: "all .2s ease",
    } as React.CSSProperties);

  // 매물종류 옵션 동적 로드
  const [propertyTypeOptions, setPropertyTypeOptions] = useState<string[]>([]);
  const [buyTypeOptions, setBuyTypeOptions] = useState<{ id: number; name: string }[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/listing-type");
        const json = await res.json();
        if (!cancelled && json?.ok && Array.isArray(json.data)) {
          const names = (json.data as Array<{ name?: string }>)
            .map((r) => r?.name)
            .filter((v): v is string => typeof v === "string" && v.length > 0);
          const uniq = Array.from(new Set<string>(names));
          setPropertyTypeOptions(uniq);
        }
      } catch {
        // ignore; keep defaults empty
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/buy-types");
        const json = await res.json();
        if (!cancelled && json?.ok && Array.isArray(json.data)) {
          setBuyTypeOptions(json.data);
        }
      } catch {
        // ignore; keep defaults empty
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 bg-slate-100">
      {/* 매물종류 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">매물종류</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4 gap-x-2">
          {(propertyTypeOptions.length > 0
            ? propertyTypeOptions
            : ["아파트", "신축빌라", "원룸", "투룸", "쓰리룸", "사무실", "상가", "오피스텔"]).map((item) => (
            <label key={item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("propertyType")}
                value={item}
                checked={propertyType === item}
                onChange={() => onPick("propertyType", item)}
              />
              <span style={chip(isActive(propertyType, item))}>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 거래유형 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">거래유형</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4 gap-x-2">
          {buyTypeOptions.map((item) => (
            <label key={item.id} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("buyTypeId")}
                value={item.id}
                checked={buyTypeId === item.id}
                onChange={() => onPick("buyTypeId", item.id)}
              />
              <span style={chip(isActive(buyTypeId, item.id))}>{item.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 숫자 입력들: 숫자로 보정 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <PriceInput name="salePrice" label="분양가/매매가" enabledName="isSalePriceEnabled" />
        <PriceInput name="lumpSumPrice" label="전세가" enabledName="isLumpSumPriceEnabled" />
        <PriceInput name="actualEntryCost" label="실입주금" enabledName="isActualEntryCostEnabled" />
        <PriceInput name="deposit" label="보증금" enabledName="isDepositEnabled" />
        <PriceInput name="rentalPrice" label="월세" enabledName="isRentalPriceEnabled" />
        <PriceInput name="halfLumpSumMonthlyRent" label="반전세의 월세" enabledName="isHalfLumpSumMonthlyRentEnabled" />
        <PriceInput name="managementFee" label="관리비" enabledName="isManagementFeeEnabled" />
      </div>

      {/* 공개여부 (불린) */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">공개여부</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4 gap-x-2">
          {[{ label: "공개", value: true }, { label: "비공개", value: false }].map(({ label, value }) => (
            <label key={label} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                // register는 submit/validation용, 실사용은 setValue
                {...register("visibility")}
                value={String(value)}
                checked={visibility === value}
                onChange={() => onPick("visibility", value)}
              />
              <span style={chip(isActive(visibility, value))}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 금액 표기 방법 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">금액 표기 방법</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4 gap-x-2">
          {["공개", "비공개", "협의가능"].map((item) => (
            <label key={item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("priceDisplay")}
                value={item}
                checked={priceDisplay === item}
                onChange={() => onPick("priceDisplay", item)}
              />
              <span style={chip(isActive(priceDisplay, item))}>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 거래범위 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">거래범위</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4 gap-x-2">
          {["부분", "전체"].map((item) => (
            <label key={item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("dealScope")}
                value={item}
                checked={dealScope === item}
                onChange={() => onPick("dealScope", item)}
              />
              <span style={chip(isActive(dealScope, item))}>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 기타사항 */}
      <div className="flex flex-col">
        <label htmlFor="managementEtc" className="block text-sm font-medium text-gray-700">기타사항</label>
        <input
          id="managementEtc"
          type="text"
          {...register("managementEtc")}
          placeholder="'경매에 나올 물건이다', '주인이 가격 할인 의지가 있다', '반전세가격은 전세가격마다 월세를 다르게 받을 수 있다' 등"
          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default LandInfo;