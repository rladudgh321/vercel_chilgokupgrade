"use client";

import { useFormContext, useWatch } from "react-hook-form";
import {
  buttonBaseStyle,
  buttonActiveStyle,
  buttonInactiveStyle,
  InputField,
  SelectField,
} from "@/app/components/form-fields";
import clsx from "clsx";

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
  const { control, setValue, register, getValues } = useFormContext();

  const watchedPopularity = useWatch({ control, name: "popularity" });
  const watchedRoomOptionId = useWatch({ control, name: "roomOptionId" });
  const watchedBathroomOptionId = useWatch({ control, name: "bathroomOptionId" });
  const watchedThemes = useWatch({ control, name: "themes" }) ?? [];
  const watchedBuildingOptions = useWatch({ control, name: "buildingOptions" }) ?? [];
  const watchedParking = useWatch({ control, name: "parking" }) ?? [];

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 bg-slate-100 dark:bg-slate-800">
      {/* 인기/급매 */}
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          인기/급매
        </label>
        <div className="flex space-x-0 mt-2">
          {["인기", "급매", "선택없음"].map((item) => (
            <label key={item} className="cursor-pointer">
              <input
                type="radio"
                {...register("popularity")}
                value={item}
                className="hidden"
                checked={watchedPopularity === item}
                onChange={() => setValue("popularity", item === "선택없음" ? null : item, { shouldDirty: true })}
              />
              <span className={clsx(buttonBaseStyle, watchedPopularity === item ? buttonActiveStyle : buttonInactiveStyle)}>{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 테마 */}
      <div className="flex flex-col">
        <label className="dark:text-gray-300">테마</label>
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
                    onChange={() => {
                      const current = getValues("themes") ?? [];
                      const next = current.includes(theme)
                        ? current.filter((x: any) => x !== theme)
                        : [...current, theme];
                      setValue("themes", next, { shouldDirty: true });
                    }}
                  />
                  <span className={clsx(buttonBaseStyle, checked ? buttonActiveStyle : buttonInactiveStyle)}>
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
        <label className="dark:text-gray-300">옵션</label>
        <div className="flex space-x-2 mt-2 flex-wrap gap-y-4">
          {(buildingOptions || []).map((opt) => {
            const checked = watchedBuildingOptions.includes(opt.id);
            return (
              <label key={opt.id} className="cursor-pointer">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={checked}
                  onChange={() => {
                    const current = getValues("buildingOptions") ?? [];
                    const next = current.includes(opt.id)
                      ? current.filter((x: any) => x !== opt.id)
                      : [...current, opt.id];
                    setValue("buildingOptions", next, { shouldDirty: true });
                  }}
                />
                <span className={clsx(buttonBaseStyle, checked ? buttonActiveStyle : buttonInactiveStyle)}>
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">방수</label>
          <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
            {(roomOptions || []).map((item) => (
              <label key={`${item.id}-${item.name}`} className="cursor-pointer">
                <input
                  type="radio"
                  {...register("roomOptionId")}
                  value={item.id}
                  className="hidden"
                  checked={watchedRoomOptionId === item.id}
                  onChange={() => setValue("roomOptionId", item.id, { shouldDirty: true })}
                />
                <span className={clsx(buttonBaseStyle, watchedRoomOptionId === item.id ? buttonActiveStyle : buttonInactiveStyle)}>{item.name}</span>
              </label>
            ))}
            <label className="cursor-pointer">
              <input
                type="radio"
                name="roomOptionId"
                value=""
                className="hidden"
                checked={watchedRoomOptionId === null}
                onChange={() => setValue("roomOptionId", null, { shouldDirty: true })}
              />
              <span className={clsx(buttonBaseStyle, watchedRoomOptionId === null ? buttonActiveStyle : buttonInactiveStyle)}>선택없음</span>
            </label>
          </div>
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">화장실수</label>
          <div className="flex space-x-0 mt-2 flex-wrap gap-y-4">
            {(bathroomOptions || []).map((item) => (
              <label key={`${item.id}-${item.name}`} className="cursor-pointer">
                <input
                  type="radio"
                  {...register("bathroomOptionId")}
                  value={item.id}
                  className="hidden"
                  checked={watchedBathroomOptionId === item.id}
                  onChange={() => setValue("bathroomOptionId", item.id, { shouldDirty: true })}
                />
                <span className={clsx(buttonBaseStyle, watchedBathroomOptionId === item.id ? buttonActiveStyle : buttonInactiveStyle)}>{item.name}</span>
              </label>
            ))}
            <label className="cursor-pointer">
              <input
                type="radio"
                name="bathroomOptionId"
                value=""
                className="hidden"
                checked={watchedBathroomOptionId === null}
                onChange={() => setValue("bathroomOptionId", null, { shouldDirty: true })}
              />
              <span className={clsx(buttonBaseStyle, watchedBathroomOptionId === null ? buttonActiveStyle : buttonInactiveStyle)}>선택없음</span>
            </label>
          </div>
        </div>
      </div>

      {/* 주차옵션 */}
      <div className="flex flex-col">
        <label className="dark:text-gray-300">주차옵션</label>
        <div className="flex space-x-2 mt-2 flex-wrap gap-y-4">
          {["주차가능", "주차불가", "주차협의", "자주식주차", "기계식주차"].map((opt) => {
            const checked = watchedParking.includes(opt);
            return (
              <label key={opt} className="cursor-pointer">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={checked}
                  onChange={() => {
                    const current = getValues("parking") ?? [];
                    const next = current.includes(opt)
                      ? current.filter((x: any) => x !== opt)
                      : [...current, opt];
                    setValue("parking", next, { shouldDirty: true });
                  }}
                />
                <span className={clsx(buttonBaseStyle, checked ? buttonActiveStyle : buttonInactiveStyle)}>
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
        <InputField label="전용면적" name="NetLeasableArea" type="number" placeholder="m² 단위 숫자" />
      </div>

      {/* 담당자 및 고객 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="담당자" name="staff" placeholder='대표님 성함' />
        <SelectField label="고객 종류" name="customerType" options={["매도자", "매수자", "임대인","기타"]} />
        <InputField label="고객 이름" name="customerName" />
        <InputField label="고객 연락처(노출안됨)" name="secretContact" placeholder='예: 010-1234-5678 / 내선 123 등' />
      </div>
    </div>
  );
};

export default BuildBasic;
