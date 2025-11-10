"use client";

import { koreanToNumber } from "@/app/utility/koreanToNumber";
import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQuery, keepPreviousData } from "@tanstack/react-query";
import MapView from "./MapView";
import ListingList from "./ListingList";
import SearchBar from "./SearchBar";
import BuildDetailModal from "../../components/root/BuildDetailModal";

// Assuming the type for a listing is similar to what's in MapView and ListingCard

type Listing = {
  id: number;
  // ... other properties
  [key: string]: any;
};

type Props = {
  initialListings: Listing[];
  settings: any;
  roomOptions: any[];
  bathroomOptions: any[];
  floorOptions: any[];
  areaOptions: any[];
  themeOptions: any[];
  propertyTypeOptions: any[];
  buyTypeOptions: any[];
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
  const res = await fetch(`/api/listings?${params.toString()}`);
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
  const res = await fetch(`/api/listings/map?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  return data.data; // The new endpoint wraps data in a `data` property
};

export default function LandSearchClient({ 
  initialListings,
  settings,
  roomOptions,
  bathroomOptions,
  floorOptions,
  areaOptions,
  themeOptions,
  propertyTypeOptions,
  buyTypeOptions
}: Props) {
  const [selectedBuild, setSelectedBuild] = useState<Listing | null>(null);
  const handleCardClick = (id: number) => {
    // Increment views
    fetch(`/api/build/${id}/increment-views`, { method: 'POST' })
      .then(response => {
        if (!response.ok) {
          console.error('Failed to increment views');
        }
      })
      .catch(error => console.error('Error incrementing views:', error));

    const build = allListings.find(l => l.id === id);
    setSelectedBuild(build || null);
  };
  const handleCloseModal = () => {
    setSelectedBuild(null);
  };
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const sortBy = currentSearchParams.get("sortBy") ?? "latest";
  const queryParams = useMemo(() => {
    const params: { [key: string]: string } = {};
    currentSearchParams.forEach((value, key) => {
      params[key] = value;
    });
    console.log("Current Query Params:", params);
    return params;
  }, [currentSearchParams]);
    const {
      data: paginatedData,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      isFetching,
    } = useInfiniteQuery({    queryKey: ["listings", queryParams],
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
    initialData: initialListings,
  });

  const allListings = useMemo(() => (paginatedData ? paginatedData.pages.flatMap((page) => page.listings) : []), [paginatedData]);

  const [filteredIds, setFilteredIds] = useState<number[] | null>(null);



  const displayListings = useMemo(() => {

    let listings = allListings;



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



          if (priceRange.includes("~")) {

            const [minStr, maxStr] = priceRange.split("~");

            const min = koreanToNumber(minStr);

            const max = koreanToNumber(maxStr);

            let passesMin = true;

            let passesMax = true;

            if (min !== null) {

              console.log(`Comparing: ${price} >= ${min}`);

              passesMin = price >= min;

            }

            if (max !== null) {

              console.log(`Comparing: ${price} <= ${max}`);

              passesMax = price <= max;

            }

            return passesMin && passesMax;

          } else if (priceRange.includes("이상")) {

            const min = koreanToNumber(priceRange.replace("이상", ""));

            if (min !== null) {

              console.log(`Comparing: ${price} >= ${min}`);

              return price >= min;

            }

          } else if (priceRange.includes("이하")) {

            const max = koreanToNumber(priceRange.replace("이하", ""));

            if (max !== null) {

              console.log(`Comparing: ${price} <= ${max}`);

              return price <= max;

            }

          }

          return true;

        });

      }

    }



    const floor = queryParams.floor;

    if (floor) {

        listings = listings.filter(listing => {

            const currentFloor = listing.currentFloor;

            if (currentFloor === undefined || currentFloor === null) return false;



            if (floor.includes("~")) {

                const [minStr, maxStr] = floor.replace(/층/g, "").split("~");

                const min = Number(minStr);

                const max = Number(maxStr);

                let passesMin = true;

                let passesMax = true;

                if (!isNaN(min)) {

                    passesMin = currentFloor >= min;

                }

                if (maxStr && !isNaN(Number(maxStr))) {

                    passesMax = currentFloor <= Number(maxStr);

                }

                return passesMin && passesMax;

            } else if (floor.includes("이상")) {

                const min = Number(floor.replace("층이상", ""));

                if (!isNaN(min)) {

                    return currentFloor >= min;

                }

            } else {

                const singleFloor = Number(floor.replace("층", ""));

                if (!isNaN(singleFloor)) {

                    return currentFloor === singleFloor;

                }

            }

            return true;

        });

    }



    const areaRange = queryParams.areaRange;

    if (areaRange) {

        const PYEONG_TO_M2 = 3.305785;

        listings = listings.filter(listing => {

            const totalArea = listing.totalArea;

            if (totalArea === undefined || totalArea === null) return false;



            // "20평~30평"

            if (areaRange.includes("~")) {

                const [minStr, maxStr] = areaRange.replace(/평/g, "").split("~");

                const minPyeong = Number(minStr);

                const maxPyeong = Number(maxStr);

                let passesMin = true;

                let passesMax = true;

                if (!isNaN(minPyeong)) {

                    passesMin = totalArea >= minPyeong * PYEONG_TO_M2;

                }

                if (maxStr && !isNaN(Number(maxStr))) {

                    passesMax = totalArea <= maxPyeong * PYEONG_TO_M2;

                }

                return passesMin && passesMax;

            } 

            // "20평이상"

            else if (areaRange.includes("이상")) {

                const minPyeong = Number(areaRange.replace("평이상", ""));

                if (!isNaN(minPyeong)) {

                    return totalArea >= minPyeong * PYEONG_TO_M2;

                }

            } 

            // "20평이하"

            else if (areaRange.includes("이하")) {

                const maxPyeong = Number(areaRange.replace("평이하", ""));

                if (!isNaN(maxPyeong)) {

                    return totalArea <= maxPyeong * PYEONG_TO_M2;

                }

            }

            return true;

        });

    }



    if (filteredIds === null) {

      return listings;

    }

    return listings.filter((listing) => filteredIds.includes(listing.id));

  }, [allListings, filteredIds, queryParams]);





  const handleSortChange = (newSortBy: string) => {

    const params = new URLSearchParams();

    currentSearchParams.forEach((value, key) => {

        params.set(key, value);

    })

    params.set("sortBy", newSortBy);

    // Reset pagination when sorting changes

    params.delete("page");

    router.push(`?${params.toString()}`);

  };



  const handleClusterClick = (listingIds: number[]) => {
    setFilteredIds(listingIds);

    const isMobile = window.innerWidth < 640; // Tailwind's 'sm' breakpoint
    if (isMobile) {
      setView('list');
    }
  };



  const handleResetFilter = () => {

    setFilteredIds(null);

  };



  const [view, setView] = useState('list'); // 'map' or 'list'



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

                {displayListings.length}개의 매물만 표시 중입니다. 전체

                목록으로 돌아가기

              </button>

            </div>

          )}

          <div className="flex-1 overflow-hidden">

            <ListingList

              listings={displayListings}

              sortBy={sortBy}

              onSortChange={handleSortChange}

              fetchNextPage={fetchNextPage}

              hasNextPage={hasNextPage}

              isFetchingNextPage={isFetchingNextPage}

              isLoading={isFetching}

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




