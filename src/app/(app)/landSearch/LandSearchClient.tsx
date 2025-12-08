"use client";

import { koreanToNumber } from "@/app/utility/koreanToNumber";
import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQuery, keepPreviousData } from "@tanstack/react-query";
import MapView from "./MapView";
import ListingList from "./ListingList";
import SearchBar from "./SearchBar";
import BuildDetailModal from "../../components/root/BuildDetailModal";
import next from 'next';

type Listing = {
  id: number;
  [key: string]: any;
};

const fetchJson = async (url: string) => {
  const res = await fetch(url, { next: { tags: ['public'] } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  const json = await res.json();
  return json.data;
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
  const res = await fetch(`/api/listings?${params.toString()}`, { next: { tags: ['public'] } });
  if (!res.ok) {
    throw new Error('Network response was not ok');
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
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  return data.data;
};

export default function LandSearchClient() {
  const [selectedBuild, setSelectedBuild] = useState<Listing | null>(null);
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const sortBy = currentSearchParams.get("sortBy") ?? "latest";

  // Fetch all options data
  const { data: settings, isLoading: isLoadingSettings } = useQuery({ queryKey: ['search-bar-settings'], queryFn: () => fetchJson('/api/admin/search-bar-settings') });
  const { data: roomOptions = [], isLoading: isLoadingRoomOptions } = useQuery({ queryKey: ['room-options'], queryFn: () => fetchJson('/api/room-options') });
  const { data: bathroomOptions = [], isLoading: isLoadingBathroomOptions } = useQuery({ queryKey: ['bathroom-options'], queryFn: () => fetchJson('/api/bathroom-options') });
  const { data: floorOptions = [], isLoading: isLoadingFloorOptions } = useQuery({ queryKey: ['floor-options'], queryFn: () => fetchJson('/api/floor-options') });
  const { data: areaOptions = [], isLoading: isLoadingAreaOptions } = useQuery({ queryKey: ['area'], queryFn: () => fetchJson('/api/area') });
  const { data: themeOptions = [], isLoading: isLoadingThemeOptions } = useQuery({ queryKey: ['theme-images'], queryFn: () => fetchJson('/api/theme-images') });
  const { data: propertyTypeOptions = [], isLoading: isLoadingPropertyTypeOptions } = useQuery({ queryKey: ['listing-type'], queryFn: () => fetchJson('/api/listing-type') });
  const { data: buyTypeOptions = [], isLoading: isLoadingBuyTypeOptions } = useQuery({ queryKey: ['buy-types'], queryFn: () => fetchJson('/api/buy-types') });

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
    enabled: !isLoadingSettings, // Don't fetch listings until settings are loaded
  });
  
  const { data: mapListings = [] } = useQuery({
    queryKey: ["map-listings", queryParams],
    queryFn: fetchMapListings,
    enabled: !isLoadingSettings, // Don't fetch map listings until settings are loaded
  });

  const allListings = () => (paginatedData ? paginatedData.pages.flatMap((page) => page.listings) : []);
  const [filteredIds, setFilteredIds] = useState<number[] | null>(null);

  const handleCardClick = (id: number) => {
    fetch(`/api/build/${id}/increment-views`, { method: 'POST' });
    const build = allListings().find(l => l.id === id);
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
        listings = listings.filter(listing => {
          const price = listing[priceField];
          if (price === undefined || price === null) return false;
          // Filtering logic...
          return true;
        });
      }
    }
    
    // ... other filters (floor, areaRange) ...

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
      setView('list');
    }
  };

  const handleResetFilter = () => {
    setFilteredIds(null);
  };

  const [view, setView] = useState('list');

  const areOptionsLoading = isLoadingSettings || isLoadingRoomOptions || isLoadingBathroomOptions || isLoadingFloorOptions || isLoadingAreaOptions || isLoadingThemeOptions || isLoadingPropertyTypeOptions || isLoadingBuyTypeOptions;

  if (areOptionsLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

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

      {/* Mobile view toggle */}
      <div className="sm:hidden p-2 bg-white border-b">
        <div className="flex justify-center gap-4">
          <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>목록</button>
          <button onClick={() => setView('map')} className={`px-4 py-2 rounded-lg ${view === 'map' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>지도</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row h-[calc(100vh-120px)]">
        <div className={`flex-1 min-w-0 ${view === 'list' && 'hidden sm:block'}`}>
          <MapView listings={mapListings} onClusterClick={handleClusterClick} view={view} />
        </div>

        <div className={`w-full sm:w-[480px] flex-shrink-0 bg-white border-l flex flex-col h-full ${view === 'map' && 'hidden sm:block'}`}>
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


