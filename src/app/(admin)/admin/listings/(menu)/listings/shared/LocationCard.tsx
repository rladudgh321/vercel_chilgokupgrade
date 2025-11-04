"use client";

import { useFormContext, useWatch } from "react-hook-form";
import AddressVisibility from "@/app/components/admin/listings/AddressVisibility";
import { useState } from "react";
import DaumPostcode from "react-daum-postcode";

type AddressState = "public" | "private" | "exclude";

const LocationCard = () => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext<{
    address: string;
    dong: string;
    ho: string;
    etc: string;
    isAddressPublic: AddressState;
  }>();

  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    setValue("address", fullAddress, { shouldDirty: true });
    if (data.buildingName) {
      setValue("dong", data.buildingName, { shouldDirty: true });
    }
    setIsPostcodeOpen(false);
  };

  // ✅ RHF 폼 값 구독 (reset 시 내려온 값이 여기로 들어옴)
  const isAddressPublic = useWatch({ name: "isAddressPublic" }) as
    | AddressState
    | undefined;

  // ✅ AddressVisibility에서 라디오 변경 → 폼 값에 바로 반영
  const handleRadioChange = (next: AddressState) => {
    setValue("isAddressPublic", next, { shouldDirty: true });
  };

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 bg-slate-100">
      {isPostcodeOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ width: "400px", backgroundColor: "white", padding: "20px" }}>
            <DaumPostcode onComplete={handleComplete} />
            <button type="button" onClick={() => setIsPostcodeOpen(false)}>닫기</button>
          </div>
        </div>
      )}

      {/* 주소 */}
      <div className="flex flex-col">
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700"
        >
          주소
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="address"
            {...register("address", { required: "주소를 입력해주세요" })}
            placeholder="상세주소 입력하세요"
            className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setIsPostcodeOpen(true)}
            className="mt-1 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            주소 검색
          </button>
        </div>
        {errors.address && (
          <p className="text-red-500 text-xs">
            {errors.address.message as string}
          </p>
        )}
      </div>

      {/* 동/호 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label
            htmlFor="dong"
            className="block text-sm font-medium text-gray-700"
          >
            동
          </label>
          <input
            type="text"
            id="dong"
            {...register("dong")}
            placeholder="동"
            className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="ho"
            className="block text-sm font-medium text-gray-700"
          >
            호
          </label>
          <input
            type="text"
            id="ho"
            {...register("ho")}
            placeholder="호수"
            className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 기타사항 */}
      <div className="flex flex-col">
        <label
          htmlFor="etc"
          className="block text-sm font-medium text-gray-700"
        >
          기타사항
        </label>
        <input
          type="text"
          id="etc"
          {...register("etc")}
          placeholder="기타사항"
          className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 주소 공개 여부 */}
      <AddressVisibility
        activeAddressPublic={isAddressPublic ?? "public"} // ✅ reset된 값 표시 (없으면 기본 'public')
        handleRadioChange={handleRadioChange} // ✅ 폼 값으로 즉시 반영
        serverSync={false} // 폼 내에서는 서버 호출 없이 제출 시 저장
        ArrayType={false}
      />


    </div>
  );
};

export default LocationCard;