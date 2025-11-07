"use client";

import React, { lazy, MouseEventHandler, Suspense } from "react";
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

/* =========================
   BuildBasic 본문
   ========================= */
interface BuildBasicProps {
  roomOptions: { id: number; name: string }[];
  bathroomOptions: { id: number; name: string }[];
  themeOptions: string[];
  labelOptions: string[];
  buildingOptions: { id: number; name: string }[];
}

const BuildBasic = ({ roomOptions, bathroomOptions, themeOptions, labelOptions, buildingOptions }: BuildBasicProps) => {
  const { watch, setValue, register, getValues } = useFormContext();

  // ✅ 폼 값 watch (오타 수정 및 값 보정)
  const watchedPopularity = watch("popularity") ?? "";
  const watchedDirection = watch("direction") ?? "";
  const watchedDirectionBase = watch("directionBase") ?? "";
  const watchedRoomOptionId = watch("roomOptionId") ?? "";
  const watchedBathroomOptionId = watch("bathroomOptionId") ?? "";
  const watchedThemes = watch("themes") ?? [];
  const watchedBuildingOptions = watch("buildingOptions") ?? [];
  const watchedParking = watch("parking") ?? [];

  // ✅ 라디오(단일 선택) → 폼 값 갱신
  const handleRadioChange = (
    item: string | number,
    type: "popularity" | "direction" | "directionBase" | "roomOptionId" | "bathroomOptionId"
  ) => {
    setValue(type, item, { shouldDirty: true, shouldTouch: true });
  };

  // ✅ 체크박스(다중 선택) → 폼/로컬 동시 갱신
  const handleBuildingOptionsButtonClick = (v: number) => {
    const current = getValues("buildingOptions") ?? [];
    const next = current.includes(v)
      ? current.filter((x: number) => x !== v)
      : [...current, v];
    setValue("buildingOptions", next, { shouldDirty: true, shouldTouch: true });
  };
  const handleParkingButtonClick = (v: string) => {
    const current = getValues("parking") ?? [];
    const next = current.includes(v)
      ? current.filter((x: string) => x !== v)
      : [...current, v];
    setValue("parking", next, { shouldDirty: true, shouldTouch: true });
  };

  const handleThemesButtonClick = (v: string) => {
    const current = getValues("themes") ?? [];
    const next = current.includes(v)
      ? current.filter((x: string) => x !== v)
      : [...current, v];
    setValue("themes", next, { shouldDirty: true, shouldTouch: true });
  };

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 bg-slate-100">
      {/* 인기/급매 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700">
          인기/급매
        </label>
        <div className="flex space-x-0 mt-2">
          {["인기", "급매"].map((item) => (
            <label key={item} className="cursor-pointer">
              <input
                type="radio"
                {...register("popularity")}
                value={item}
                className="hidden"
                checked={watchedPopularity === item}
                onChange={() => handleRadioChange(item, "popularity")}
              />
              <span style={getButtonStyle(watchedPopularity, item)}>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 테마 */}
      <div className="flex flex-col">
        <label>테마</label>
        <div className="flex space-x-2 mt-2 flex-wrap gap-y-4">
          {(themeOptions || []).map(
            (theme) => {
              const checked = watchedThemes.includes(theme);
              return (
                <label key={theme} className="cursor-pointer">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={() => handleThemesButtonClick(theme)}
                  />
                  <span style={getButtonStyle(checked ? theme : null, theme)}>
                    {theme}
                  </span>
                </label>
              );
            }
          )}
        </div>
      </div>

      {/* 옵션 */}
      <div className="flex flex-col">
        <label>옵션</label>
        <div className="flex space-x-2 mt-2 flex-wrap gap-y-4">
          {(buildingOptions || []).map((opt) => {
            const checked = watchedBuildingOptions.includes(opt.id);
            return (
              <label key={opt.id} className="cursor-pointer">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={checked}
                  onChange={() => handleBuildingOptionsButtonClick(opt.id)}
                />
                <span style={getButtonStyle(checked ? opt.name : null, opt.name)}>
                  {opt.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 방수/화장실수 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700">방수</label>
          <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
            {(roomOptions || []).map((item) => (
              <label key={`${item.id}-${item.name}`} className="cursor-pointer">
                <input
                  type="radio"
                  {...register("roomOptionId")}
                  value={item.id}
                  className="hidden"
                  checked={watchedRoomOptionId === item.id}
                  onChange={() => handleRadioChange(item.id, "roomOptionId")}
                />
                <span style={getButtonStyle(watchedRoomOptionId, item.id)}>{item.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700">화장실수</label>
          <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
            {(bathroomOptions || []).map((item) => (
              <label key={`${item.id}-${item.name}`} className="cursor-pointer">
                <input
                  type="radio"
                  {...register("bathroomOptionId")}
                  value={item.id}
                  className="hidden"
                  checked={watchedBathroomOptionId === item.id}
                  onChange={() => handleRadioChange(item.id, "bathroomOptionId")}
                />
                <span style={getButtonStyle(watchedBathroomOptionId, item.id)}>{item.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 주차옵션 */}
      <div className="flex flex-col">
        <label>주차옵션</label>
        <div className="flex space-x-2 mt-2 flex-wrap gap-y-4">
          {["주차가능", "주차불가", "주차협의", "자주식주차", "기계식주차"].map((opt) => {
            const checked = watchedParking.includes(opt);
            return (
              <label key={opt} className="cursor-pointer">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={checked}
                  onChange={() => handleParkingButtonClick(opt)}
                />
                <span style={getButtonStyle(checked ? opt : null, opt)}>
                  {opt}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 라벨선택 */}
      <div className="flex flex-col">
        <SelectField
          label="라벨선택"
          name="label"
          options={labelOptions}
          placeholder="선택없음"
        />
      </div>

      {/* 층수 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="층수" name="floorType" options={["지상", "지하", "반지하", "옥탑"]} />
        <InputField label="현재층" name="currentFloor" type="number" placeholder="숫자만 입력하세요" />
        <InputField label="지상 전체층" name="totalFloors" type="number" placeholder="숫자만 입력하세요" min={0} />
        <InputField label="지하 전체층" name="basementFloors" type="number" placeholder="숫자만 입력하세요" min={0} />
        <InputField label="층수 설명" name="floorDescription" placeholder="발코니 확장했어요. 중간층에 라운지가 있어요" />
      </div>

      {/* 면적 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="실면적" name="actualArea" type="number" placeholder="m² 단위 숫자" />
        <InputField label="공급면적" name="supplyArea" type="number" placeholder="m² 단위 숫자" />
        <InputField label="대지면적" name="landArea" type="number" placeholder="m² 단위 숫자" />
        <InputField label="건축면적" name="buildingArea" type="number" placeholder="m² 단위 숫자" />
        <InputField label="연면적" name="totalArea" type="number" placeholder="m² 단위 숫자" />
      </div>

      {/* 담당자 및 고객 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="담당자" name="staff" placeholder='대표님 성함' />
        <SelectField label="고객 종류" name="customerType" options={["매도자", "매수자", "임대인","기타"]} />
        <InputField label="고객 이름" name="customerName" />
      </div>
    </div>
  );
};

export default BuildBasic;
