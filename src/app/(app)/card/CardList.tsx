"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import CardItem from "./CardItem";
import SearchBar from "../landSearch/SearchBar";
import { useRouter, useSearchParams } from "next/navigation";
import BuildDetailModalClient from "@/app/components/root/BuildDetailModal";
import { koreanToNumber } from "@/app/utility/koreanToNumber";
import CardItemSkeleton from "./CardItemSkeleton";
import { IBuild } from "@/app/interface/build";
import Pagination from "@/app/components/shared/Pagination";

const fetchListings = async (queryParams: Record<string, string>) => {
  const params = new URLSearchParams(queryParams);
  params.set("limit", "12");
  const res = await fetch(`/api/listings?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

const CardList = ({
  initialSettings,
  initialRoomOptions,
  initialBathroomOptions,
  initialFloorOptions,
  initialAreaOptions,
  initialThemeOptions,
  initialPropertyTypeOptions,
  initialBuyTypeOptions,
  initialListingsData,
}: {
  initialSettings: any;
  initialRoomOptions: any[];
  initialBathroomOptions: any[];
  initialFloorOptions: any[];
  initialAreaOptions: any[];
  initialThemeOptions: any[];
  initialPropertyTypeOptions: any[];
  initialBuyTypeOptions: any[];
  initialListingsData: any;
}) => {
  const [selectedBuildId, setSelectedBuildId] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Data Fetching ---
  const { data: settings } = useQuery({
    queryKey: ["search-bar-settings"],
    queryFn: () => initialSettings,
    initialData: initialSettings,
  });
  const { data: roomOptions = [] } = useQuery({
    queryKey: ["room-options"],
    queryFn: () => initialRoomOptions,
    initialData: initialRoomOptions,
  });
  const { data: bathroomOptions = [] } = useQuery({
    queryKey: ["bathroom-options"],
    queryFn: () => initialBathroomOptions,
    initialData: initialBathroomOptions,
  });
  const { data: floorOptions = [] } = useQuery({
    queryKey: ["floor-options"],
    queryFn: () => initialFloorOptions,
    initialData: initialFloorOptions,
  });
  const { data: areaOptions = [] } = useQuery({
    queryKey: ["area"],
    queryFn: () => initialAreaOptions,
    initialData: initialAreaOptions,
  });
  const { data: themeOptions = [] } = useQuery({
    queryKey: ["theme-images"],
    queryFn: () => initialThemeOptions,
    initialData: initialThemeOptions,
  });
  const { data: propertyTypeOptions = [] } = useQuery({
    queryKey: ["listing-type"],
    queryFn: () => initialPropertyTypeOptions,
    initialData: initialPropertyTypeOptions,
  });
  const { data: buyTypeOptions = [] } = useQuery({
    queryKey: ["buy-types"],
    queryFn: () => initialBuyTypeOptions,
    initialData: initialBuyTypeOptions,
  });

  const queryParams = useMemo(() => {
    const params: { [key: string]: string } = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  const { data: listingsData, isLoading: isLoadingListings } = useQuery({
    queryKey: ["listings", queryParams],
    queryFn: () => fetchListings(queryParams),
    initialData: initialListingsData,
  });

  const listings = listingsData?.listings || [];
  const totalPages = listingsData?.totalPages || 1;
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // --- Event Handlers ---
  const handleCardClick = (id: number) => {
    fetch(`/api/build/${id}/increment-views`, { method: "POST" });
    setSelectedBuildId(id);
  };

  const handleCloseModal = () => {
    setSelectedBuildId(null);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/card?${params.toString()}`);
  };

  const sortBy = searchParams.get("sortBy") || "latest";

  const handleSortChange = (newSortBy: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortBy);
    router.push(`/card?${params.toString()}`);
  };

  const handleSortClick = (sortKey: string) => {
    if (sortKey === "price") {
      const newSortBy = sortBy === "price-desc" ? "price-asc" : "price-desc";
      handleSortChange(newSortBy);
    } else if (sortKey === "area") {
      const newSortBy = sortBy === "area-desc" ? "area-asc" : "area-desc";
      handleSortChange(newSortBy);
    } else {
      handleSortChange(sortKey);
    }
  };

  // --- Derived Data ---
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

  const displayListings = listings;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <SearchBar
          settings={settings}
          roomOptions={roomOptions}
          bathroomOptions={bathroomOptions}
          floorOptions={floorOptions}
          areaOptions={areaOptions}
          themeOptions={themeOptions}
          propertyTypeOptions={propertyTypeOptions}
          buyTypeOptions={buyTypeOptions}
        />
      </div>

      <div className="p-2 sm:p-4 md:p-6">
        <div className="flex border-b bg-white mb-6 overflow-x-auto">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingListings
            ? Array.from({ length: 12 }).map((_, i) => (
                <CardItemSkeleton key={i} />
              ))
            : displayListings.map((listing: IBuild | any, index: number) => (
                <CardItem
                  key={listing.id}
                  listing={listing}
                  onClick={() => handleCardClick(listing.id)}
                  priority={index < 3}
                />
              ))}
        </div>

        {displayListings.length === 0 && !isLoadingListings && (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>표시할 매물이 없습니다.</p>
          </div>
        )}
      </div>
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
      {selectedBuildId && (
        <BuildDetailModalClient
          build={listings.find((listing: any) => listing.id === selectedBuildId)}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CardList;
