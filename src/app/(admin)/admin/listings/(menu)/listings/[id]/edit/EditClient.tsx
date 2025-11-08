"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import BuildForm, { BASE_DEFAULTS, FormData } from "@/app/(admin)/admin/listings/(menu)/listings/shared/BuildForm";
import { BuildFindOne, BuildUpdate } from "@/app/apis/build";

interface Option { id: number; name: string }

// ---- fetchers (그대로) ----
const fetchRoomOptions = async (): Promise<Option[]> => {
  const res = await fetch("/api/room-options", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch room options");
  const json = await res.json();
  return json.data;
};
const fetchBathroomOptions = async (): Promise<Option[]> => {
  const res = await fetch("/api/bathroom-options", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch bathroom options");
  const json = await res.json();
  return json.data;
};
const fetchLabelOptions = async (): Promise<Option[]> => {
  const res = await fetch("/api/labels", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch label options");
  const json = await res.json();
  return json.data;
};

const fetchBuildingOptions = async (): Promise<Option[]> => {
  const res = await fetch("/api/building-options", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch building options");
  const json = await res.json();
  return json.data;
};

const fetchThemeOptions = async () => {
  const res = await fetch("/api/theme-images", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch theme options");
  const json = await res.json();
  return json.data.map((item: { label: string }) => item.label);
};

// ---- helpers ----
const toDateStr = (v: unknown): string | null => {
  if (!v) return null;
  const d = typeof v === "string" ? new Date(v) : v instanceof Date ? v : null;
  if (!d || Number.isNaN(d.getTime())) return null;

  // 로컬 기준 날짜
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`; // YYYY-MM-DD (로컬 기준)
};

const toStrArray = (v: unknown): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) {
    return v
      .map((x) =>
        typeof x === "string" ? x : (x as any)?.url ?? ""
      )
      .filter((s) => typeof s === "string" && s.trim().length > 0);
  }
  if (typeof v === "string") return v.trim() ? [v.trim()] : [];
  if (typeof v === "object") {
    const url = (v as any)?.url;
    return typeof url === "string" && url.trim() ? [url.trim()] : [];
  }
  return [];
};

const toIdArray = (v: unknown): number[] => {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "object" && x ? (x as any).id : null))
    .filter((id): id is number => typeof id === "number");
};

// ---- prisma Build -> FormData 정규화 (schema.prisma 기준) ----
function normalizeForForm(d: any, themeOptions: string[], labelOptions: Option[]): FormData {
  return {
    ...BASE_DEFAULTS,

    // 위치
    address: d.address ?? "",
    dong: d.dong ?? "",
    ho: d.ho ?? "",
    etc: d.etc ?? "",
    isAddressPublic: d.isAddressPublic ?? "public",

    // LandInfo / 관계
    propertyType: d.propertyType ?? "",
    listingTypeId: d.listingTypeId ?? null,
    buyTypeId: d.buyTypeId ?? null,
    dealScope: d.dealScope ?? "",
    visibility: d.visibility ?? true,
    priceDisplay: d.priceDisplay ?? "",

    // 가격 + 플래그
    salePrice: d.salePrice ?? null,
    isSalePriceEnabled: d.isSalePriceEnabled ?? false,
    lumpSumPrice: d.lumpSumPrice ?? null,
    isLumpSumPriceEnabled: d.isLumpSumPriceEnabled ?? false,
    actualEntryCost: d.actualEntryCost ?? null,
    isActualEntryCostEnabled: d.isActualEntryCostEnabled ?? false,
    rentalPrice: d.rentalPrice ?? null,
    isRentalPriceEnabled: d.isRentalPriceEnabled ?? false,
    halfLumpSumMonthlyRent: d.halfLumpSumMonthlyRent ?? null,
    isHalfLumpSumMonthlyRentEnabled: d.isHalfLumpSumMonthlyRentEnabled ?? false,
    deposit: d.deposit ?? null,
    isDepositEnabled: d.isDepositEnabled ?? false,
    managementFee: d.managementFee ?? null,
    isManagementFeeEnabled: d.isManagementFeeEnabled ?? false,
    managementEtc: d.managementEtc ?? "",

    // 기본 정보
    popularity: d.popularity ?? "",
    label: labelOptions.find(o => o.id === d.labelId)?.name ?? null,
    floorType: d.floorType ?? "지상",
    currentFloor: d.currentFloor ?? null,
    totalFloors: d.totalFloors ?? null,
    basementFloors: d.basementFloors ?? null,
    floorDescription: d.floorDescription ?? "",
    actualArea: d.actualArea ?? null,
    supplyArea: d.supplyArea ?? null,
    landArea: d.landArea ?? null,
    buildingArea: d.buildingArea ?? null,
    totalArea: d.totalArea ?? null,

    roomOptionId: d.roomOptionId ?? null,
    bathroomOptionId: d.bathroomOptionId ?? null,

    // 배열들
    themes: Array.isArray(d.themes) ? d.themes : (themeOptions ?? []),
    buildingOptions: toIdArray(d.buildingOptions),
    parking: Array.isArray(d.parking) ? d.parking : [],

    // 날짜 → YYYY-MM-DD
    constructionYear: toDateStr(d.constructionYear),
    permitDate: toDateStr(d.permitDate),
    approvalDate: toDateStr(d.approvalDate),

    // 설비/기타
    parkingPerUnit: d.parkingPerUnit ?? null,
    totalParking: d.totalParking ?? null,
    parkingFee: d.parkingFee ?? null,
    direction: d.direction ?? "",
    directionBase: d.directionBase ?? "",
    landUse: d.landUse ?? "",
    landType: d.landType ?? "",
    buildingUse: d.buildingUse ?? "",
    staff: d.staff ?? "",
    customerType: d.customerType ?? "",
    customerName: d.customerName ?? "",

    elevatorType: d.elevatorType ?? "",
    elevatorCount: d.elevatorCount ?? null,
    moveInType: d.moveInType ?? "",
    moveInDate: toDateStr(d.moveInDate),
    heatingType: d.heatingType ?? "",
    yieldType: d.yieldType ?? "",
    otherYield: d.otherYield ?? "",
    contractEndDate: toDateStr(d.contractEndDate),
    buildingName: d.buildingName ?? "",
    floorAreaRatio: d.floorAreaRatio ?? "",
    otherUse: d.otherUse ?? "",
    mainStructure: d.mainStructure ?? "",
    height: d.height ?? "",
    roofStructure: d.roofStructure ?? "",

    // 콘텐츠
    title: d.title ?? "",
    editorContent: d.editorContent ?? "",
    secretNote: d.secretNote ?? "",
    secretContact: d.secretContact ?? "",

    // 이미지 (프론트는 string[] 유지)
    mainImage:
      typeof d.mainImage === "string" && d.mainImage.trim()
        ? d.mainImage.trim()
        : (typeof d.mainImage === "object" && d.mainImage?.url ? d.mainImage.url : ""),
    subImage: toStrArray(d.subImage),
    adminImage: toStrArray(d.adminImage),
  } as FormData;
}

export default function EditClient({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isImageLoading, setIsImageLoading] = useState(true);

  
  // 단건
  const { data, isLoading, isError } = useQuery({
    queryKey: ["build", id],
    queryFn: () => BuildFindOne(id),
  });

  // 선택지(이 파일에서는 id/name만 필요)
  const { data: roomOptions = [], isLoading: isLoadingRoomOptions } = useQuery<Option[]>({
    queryKey: ["roomOptions"],
    queryFn: fetchRoomOptions,
  });
  const { data: bathroomOptions = [], isLoading: isLoadingBathroomOptions } = useQuery<Option[]>({
    queryKey: ["bathroomOptions"],
    queryFn: fetchBathroomOptions,
  });
  const { data: themeOptions = [], isLoading: isLoadingThemeOptions } = useQuery<string[]>({
    queryKey: ["themeOptions"],
    queryFn: fetchThemeOptions,
  });
  const { data: labelOptions = [], isLoading: isLoadingLabelOptions } = useQuery<Option[]>({
    queryKey: ["labelOptions"],
    queryFn: fetchLabelOptions,
  });
  const { data: buildingOptions = [], isLoading: isLoadingBuildingOptions } = useQuery<Option[]>({
    queryKey: ["buildingOptions"],
    queryFn: fetchBuildingOptions,
  });

  const methods = useForm<FormData>({ defaultValues: BASE_DEFAULTS });
  const [formKey, setFormKey] = useState(0);

  const allLoaded = useMemo(
    () => !isLoading && !isLoadingRoomOptions && !isLoadingBathroomOptions && !isLoadingThemeOptions && !isLoadingLabelOptions && !isLoadingBuildingOptions,
    [isLoading, isLoadingRoomOptions, isLoadingBathroomOptions, isLoadingThemeOptions, isLoadingLabelOptions, isLoadingBuildingOptions]
  );

  // 데이터 → 폼 reset
  useEffect(() => {
    if (allLoaded && data) {
      methods.reset(normalizeForForm(data, themeOptions, labelOptions));
      setFormKey(prev => prev + 1);
    }
  }, [allLoaded, data, themeOptions, labelOptions, methods]);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: FormData) => {
      const labelId = labelOptions.find((o) => o.name === payload.label)?.id ?? null;
      // 서버에 맞게 변환
      const serverPayload = {
        // 위치/기본
        address: payload.address ?? null,
        dong: payload.dong ?? null,
        ho: payload.ho ?? null,
        etc: payload.etc ?? null,
        isAddressPublic: payload.isAddressPublic ?? "public",

        // LandInfo
        propertyType: payload.propertyType ?? null,
        listingTypeId: payload.listingTypeId ?? null,
        buyTypeId: payload.buyTypeId ?? null,
        dealScope: payload.dealScope ?? null,
        visibility: !!payload.visibility,
        priceDisplay: payload.priceDisplay ?? null,

        // 가격 + 플래그
        salePrice: payload.salePrice ?? null,
        isSalePriceEnabled: !!payload.isSalePriceEnabled,
        lumpSumPrice: payload.lumpSumPrice ?? null,
        isLumpSumPriceEnabled: !!payload.isLumpSumPriceEnabled,
        actualEntryCost: payload.actualEntryCost ?? null,
        isActualEntryCostEnabled: !!payload.isActualEntryCostEnabled,
        rentalPrice: payload.rentalPrice ?? null,
        isRentalPriceEnabled: !!payload.isRentalPriceEnabled,
        halfLumpSumMonthlyRent: payload.halfLumpSumMonthlyRent ?? null,
        isHalfLumpSumMonthlyRentEnabled: !!payload.isHalfLumpSumMonthlyRentEnabled,
        deposit: payload.deposit ?? null,
        isDepositEnabled: !!payload.isDepositEnabled,
        managementFee: payload.managementFee ?? null,
        isManagementFeeEnabled: !!payload.isManagementFeeEnabled,
        managementEtc: payload.managementEtc ?? null,

        // 기본/관계
        popularity: payload.popularity ?? null,
        labelId: labelId,
        floorType: payload.floorType ?? null,
        currentFloor: payload.currentFloor ?? null,
        totalFloors: payload.totalFloors ?? null,
        basementFloors: payload.basementFloors ?? null,
        floorDescription: payload.floorDescription ?? null,

        // relation: 옵션 선택
        roomOptionId: payload.roomOptionId,
        bathroomOptionId: payload.bathroomOptionId,

        // 면적
        actualArea: payload.actualArea ?? null,
        supplyArea: payload.supplyArea ?? null,
        landArea: payload.landArea ?? null,
        buildingArea: payload.buildingArea ?? null,
        totalArea: payload.totalArea ?? null,

        // 배열
        themes: Array.isArray(payload.themes) ? payload.themes : [],
        buildingOptions: Array.isArray(payload.buildingOptions)
          ? { set: payload.buildingOptions.map((id) => ({ id })) }
          : { set: [] },
        parking: Array.isArray(payload.parking) ? payload.parking : [],

        // 날짜 (문자열이면 Date로 변환, null 허용)
        constructionYear: payload.constructionYear ? new Date(payload.constructionYear as any) : null,
        permitDate: payload.permitDate ? new Date(payload.permitDate as any) : null,
        approvalDate: payload.approvalDate ? new Date(payload.approvalDate as any) : null,

        // 설비/기타
        parkingPerUnit: payload.parkingPerUnit ?? null,
        totalParking: payload.totalParking ?? null,
        parkingFee: payload.parkingFee ?? null,
        direction: payload.direction ?? null,
        directionBase: payload.directionBase ?? null,
        landUse: payload.landUse ?? null,
        landType: payload.landType ?? null,
        buildingUse: payload.buildingUse ?? null,
        staff: payload.staff ?? null,
        customerType: payload.customerType ?? null,
        customerName: payload.customerName ?? null,

        elevatorType: payload.elevatorType ?? null,
        elevatorCount: payload.elevatorCount ?? null,
        moveInType: payload.moveInType ?? null,
        moveInDate: payload.moveInDate ? new Date(payload.moveInDate as any) : null,
        heatingType: payload.heatingType ?? null,
        yieldType: payload.yieldType ?? null,
        otherYield: payload.otherYield ?? null,
        contractEndDate: payload.contractEndDate ? new Date(payload.contractEndDate as any) : null,
        buildingName: payload.buildingName ?? null,
        floorAreaRatio: payload.floorAreaRatio ?? null,
        otherUse: payload.otherUse ?? null,
        mainStructure: payload.mainStructure ?? null,
        height: payload.height ?? null,
        roofStructure: payload.roofStructure ?? null,

        // 콘텐츠
        title: payload.title ?? null,
        editorContent: payload.editorContent ?? null,
        secretNote: payload.secretNote ?? null,
        secretContact: payload.secretContact ?? null,

        // 이미지(Json 직렬화는 서버에서 처리)
        mainImage: payload.mainImage ?? null,
        subImage: payload.subImage ?? [],
        adminImage: payload.adminImage ?? [],
      };

      return BuildUpdate(id, serverPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["build", id] });
      router.back();
    },
    onError: (e) => {
      console.error(e);
      alert("수정 중 에러가 발생했습니다.");
    },
  });

  if (!allLoaded) return <p>로딩 중...</p>;
  if (isError) return <p>불러오기 실패</p>;

  return (
    <BuildForm
      key={formKey}
      mode="update"
      methods={methods}
      isSubmitting={isPending || isImageLoading}
      onSubmit={(form) => mutate(form)}
      onCancel={() => router.back()}
      submitLabel="수정"
      onImageLoadingStateChange={setIsImageLoading}
      // 선택지 전달(컴포넌트 내부에서 id/name 바인딩)
      roomOptions={roomOptions}
      bathroomOptions={bathroomOptions}
      themeOptions={themeOptions}
      labelOptions={labelOptions.map(o => o.name)}
      buildingOptions={buildingOptions}
    />
  );
}