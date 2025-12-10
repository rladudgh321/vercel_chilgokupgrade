"use client";

import { koreanToNumber } from "@/app/utility/koreanToNumber";
import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useInfiniteQuery,
  useQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import MapView from "./MapView";
import ListingList from "./ListingList";
import SearchBar from "./SearchBar";
import BuildDetailModal from "../../components/root/BuildDetailModal";

type Listing = {
  id: number;
  [key: string]: any;
};

const fetchListings = async ({ pageParam = 1, queryKey }: any) => {
  const [, searchParams] = queryKey;
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && typeof value === "string") {
      params.set(key, value);
    }
  });

  params.set("page", pageParam.toString());
  const res = await fetch(`/api/listings?${params.toString()}`, { next: { tags: ['public']} });
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

const fetchMapListings = async ({ queryKey }: any) => {
  const [, searchParams] = queryKey;
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && typeof value === "string") {
      params.set(key, value);
    }
  });
  const res = await fetch(`/api/listings/map?${params.toString()}`, { next: { tags: ['public'] } });
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await res.json();
  return data.data;
};

export default function LandSearchClient() {
  const [selectedBuild, setSelectedBuild] = useState<Listing | null>(null);
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const sortBy = currentSearchParams.get("sortBy") ?? "latest";

  const { data: settings } = useQuery({
    queryKey: ["search-bar-settings"],
    queryFn: async () => {
      const res = await fetch("/api/search-bar-settings", { next: { tags: ['public'] } });
      if (!res.ok) throw new Error("Failed to fetch search bar settings");
      const json = await res.json();
      return json.data;
    },
  });
  const { data: roomOptions = [] } = useQuery({
    queryKey: ["room-options"],
    queryFn: async () => {
      const res = await fetch("/api/room-options", { next: { tags: ['public'] } });
      if (!res.ok) throw new Error("Failed to fetch room options");
      const json = await res.json();
      return json.data;
    },
  });
  const { data: bathroomOptions = [] } = useQuery({
    queryKey: ["bathroom-options"],
    queryFn: async () => {
      const res = await fetch("/api/bathroom-options", { next: { tags: ['public'] } });
      if (!res.ok) throw new Error("Failed to fetch bathroom options");
      const json = await res.json();
      return json.data;
    },
  });
  const { data: floorOptions = [] } = useQuery({
    queryKey: ["floor-options"],
    queryFn: async () => {
      const res = await fetch("/api/floor-options", { next: { tags: ['public'] } });
      if (!res.ok) throw new Error("Failed to fetch floor options");
      const json = await res.json();
      return json.data;
    },
  });
  const { data: areaOptions = [] } = useQuery({
    queryKey: ["area"],
    queryFn: async () => {
      const res = await fetch("/api/area", { next: { tags: ['public'] } });
      if (!res.ok) throw new Error("Failed to fetch area presets");
      const json = await res.json();
      return json.data;
    },
  });
  const { data: themeOptions = [] } = useQuery({
    queryKey: ["theme-images"],
    queryFn: async () => {
      const res = await fetch("/api/theme-images-public", { next: { tags: ['public'] } });
      if (!res.ok) throw new Error("Failed to fetch theme images");
      const json = await res.json();
      return json.data;
    },
  });
  const { data: propertyTypeOptions = [] } = useQuery({
    queryKey: ["listing-type"],
    queryFn: async () => {
      const res = await fetch("/api/listing-type", { next: { tags: ['public'] } });
      if (!res.ok) throw new Error("Failed to fetch listing types");
      const json = await res.json();
      return json.data;
    },
  });
  const { data: buyTypeOptions = [] } = useQuery({
    queryKey: ["buy-types"],
    queryFn: async () => {
      const res = await fetch("/api/buy-types-public", { next: { tags: ['public'] } });
      if (!res.ok) throw new Error("Failed to fetch buy types");
      const json = await res.json();
      return json.data;
    },
  });

  const queryParams = useMemo(() => {
    const params: { [key: string]: string } = {};
    currentSearchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [currentSearchParams]);

  const {
    data: paginatedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingListings,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["listings", queryParams],
    queryFn: fetchListings,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });

  const { data: mapListings = [] } = useQuery({
    queryKey: ["map-listings", queryParams],
    queryFn: fetchMapListings,
  });

  const allListings = () =>
    paginatedData ? paginatedData.pages.flatMap((page: any) => page.listings) : [];
  const [filteredIds, setFilteredIds] = useState<number[] | null>(null);

  const handleCardClick = (id: number) => {
    fetch(`/api/build/${id}/increment-views`, { method: "POST" });
    const build = allListings().find((l) => l.id === id);
    setSelectedBuild(build || null);
  };

  const handleCloseModal = () => {
    setSelectedBuild(null);
  };

  const displayListings = () => {
    let listings = allListings();
    const priceRange = queryParams.priceRange;
    const buyType = queryParams.buyType;

    if (priceRange && buyType) {
      let priceField = "";
      if (buyType === "전세") {
        priceField = "lumpSumPrice";
      } else if (buyType === "월세") {
        priceField = "rentalPrice";
      } else if (buyType === "매매") {
        priceField = "salePrice";
      }

      if (priceField) {
        listings = listings.filter((listing) => {
          const price = listing[priceField];
          if (price === undefined || price === null) return false;
          return true;
        });
      }
    }

    if (filteredIds === null) {
      return listings;
    }
    return listings.filter((listing) => filteredIds.includes(listing.id));
  };

  const handleSortChange = (newSortBy: string) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    params.set("sortBy", newSortBy);
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleClusterClick = (listingIds: number[]) => {
    setFilteredIds(listingIds);
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      setView("list");
    }
  };

  const handleResetFilter = () => {
    setFilteredIds(null);
  };

  const [view, setView] = useState("list");

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

      <div className="sm:hidden p-2 bg-white border-b">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-lg ${
              view === "list" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            목록
          </button>
          <button
            onClick={() => setView("map")}
            className={`px-4 py-2 rounded-lg ${
              view === "map" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            지도
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row h-[calc(100vh-120px)]">
        <div className={`flex-1 min-w-0 ${view === "list" && "hidden sm:block"}`}>
          <Suspense>
            <MapView listings={mapListings} onClusterClick={handleClusterClick} view={view} />
          </Suspense>
        </div>

        <div
          className={`w-full sm:w-[480px] flex-shrink-0 bg-white border-l flex flex-col h-full ${
            view === "map" && "hidden sm:block"
          }`}
        >
          {filteredIds !== null && (
            <div className="p-2 text-center border-b">
              <button
                onClick={handleResetFilter}
                className="text-sm text-blue-600 hover:underline"
              >
                {displayListings().length}개의 매물만 표시 중입니다. 전체
                목록으로 돌아가기
              </button>
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <ListingList
              propertyTypeOptions={propertyTypeOptions}
              listings={displayListings()}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              isLoading={isLoadingListings || isFetching}
              onCardClick={handleCardClick}
              view={view}
            />
          </div>
        </div>
      </div>
      {selectedBuild && (
        <BuildDetailModal build={selectedBuild} onClose={handleCloseModal} />
      )}
    </div>
  );
}
