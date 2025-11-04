// app/components/admin/listings/BuildForm.tsx
"use client";

import { FormProvider, UseFormReturn } from "react-hook-form";
import Container from "./Container";
import LocationCard from "./LocationCard";
import LandInfo from "./LandInfo";
import BuildBasic from "./BuildBasic";
import BuildingInfo from "./BuildingInfo";
import Editor from "./Editor";
import SaveImage from "./SaveImage";

export type AddressState = "public" | "private" | "exclude";

// ✅ schema.prisma(Build)에 맞춘 FormData
export interface FormData {
  // LocationCard
  address: string;
  dong: string;
  ho: string;
  etc: string;
  isAddressPublic: AddressState;

  // LandInfo (리스팅/거래/가격)
  propertyType: string | null;       // 자유 문자열 필드 유지
  listingTypeId: number | null;      // ✅ relation
  buyTypeId: number | null;
  dealScope: string | null;
  visibility: boolean;               // ✅ boolean으로 수정
  priceDisplay: string | null;

  // 가격 + 표시 플래그
  salePrice: number | null;
  isSalePriceEnabled: boolean;
  lumpSumPrice: number | null;
  isLumpSumPriceEnabled: boolean;
  actualEntryCost: number | null;
  isActualEntryCostEnabled: boolean;
  rentalPrice: number | null;
  isRentalPriceEnabled: boolean;
  halfLumpSumMonthlyRent: number | null;
  isHalfLumpSumMonthlyRentEnabled: boolean;
  deposit: number | null;
  isDepositEnabled: boolean;
  managementFee: number | null;
  isManagementFeeEnabled: boolean;
  managementEtc: string | null;

  // BuildBasic
  popularity: string | null;
  label: string | null;
  floorType: string | null;
  currentFloor: number | null;
  totalFloors: number | null;
  basementFloors: number | null;
  floorDescription: string | null;
  roomOptionId: number | null;
  bathroomOptionId: number | null;
  actualArea: number | null;
  supplyArea: number | null;
  landArea: number | null;
  buildingArea: number | null;
  totalArea: number | null;
  themes: string[];                  // String[]
  buildingOptions: number[];         // relation: 선택된 option id 리스트 추천
  constructionYear: string | Date | null;
  permitDate: string | Date | null;
  approvalDate: string | Date | null;
  parkingPerUnit: number | null;
  totalParking: number | null;
  parkingFee: number | null;
  parking: string[];                 // String[]
  direction: string | null;
  directionBase: string | null;
  landUse: string | null;
  landType: string | null;
  buildingUse: string | null;
  staff: string | null;
  customerType: string | null;
  customerName: string | null;

  // BuildingInfo
  elevatorType: string | null;
  elevatorCount: number | null;
  moveInType: string | null;
  moveInDate: string | Date | null;
  heatingType: string | null;
  yieldType: string | null;
  otherYield: string | null;
  contractEndDate: string | Date | null;
  buildingName: string | null;
  floorAreaRatio: string | null;
  otherUse: string | null;
  mainStructure: string | null;
  height: string | null;
  roofStructure: string | null;

  // DetailDescription
  title: string | null;
  editorContent: string | null;
  secretNote: string | null;
  secretContact: string | null;

  // SaveImage (프론트: 배열 유지를 권장)
  mainImage: string | null;
  subImage: string[];     // 백엔드에서 Json으로 직렬화
  adminImage: string[];   // 백엔드에서 Json으로 직렬화
}

