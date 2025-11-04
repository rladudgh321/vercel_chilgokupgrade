"use client";


import { useState } from "react";
import Selected from "../listings/Selected";
import DeletedListings from "./DeletedListing";

export type SortKey = "recent" | "views" | "price" | "totalArea";

export default function DeletedShell({
  DeletedData,
}: {
  DeletedData: {
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
        totalCount={DeletedData?.totalItems ?? 0}
        sortKey={sortKey}
        onChangeSort={setSortKey}
      />
      <DeletedListings DeletedData={DeletedData} sortKey={sortKey} />
    </>
  );
}
