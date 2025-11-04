"use client";

import React, { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import ListingCard from "./ListingCard";
import ListingCardSkeleton from "./ListingCardSkeleton";

type Props = {
  listings: any[];
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isLoading: boolean; // Add isLoading prop
  onCardClick: (id: number) => void;
};

const ListingList = ({
  listings,
  sortBy,
  onSortChange,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  onCardClick,
}: Props) => {
  const handleSortClick = (sortKey: string) => {
    if (sortKey === "price") {
      const newSortBy = sortBy === "price-desc" ? "price-asc" : "price-desc";
      onSortChange(newSortBy);
    } else if (sortKey === "area") {
      const newSortBy = sortBy === "area-desc" ? "area-asc" : "area-desc";
      onSortChange(newSortBy);
    } else {
      onSortChange(sortKey);
    }
  };

  const getSortOptions = () => [
    { key: "latest", label: "최신순" },
    { key: "popular", label: "인기순" },
    {
      key: "price",
      label: sortBy.startsWith("price-")
        ? sortBy === "price-asc"
          ? "금액순↑"
          : "금액순↓"
        : "금액순↓",
    },
    {
      key: "area",
      label: sortBy.startsWith("area-")
        ? sortBy === "area-asc"
          ? "면적순↑"
          : "면적순↓"
        : "면적순↓",
    },
  ];

  const parentRef = useRef<HTMLDivElement>(null);
  const skeletonCount = 5; // Number of skeleton loaders to show

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage && isFetchingNextPage ? listings.length + skeletonCount : listings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 272, // 각 항목의 예상 높이 (조정 필요)
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (
      lastItem &&
      lastItem.index >= listings.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage?.();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    listings.length,
    isFetchingNextPage,
    virtualItems,
  ]);

  return (
    <div className="h-full flex flex-col relative">
      {/* 정렬 탭 */}
      <div className="flex border-b bg-white flex-shrink-0 overflow-x-auto">
        {getSortOptions().map((option) => {
          const isToggleable = ["price", "area"].includes(option.key);
          const isActive = isToggleable
            ? sortBy.startsWith(option.key)
            : sortBy === option.key;

          return (
            <button
              key={option.key}
              onClick={() => handleSortClick(option.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive && !isToggleable
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* 매물 리스트 */}
      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {listings.length === 0 && !isFetchingNextPage && !isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>표시할 매물이 없습니다.</p>
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const isSkeletonRow = virtualRow.index >= listings.length;
              const listing = listings[virtualRow.index];

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {isSkeletonRow ? (
                    <ListingCardSkeleton />
                  ) : (
                    <ListingCard listing={listing} onClick={onCardClick} />
                  )}
                </div>
              );
            })}
            {hasNextPage && isFetchingNextPage && (
              <div className="flex justify-center items-center p-4">
                <p>불러오는 중...</p>
              </div>
            )}
            {!hasNextPage && listings.length > 0 && (
              <div className="flex justify-center items-center p-4">
                <p>모든 매물을 확인했습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingList;