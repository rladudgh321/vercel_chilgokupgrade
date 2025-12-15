import React, { lazy, Suspense } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import {
  buttonBaseStyle,
  buttonActiveStyle,
  buttonInactiveStyle,
  InputField,
  SelectField,
  toDate,
  toYMD,
} from "@/app/components/form-fields";
import clsx from "clsx";

const DatePicker = lazy(() => import("react-datepicker"));

const BuildingInfo = () => {
  const { register, setValue, control } = useFormContext();

  const elevatorType   = useWatch({ control, name: "elevatorType" });
  const heatingType    = useWatch({ control, name: "heatingType" });
  const yieldType      = useWatch({ control, name: "yieldType" });
  const moveInType     = useWatch({ control, name: "moveInType" });
  const watchedDirection = useWatch({ control, name: "direction" });
  const watchedDirectionBase = useWatch({ control, name: "directionBase" });

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 bg-slate-100 dark:bg-slate-800">

      {/* 엘리베이터 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">엘리베이터</label>
        <div className="flex space-x-0 mt-2">
          {["유", "무", null].map((item) => (
            <label key={item === null ? "none" : item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("elevatorType")}
                value={item === null ? "" : item}
                checked={elevatorType === item}
                onChange={() => {
                  setValue("elevatorType", item, { shouldDirty: true });
                  if (item !== "유") {
                    setValue("elevatorCount", 0, { shouldDirty: true });
                  }
                }}
              />
              <span className={clsx(buttonBaseStyle, elevatorType === item ? buttonActiveStyle : buttonInactiveStyle)}>{item === null ? "선택없음" : item}</span>
            </label>
          ))}
        </div>

        {elevatorType === "유" && (
          <div className="mt-2">
            <label htmlFor="elevatorCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              엘리베이터 갯수
            </label>
            <input
              id="elevatorCount"
              type="number"
              placeholder="갯수 입력"
              {...register("elevatorCount", {
                setValueAs: (v) => v === "" || v == null ? 0 : Number(v),
              })}
              className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* 입주 가능일 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">입주 가능일</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
          {["즉시", "가까운 시일내 협의", null].map((item) => (
            <label key={item === null ? "none" : item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("moveInType")}
                value={item === null ? "" : item}
                checked={moveInType === item}
                onChange={() => {
                  setValue("moveInType", item, { shouldDirty: true });
                  if (item !== "가까운 시일내 협의") {
                    setValue("moveInDate", "", { shouldDirty: true });
                  }
                }}
              />
              <span className={clsx(buttonBaseStyle, moveInType === item ? buttonActiveStyle : buttonInactiveStyle)}>{item === null ? "선택없음" : item}</span>
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
                  className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">난방</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
          {["지역난방", "개별난방", "중앙난방", null].map((item) => (
            <label key={item === null ? "none" : item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("heatingType")}
                value={item === null ? "" : item}
                checked={heatingType === item}
                onChange={() => setValue("heatingType", item, { shouldDirty: true })}
              />
              <span className={clsx(buttonBaseStyle, heatingType === item ? buttonActiveStyle : buttonInactiveStyle)}>{item === null ? "선택없음" : item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 수익률 사용 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">수익률 사용</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
          {["미사용", "상가수익률", "건물수익률", "기타수익률", null].map((item) => (
            <label key={item === null ? "none" : item} className="cursor-pointer">
              <input
                type="radio"
                className="hidden"
                {...register("yieldType")}
                value={item === null ? "" : item}
                checked={yieldType === item}
                onChange={() => {
                  setValue("yieldType", item, { shouldDirty: true });
                  if (item !== "기타수익률") {
                    setValue("otherYield", "", { shouldDirty: true });
                  }
                }}
              />
              <span className={clsx(buttonBaseStyle, yieldType === item ? buttonActiveStyle : buttonInactiveStyle)}>{item === null ? "선택없음" : item}</span>
            </label>
          ))}
        </div>

        {yieldType === "기타수익률" && (
          <input
            type="text"
            placeholder="기타수익률 입력"
            {...register("otherYield")}
            className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        )}
      </div>

      {/* 계약만료일 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">계약만료일</label>
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
                className="mt-2 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                locale={ko}
              />
            </Suspense>
          )}
        />
      </div>

      {/* 방향기준 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">햇빛 방향기준</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
          {["거실", "안방", "주된출입구", null].map((item) => (
            <label key={item === null ? "none" : item} className="cursor-pointer">
              <input
                type="radio"
                {...register("directionBase")}
                value={item === null ? "" : item}
                className="hidden"
                checked={watchedDirectionBase === item}
                onChange={() => setValue("directionBase", item, { shouldDirty: true })}
              />
              <span className={clsx(buttonBaseStyle, watchedDirectionBase === item ? buttonActiveStyle : buttonInactiveStyle)}>{item === null ? "선택없음" : item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 방향 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">햇빛 방향</label>
        <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
          {["동향", "서향", "남향", "북향", "북동향", "남동향", "남서향", "북서향", null].map((item) => (
            <label key={item === null ? "none" : item} className="cursor-pointer">
              <input
                type="radio"
                {...register("direction")}
                value={item === null ? "" : item}
                className="hidden"
                checked={watchedDirection === item}
                onChange={() => setValue("direction", item, { shouldDirty: true })}
              />
              <span className={clsx(buttonBaseStyle, watchedDirection === item ? buttonActiveStyle : buttonInactiveStyle)}>{item === null ? "선택없음" : item}</span>
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
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
          <input
            id={id}
            type="text"
            {...register(id as any)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder={label}
          />
        </div>
      ))}
    </div>
  );
}
export default BuildingInfo;


