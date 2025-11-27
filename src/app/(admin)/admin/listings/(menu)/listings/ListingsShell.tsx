"use client";

import { useState } from "react";
import Selected from "./Selected";
import ListingsMain from "./ListingsMain";

export type SortKey =
  | "recent"
  | "views"
  | "price-desc"
  | "price-asc"
  | "area-desc"
  | "area-asc";

export default function ListingsShell({
  ListingsData,
}: {
  ListingsData: {
    currentPage: number;
    data: any[];
    ok: boolean;
    totalItems: number;
    totalPages: number;
  };
}) {
  const [sortKey, setSortKey] = useState<SortKey>("recent");

  return (
    <>
      <Selected
        totalCount={ListingsData?.totalItems ?? 0}
        sortKey={sortKey}
        onChangeSort={setSortKey}
      />
      <ListingsMain ListingsData={ListingsData} sortKey={sortKey} />
    </>
  );
}