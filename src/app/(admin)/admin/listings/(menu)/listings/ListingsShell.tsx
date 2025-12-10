"use client";

import Selected from "./Selected";
import ListingsMain from "./ListingsMain";

export type SortKey =
  | "recent"
  | "views"
  | "price-desc"
  | "price-asc"
  | "area-desc"
  | "area-asc"
  | undefined; // Add undefined to SortKey type


export default function ListingsShell({
  ListingsData,
  sortBy,
}: {
  ListingsData: {
    currentPage: number;
    data: any[];
    ok: boolean;
    totalItems: number;
    totalPages: number;
  };
  sortBy: SortKey;
}) {

  return (
    <>
      <Selected
        totalCount={ListingsData?.totalItems ?? 0}
        sortKey={sortBy}
      />
      <ListingsMain ListingsData={ListingsData} sortKey={sortBy} />
    </>
  );
}