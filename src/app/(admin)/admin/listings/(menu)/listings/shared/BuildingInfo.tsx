"use client";

import { useFormContext, Controller } from "react-hook-form";
import { ko } from "date-fns/locale";
import { lazy, useCallback } from "react";
import "react-datepicker/dist/react-datepicker.css";

const DatePicker = lazy(() => import('react-datepicker'));

type YMD = string; // 'YYYY-MM-DD'로 폼에 저장한다고 가정

// 문자열('YYYY-MM-DD') 또는 Date -> Date|null
const toDate = (v: unknown): Date | null => {
  if (!v) return null;

  if (typeof v === 'string') {
    const datePart = v.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    if (year && month && day) {
      return new Date(year, month - 1, day);
    }
  }

  if (v instanceof Date) {
    return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  }

  // Fallback for other types or failed parsing
  try {
    const d = new Date(v);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  } catch {}

  return null;
};

// Date|null -> 'YYYY-MM-DD' 또는 ''
const toYMD = (d: Date | null): YMD => {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const BuildingInfo = () => {
  const { register, setValue, control, watch } = useFormContext();

  // 🔎 RHF 값만 바라보고 UI 구성 (로컬 active state 불필요)
  const elevatorType   = watch("elevatorType");   // "유" | "무" | undefined
  const heatingType    = watch("heatingType");
  const yieldType      = watch("yieldType");
  const moveInType     = watch("moveInType");
  const otherYield     = watch("otherYield");

  // 라디오 클릭 핸들러 (필요 시 의존 필드 정리)
  const pick = useCallback((field: string, value: string) => {
    setValue(field as any, value, { shouldDirty: true });

    // 의존 필드 초기화 규칙
    if (field === "elevatorType" && value !== "유") {
      setValue("elevatorCount", 0, { shouldDirty: true });
    }
    if (field === "moveInType" && value !== "가까운 시일내 협의") {
      setValue("moveInDate", "", { shouldDirty: true }); // YMD로 저장
    }
    if (field === "yieldType" && value !== "기타수익률") {
      setValue("otherYield", "", { shouldDirty: true });
    }
  }, [setValue]);

  const getButtonStyle = (current: string | null | undefined, item: string) => ({
    backgroundColor: current === item ? "#2b6cb0" : "white",
    color: current === item ? "white" : "gray",
    borderColor: "#cbd5e0",
    padding: "0.4rem 0.8rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    borderRadius: "0.375rem",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    transition: "all .2s ease"
  });

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 bg-slate-100">

      {/* 엘리베이터 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">엘리베이터</label>
        <div className="flex space-x-0 mt-2">
          {["유", "무"].map((item) => (
            <label key={item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("elevatorType")}
                value={item}
                checked={elevatorType === item}
                onChange={() => pick("elevatorType", item)}
              />
              <span style={getButtonStyle(elevatorType, item)}>{item}</span>
            </label>
          ))}
        </div>

        {elevatorType === "유" && (
          <div className="mt-2">
            <label htmlFor="elevatorCount" className="block text-sm font-medium text-gray-700">
              엘리베이터 갯수
            </label>
            <input
              id="elevatorCount"
              type="number"
              placeholder="갯수 입력"
              {...register("elevatorCount", {
                setValueAs: (v) => v === "" || v == null ? 0 : Number(v),
              })}
              className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* 입주 가능일 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">입주 가능일</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
          {["즉시", "가까운 시일내 협의"].map((item) => (
            <label key={item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("moveInType")}
                value={item}
                checked={moveInType === item}
                onChange={() => pick("moveInType", item)}
              />
              <span style={getButtonStyle(moveInType, item)}>{item}</span>
            </label>
          ))}
        </div>

        {moveInType === "가까운 시일내 협의" && (
          <Controller
            control={control}
            name="moveInDate" // 폼에는 'YYYY-MM-DD' 문자열로 저장
            render={({ field }) => (
              <DatePicker
                selected={toDate(field.value)}
                onChange={(d) => field.onChange(toYMD(d))}
                dateFormat="yyyy/MM/dd"
                placeholderText="입주 가능일 선택"
                className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                locale={ko}
              />
            )}
          />
        )}
      </div>

      {/* 난방 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">난방</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
          {["지역난방", "개별난방", "중앙난방"].map((item) => (
            <label key={item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("heatingType")}
                value={item}
                checked={heatingType === item}
                onChange={() => pick("heatingType", item)}
              />
              <span style={getButtonStyle(heatingType, item)}>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 수익률 사용 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">수익률 사용</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
          {["미사용", "상가수익률", "건물수익률", "기타수익률"].map((item) => (
            <label key={item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("yieldType")}
                value={item}
                checked={yieldType === item}
                onChange={() => pick("yieldType", item)}
              />
              <span style={getButtonStyle(yieldType, item)}>{item}</span>
            </label>
          ))}
        </div>

        {yieldType === "기타수익률" && (
          <input
            type="text"
            placeholder="기타수익률 입력"
            {...register("otherYield")}
            defaultValue={otherYield ?? ""}
            className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      {/* 계약만료일 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">계약만료일</label>
        <Controller
          control={control}
          name="contractEndDate" // 폼에는 'YYYY-MM-DD' 문자열로 저장
          render={({ field }) => (
            <DatePicker
              selected={toDate(field.value)}
              onChange={(d) => field.onChange(toYMD(d))}
              dateFormat="yyyy/MM/dd"
              placeholderText="계약만료일 선택"
              className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              locale={ko}
            />
          )}
        />
      </div>

      {/* 나머지 텍스트 필드 */}
      {[
        { id: "buildingName",  label: "건물명" },
        { id: "floorAreaRatio", label: "용적률 산정 면적" },
        { id: "otherUse",      label: "기타용도" },
        { id: "mainStructure", label: "주구조" },
        { id: "height",        label: "높이" },
        { id: "roofStructure", label: "지붕구조" },
      ].map(({ id, label }) => (
        <div key={id} className="flex flex-col">
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
          <input
            id={id}
            type="text"
            {...register(id as any)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={label}
          />
        </div>
      ))}
    </div>
  );
};

export default BuildingInfo;
