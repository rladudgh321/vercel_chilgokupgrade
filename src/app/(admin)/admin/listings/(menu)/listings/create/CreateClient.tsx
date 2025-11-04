"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import BuildForm, { BASE_DEFAULTS, FormData } from "@/app/(admin)/admin/listings/(menu)/listings/shared/BuildForm";
import { BuildCreate } from "@/app/apis/build";

interface Option { id: number; name: string }

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

export default function CreateClient() {
  const router = useRouter();
  const methods = useForm<FormData>({ defaultValues: BASE_DEFAULTS });

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

  // 날짜 및 숫자 필드 정규화
  const DATE_FIELDS: Array<keyof FormData | "confirmDate"> = [
    "constructionYear",
    "permitDate",
    "approvalDate",
    "moveInDate",
    "contractEndDate",
    // 서버 측 추가 필드 가능 시 대비
    "confirmDate",
  ];

  const normalizeDate = (v: unknown): string | null => {
    if (v === undefined || v === null) return null;
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (trimmed === "") return null;
      return trimmed; // ISO 문자열이거나 유효 문자열로 가정
    }
    if (v instanceof Date) return v.toISOString();
    return null;
  };

  const normalizeNumber = (v: unknown): number | unknown => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (trimmed === "") return v; // 빈 문자열은 서버에서 nullable 처리 대상이 아님(그대로 두고 날짜만 null 처리)
      const n = Number(trimmed);
      return Number.isNaN(n) ? v : n;
    }
    return v;
  };

  const normalizePayload = (data: FormData) => {
    const copy: Partial<FormData> & { [key: string]: unknown } = { ...data };

    // 날짜 필드 처리: 빈 문자열 → null, Date → ISO
    DATE_FIELDS.forEach((k) => {
      if (k in copy) {
        copy[k as string] = normalizeDate(copy[k as string]);
      }
    });

    // 숫자 후보 필드들: 문자열 숫자를 number로 변환
    const numberLikeKeys: string[] = [
      "salePrice",
      "actualEntryCost",
      "rentalPrice",
      "managementFee",
      "currentFloor",
      "totalFloors",
      "basementFloors",
      "actualArea",
      "supplyArea",
      "landArea",
      "buildingArea",
      "totalArea",
      "elevatorCount",
      "parkingPerUnit",
      "totalParking",
      "parkingFee",
    ];
    numberLikeKeys.forEach((k) => {
      if (k in copy) {
        copy[k] = normalizeNumber(copy[k]);
      }
    });

    return copy as FormData;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: BuildCreate,
    onSuccess: () => router.push("/admin/listings/listings"),
    onError: () => alert("등록 중 에러가 발생했습니다."),
  });

  return (
    <BuildForm
      mode="create"
      methods={methods}
      isSubmitting={isPending}
      onSubmit={(data) => mutate(normalizePayload(data))}
      onCancel={() => router.back()}
      roomOptions={roomOptions}
      bathroomOptions={bathroomOptions}
      themeOptions={themeOptions}
      labelOptions={labelOptions.map(o => o.name)}
      buildingOptions={buildingOptions}
    />
  );
}