// ✅ 기본값도 스키마 타입에 맞춤
export const BASE_DEFAULTS: FormData = {
  // Location
  address: "",
  dong: "",
  ho: "",
  etc: "",
  isAddressPublic: "public",

  // LandInfo
  propertyType: "",
  listingTypeId: null,
  buyTypeId: null,
  dealScope: "전체",
  visibility: true,
  priceDisplay: "공개",

  salePrice: null,
  isSalePriceEnabled: false,
  lumpSumPrice: null,
  isLumpSumPriceEnabled: false,
  actualEntryCost: null,
  isActualEntryCostEnabled: false,
  rentalPrice: null,
  isRentalPriceEnabled: false,
  halfLumpSumMonthlyRent: null,
  isHalfLumpSumMonthlyRentEnabled: false,
  deposit: null,
  isDepositEnabled: false,
  managementFee: null,
  isManagementFeeEnabled: false,
  managementEtc: "",

  // BuildBasic
  popularity: "",
  label: "",
  floorType: "지상",
  currentFloor: null,
  totalFloors: null,
  basementFloors: null,
  floorDescription: "",
  roomOptionId: null,
  bathroomOptionId: null,
  actualArea: null,
  supplyArea: null,
  landArea: null,
  buildingArea: null,
  totalArea: null,
  themes: [],
  buildingOptions: [],           // id 배열 권장
  constructionYear: null,        // 연도만 받는다면 'YYYY-01-01'로 매핑
  permitDate: null,
  approvalDate: null,
  parkingPerUnit: null,
  totalParking: null,
  parkingFee: null,
  parking: [],
  direction: "",
  directionBase: "",
  landUse: "",
  landType: "",
  buildingUse: "",
  staff: "",
  customerType: "",
  customerName: "",

  // BuildingInfo
  elevatorType: "",
  elevatorCount: null,
  moveInType: "",
  moveInDate: null,
  heatingType: "",
  yieldType: "",
  otherYield: "",
  contractEndDate: null,
  buildingName: "",
  floorAreaRatio: "",
  otherUse: "",
  mainStructure: "",
  height: "",
  roofStructure: "",

  // Description
  title: "",
  editorContent: "",
  secretNote: "",
  secretContact: "",

  // Images
  mainImage: "",
  subImage: [],
  adminImage: [],
};

type Props = {
  methods: UseFormReturn<FormData>;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
  mode: "create" | "update";
  submitLabel?: string;
  onCancel?: () => void;
  onImageLoadingStateChange?: (isLoading: boolean) => void;
  // 선택 옵션들 (id/label로 내려받는 걸 권장)
  roomOptions?: { id: number, name: string }[];      // 필요하면 { id:number; name:string }[] 로 전환
  bathroomOptions?: { id: number, name: string }[];  // 동일
  themeOptions?: string[];
  labelOptions?: string[];
  buildingOptions?: { id: number, name: string }[];
};

export default function BuildForm({
  methods,
  onSubmit,
  isSubmitting,
  mode,
  submitLabel,
  onCancel,
  onImageLoadingStateChange,
  roomOptions,
  bathroomOptions,
  themeOptions,
  labelOptions,
  buildingOptions,
}: Props) {
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-4"
        encType="multipart/form-data"
      >
        <Container title="위치정보">
          <LocationCard />
        </Container>

        <Container title="매물정보">
          <LandInfo />
        </Container>

        <Container title="기본정보">
          {/* buildingOptions를 id 배열로 받도록 컴포넌트도 맞춰주면 백엔드 매핑이 깔끔합니다 */}
          <BuildBasic
            roomOptions={roomOptions!}
            bathroomOptions={bathroomOptions!}
            themeOptions={themeOptions!}
            labelOptions={labelOptions!}
            buildingOptions={buildingOptions!}
          />
        </Container>

        <Container title="건물 추가 정보">
          <BuildingInfo />
        </Container>

        <Container title="상세 설명">
          <Editor name="editorContent" />
        </Container>

        <Container title="사진 작업">
          <SaveImage onImageLoadingStateChange={onImageLoadingStateChange} />
        </Container>

        <div className="mt-4 flex gap-x-4">
          <button
            type="submit"
            disabled={!!isSubmitting}
            className={`w-full py-2 rounded-md transition duration-300 ${
              isSubmitting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isSubmitting ? (mode === "create" ? "등록 중..." : "수정 중...") : submitLabel ?? (mode === "create" ? "등록" : "수정")}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            뒤로가기
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
