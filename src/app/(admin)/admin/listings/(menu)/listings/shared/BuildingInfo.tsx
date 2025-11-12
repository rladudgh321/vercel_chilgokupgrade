"use client";

import React, { lazy, MouseEventHandler, Suspense, useCallback } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { ko } from "date-fns/locale";
import { clsx } from "clsx";
import "react-datepicker/dist/react-datepicker.css";

const DatePicker = lazy(() => import('react-datepicker'));

/* =========================
   공통 스타일/컴포넌트
   ========================= */
const getButtonStyle = (activeState: string | null | boolean | number, item?: string | number) => {
  return {
    backgroundColor: activeState === item ? "#2b6cb0" : "white",
    color: activeState === item ? "white" : "gray",
    borderColor: "#cbd5e0",
    padding: "0.4rem 0.8rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    borderRadius: "0.375rem",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease",
  } as React.CSSProperties;
};

type InputFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  className?: string;
  isDatePicker?: boolean;
  min?: number;
};

/* ---------- 유틸 함수 ---------- */
// Date -> "YYYY-MM-DD"
const dateToDateOnlyString = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// value (string | Date | null | undefined) -> Date | null (로컬 자정으로 생성)
const parseValueToDate = (val: any): Date | null => {
  if (!val) return null;

  if (typeof val === 'string') {
    const datePart = val.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    if (year && month && day) {
      return new Date(year, month - 1, day);
    }
  }

  if (val instanceof Date) {
    return new Date(val.getFullYear(), val.getMonth(), val.getDate());
  }

  // Fallback for other types or failed parsing
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  } catch {}

  return null;
};

const InputField = ({
  label,
  name,
  type = "text",
  placeholder = "",
  className = "",
  isDatePicker = false,
  min,
}: InputFieldProps) => {
  const { control } = useFormContext();
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <Controller
        control={control}
        name={name}
        render={({ field }) =>
          isDatePicker ? (
            <Suspense>
              <DatePicker
                id={name}
                selected={parseValueToDate(field.value)}
                onChange={(date: Date | null) => {
                  if (date) {
                    // 사용자 선택한 로컬 날짜를 "YYYY-MM-DD" 형식 문자열로 저장
                    const only = dateToDateOnlyString(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
                    field.onChange(only);
                  } else {
                    field.onChange(null);
                  }
                }}
                placeholderText={placeholder || "날짜 선택"}
                dateFormat="yyyy/MM/dd"
                locale={ko}
                showYearDropdown
                showMonthDropdown
                scrollableYearDropdown
                className={clsx(
                  "mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                  className
                )}
              />
            </Suspense>
          ) : (
            <input
              id={name}
              type={type}
              placeholder={placeholder}
              min={min}
              className={clsx(
                "mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                className
              )}
              {...field}
              value={field.value === null || field.value === undefined ? "" : field.value}
              onChange={(e) => {
                const val = e.target.value;
                field.onChange(val === "" ? null : val);
              }}
            />
          )
        }
      />
    </div>
  );
};

const SelectField = ({
  label,
  name,
  options,
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  options: string[];
  placeholder?: string;
  className?: string;
}) => {
  const { control } = useFormContext();

  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <select
            {...field}
            onChange={(e) => {
              if (e.target.value === "") {
                field.onChange(null);
              } else {
                field.onChange(e.target.value);
              }
            }}
            value={field.value || ""}
            className={clsx(
              "mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
              className
            )}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {(options || []).map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        )}
      />
    </div>
  );
};

