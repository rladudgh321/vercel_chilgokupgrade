"use client";

import { FC, useId } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateAddressVisibility } from "@/app/apis/build";
import { clsx } from "clsx";

type AddressState = "public" | "private" | "exclude";

interface AddressVisibilityProps {
  activeAddressPublic: AddressState;
  handleRadioChange: (item: AddressState) => void;
  serverSync?: boolean;
  listingId?: number;
  ArrayType?: boolean;
  /** 🔹 삭제 목록 등에서 비활성화 */
  disabled?: boolean;
}

const AddressVisibility: FC<AddressVisibilityProps> = ({
  activeAddressPublic,
  handleRadioChange,
  serverSync = true,
  listingId,
  ArrayType = true,
  disabled = false,
}) => {
  const reactId = useId();
  const uid = String(listingId ?? reactId);
  const group = `addr-public-${uid}`;
  const idPublic  = `${group}-public`;
  const idPrivate = `${group}-private`;
  const idExclude = `${group}-exclude`;

  type Ctx = { prev: AddressState };

  const { mutate, isPending } = useMutation<
    { message: string; id: number; isAddressPublic: AddressState },
    Error,
    { id: number; state: AddressState },
    Ctx
  >({
    mutationKey: ["patchAddressVisibility", listingId],
    mutationFn: (vars) =>
      updateAddressVisibility(vars.id, { isAddressPublic: vars.state }),
    onMutate: async (vars) => {
      const prev = activeAddressPublic;
      handleRadioChange(vars.state);   // 낙관적 반영
      return { prev };
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.prev) handleRadioChange(ctx.prev); // 롤백
      alert(`주소 공개여부 변경 실패: ${error.message ?? String(error)}`);
    },
  });

  const onPick = (state: AddressState) => {
    if (disabled) return;                     // 🔹 비활성화면 무시
    if (!serverSync) return handleRadioChange(state);
    if (listingId == null) {
      console.warn("[AddressVisibility] serverSync=true인데 listingId가 없습니다.");
      return;
    }
    mutate({ id: listingId, state });
  };

  const pillStyle = (active: string, me: string) => ({
    backgroundColor: active === me ? "#2b6cb0" : "white",
    color: active === me ? "white" : "gray",
    borderColor: "#cbd5e0",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    borderRadius: "0.375rem",
    cursor: disabled || isPending ? "not-allowed" : "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease",
    opacity: disabled || isPending ? 0.5 : 1,
  });

  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700">주소 공개 여부</label>

      <div className={clsx("flex items-center mb-4 flex-wrap gap-2", { "justify-center": ArrayType })}>
        <label htmlFor={idPublic} className="flex items-center space-x-2">
          <input
            type="radio"
            id={idPublic}
            name={group}
            value="public"
            className="hidden"
            checked={activeAddressPublic === "public"}
            onChange={() => onPick("public")}
            disabled={disabled || isPending}
          />
          <span style={pillStyle(activeAddressPublic, "public")}>공개</span>
        </label>

        <label htmlFor={idPrivate} className="flex items-center space-x-2">
          <input
            type="radio"
            id={idPrivate}
            name={group}
            value="private"
            className="hidden"
            checked={activeAddressPublic === "private"}
            onChange={() => onPick("private")}
            disabled={disabled || isPending}
          />
          <span style={pillStyle(activeAddressPublic, "private")}>비공개</span>
        </label>

        <label htmlFor={idExclude} className="flex items-center space-x-2">
          <input
            type="radio"
            id={idExclude}
            name={group}
            value="exclude"
            className="hidden"
            checked={activeAddressPublic === "exclude"}
            onChange={() => onPick("exclude")}
            disabled={disabled || isPending}
          />
          <span style={pillStyle(activeAddressPublic, "exclude")}>지번 제외 공개</span>
        </label>
      </div>
    </div>
  );
};

export default AddressVisibility;
