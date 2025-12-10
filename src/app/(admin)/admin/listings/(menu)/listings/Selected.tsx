"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

import { type SortKey } from "./ListingsShell";

interface SelectedProps {
  totalCount: number;
  sortKey: SortKey;
}

const tabBtn = (active: boolean) =>
  clsx(
    "w-full rounded-md border px-4 py-2 text-sm shadow transition",
    active
      ? "bg-slate-800 text-white border-slate-800"
      : "bg-white text-slate-700 border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
  );

const Selected = ({ totalCount, sortKey }: SelectedProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSortKey: SortKey) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSortKey) {
      params.set("sortBy", newSortKey);
    } else {
      params.delete("sortBy");
    }
    router.push(`?${params.toString()}`);
  };

  const currentSortKey = sortKey ?? "latest"; // Default to 'latest' if sortKey is undefined

  return (
    <>
      {/* 컨트롤 인풋창 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-200 flex-wrap p-4 gap-3">
        <div className="border border-slate-500 p-2 rounded bg-white" role="presentation">
          전체매물: {totalCount.toLocaleString()}
        </div>

        {/* 정렬 탭: 실제 버튼 사용 */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={tabBtn(currentSortKey === "latest")}
            onClick={() => handleSortChange("latest")}
            aria-pressed={currentSortKey === "latest"}
          >
            최신순
          </button>
          <button
            type="button"
            className={tabBtn(currentSortKey === "popular")}
            onClick={() => handleSortChange("popular")}
            aria-pressed={currentSortKey === "popular"}
          >
            인기순
          </button>
          <button
            type="button"
            className={tabBtn(currentSortKey.startsWith("price"))}
            onClick={() =>
              handleSortChange(currentSortKey === "price-desc" ? "price-asc" : "price-desc")
            }
            aria-pressed={currentSortKey.startsWith("price")}
          >
            {currentSortKey === "price-asc" ? "금액순↑" : "금액순↓"}
          </button>
          <button
            type="button"
            className={tabBtn(currentSortKey.startsWith("area"))}
            onClick={() =>
              handleSortChange(
                currentSortKey === "area-desc" ? "area-asc" : "area-desc"
              )
            }
            aria-pressed={currentSortKey.startsWith("area")}
          >
            {currentSortKey === "area-asc" ? "면적순↑" : "면적순↓"}
          </button>
        </div>

        <div>
          <Link
            href="/admin/listings/listings/create"
            className="border border-slate-500 bg-pink-900 text-red-50 px-4 py-2 rounded w-full sm:w-auto block text-center"
          >
            매물등록
          </Link>
        </div>
      </div>
    </>
  );
};

export default Selected;