const Button = ({
  type,
  label,
  className = "p-2 border",
  isSelected = false,
  onClick,
}: {
  type: "button" | "submit";
  label: string;
  className?: string;
  isSelected?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) => {
  const buttonStyle = getButtonStyle(isSelected);
  return (
    <button
      type={type}
      className={clsx(className, "p-3 rounded")}
      style={buttonStyle}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

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
  const watchedDirection = watch("direction");
  const watchedDirectionBase = watch("directionBase");

  // 라디오 클릭 핸들러 (필요 시 의존 필드 정리)
  const pick = useCallback((field: string, value: string | null) => {
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

  const handleRadioChange = (
    item: string | null,
    type: "direction" | "directionBase"
  ) => {
    setValue(type, item, { shouldDirty: true, shouldTouch: true });
  };

  const getButtonStyle = (current: string | null | undefined, item: string | null) => ({
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
          {["유", "무", null].map((item) => (
            <label key={item === null ? "none" : item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("elevatorType")}
                value={item === null ? "" : item}
                checked={elevatorType === item}
                onChange={() => pick("elevatorType", item)}
              />
              <span style={getButtonStyle(elevatorType, item)}>{item === null ? "선택없음" : item}</span>
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
          {["즉시", "가까운 시일내 협의", null].map((item) => (
            <label key={item === null ? "none" : item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("moveInType")}
                value={item === null ? "" : item}
                checked={moveInType === item}
                onChange={() => pick("moveInType", item)}
              />
              <span style={getButtonStyle(moveInType, item)}>{item === null ? "선택없음" : item}</span>
            </label>
          ))}
        </div>

        {moveInType === "가까운 시일내 협의" && (
          <Controller
            control={control}
            name="moveInDate" // 폼에는 'YYYY-MM-DD' 문자열로 저장
            render={({ field }) => (
              <Suspense>
                <DatePicker
                  selected={toDate(field.value)}
                  onChange={(d) => field.onChange(toYMD(d))}
                  dateFormat="yyyy/MM/dd"
                  placeholderText="입주 가능일 선택"
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  locale={ko}
                  portalId="react-datepicker-portal"
                />
              </Suspense>
            )}
          />
        )}
      </div>

      {/* 난방 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">난방</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
          {["지역난방", "개별난방", "중앙난방", null].map((item) => (
            <label key={item === null ? "none" : item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("heatingType")}
                value={item === null ? "" : item}
                checked={heatingType === item}
                onChange={() => pick("heatingType", item)}
              />
              <span style={getButtonStyle(heatingType, item)}>{item === null ? "선택없음" : item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 수익률 사용 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">수익률 사용</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
          {["미사용", "상가수익률", "건물수익률", "기타수익률", null].map((item) => (
            <label key={item === null ? "none" : item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("yieldType")}
                value={item === null ? "" : item}
                checked={yieldType === item}
                onChange={() => pick("yieldType", item)}
              />
              <span style={getButtonStyle(yieldType, item)}>{item === null ? "선택없음" : item}</span>
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
            <Suspense>
              <DatePicker
                selected={toDate(field.value)}
                onChange={(d) => field.onChange(toYMD(d))}
                dateFormat="yyyy/MM/dd"
                placeholderText="계약만료일 선택"
                className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                locale={ko}
              />
            </Suspense>
          )}
        />
      </div>

      {/* 방향기준 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">햇빛 방향기준</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
          {["거실", "안방", "주된출입구", null].map((item) => (
            <label key={item === null ? "none" : item} className="cursor-pointer">
              <input
                type="radio"
                {...register("directionBase")}
                value={item === null ? "" : item}
                className="hidden"
                checked={watchedDirectionBase === item}
                onChange={() => handleRadioChange(item, "directionBase")}
              />
              <span style={getButtonStyle(watchedDirectionBase, item)}>{item === null ? "선택없음" : item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 방향 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">햇빛 방향</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
          {["동향", "서향", "남향", "북향", "북동향", "남동향", "남서향", "북서향", null].map((item) => (
            <label key={item === null ? "none" : item} className="cursor-pointer">
              <input
                type="radio"
                {...register("direction")}
                value={item === null ? "" : item}
                className="hidden"
                checked={watchedDirection === item}
                onChange={() => handleRadioChange(item, "direction")}
              />
              <span style={getButtonStyle(watchedDirection, item)}>{item === null ? "선택없음" : item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 건축정보(캘린더) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InputField label="착공일자" name="constructionYear" isDatePicker />
        <InputField label="허가일자" name="permitDate" isDatePicker />
        <InputField label="사용승인일자" name="approvalDate" isDatePicker />
      </div>

      {/* 주차 숫자 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InputField label="세대당 주차수" name="parkingPerUnit" type="number" />
        <InputField label="전체주차수" name="totalParking" type="number" />
        <InputField label="주차비" name="parkingFee" type="number" />
      </div>

      {/* 토지건축물정보 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="용도지역" name="landUse" options={["주거지역", "상업지역", "공업지역", "녹지지역", "보전관리지역", "생산관리지역", "계획관리지역", "농림지역", "자연환경보전지역"]} placeholder="선택없음" />
        <SelectField label="지목" name="landType" options={["전", "답", "과수원", "목장용지", "임야", "광천지", "염전", "대", "공장용지", "학교용지", "주차장", "주유소용지", "창고용지", "도로", "철도용지", "제방", "하천", "구거", "유지", "양어장", "수도용지", "공원", "체육용지", "유원지", "종교용지", "사적지", "묘지", "잡종지"]} placeholder="선택없음" />
        <InputField label="건축물용도" name="buildingUse" placeholder='ex) 주거용도' />
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
