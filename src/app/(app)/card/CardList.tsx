"use client"
import { useState, useMemo } from "react"
import CardItem from "./CardItem"
import SearchBar from "../landSearch/SearchBar"
import { useRouter, useSearchParams } from "next/navigation"
import BuildDetailModalClient from '@/app/components/root/BuildDetailModal'
import { koreanToNumber } from '@/app/utility/koreanToNumber'
import { useQuery } from "@tanstack/react-query";
import CardItemSkeleton from "./CardItemSkeleton";

const fetchListings = async (searchParams: URLSearchParams) => {
  const res = await fetch(`/api/listings?${searchParams.toString()}`);
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

const CardList = ({ 
  settings,
  roomOptions,
  bathroomOptions,
  floorOptions,
  areaOptions,
  themeOptions,
  propertyTypeOptions,
  buyTypeOptions
}: { 
  settings: any,
  roomOptions: any[],
  bathroomOptions: any[],
  floorOptions: any[],
  areaOptions: any[],
  themeOptions: any[],
  propertyTypeOptions: any[],
  buyTypeOptions: any[]
}) => {
  const [selectedBuildId, setSelectedBuildId] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["listings", searchParams.toString()],
    queryFn: () => fetchListings(searchParams),
  });

  const listings = useMemo(() => {
    return data?.listings || []
  },[data?.listings])

  const handleCardClick = (id: number) => {
    // Increment views
    fetch(`/api/build/${id}/increment-views`, { method: 'POST' })
      .then(response => {
        if (!response.ok) {
          console.error('Failed to increment views');
        }
      })
      .catch(error => console.error('Error incrementing views:', error));

    setSelectedBuildId(id);
  };

  const handleCloseModal = () => {
    setSelectedBuildId(null);
  };

  const sortBy = searchParams.get("sortBy") || "recommended"

  const queryParams = useMemo(() => {
    const params: { [key: string]: string } = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

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

  const displayListings = useMemo(() => {
    let filteredListings = listings;

    const priceRange = queryParams.priceRange;
    const buyType = queryParams.buyType;

    if (priceRange && buyType) {
      let priceField = "";
      if (buyType === "전세") priceField = "lumpSumPrice";
      else if (buyType === "월세") priceField = "rentalPrice";
      else if (buyType === "매매") priceField = "salePrice";

      if (priceField) {
        filteredListings = filteredListings.filter(listing => {
          const price = listing[priceField];
          if (price === undefined || price === null) return false;

          if (priceRange.includes("~")) {
            const [minStr, maxStr] = priceRange.split("~");
            const min = koreanToNumber(minStr);
            const max = koreanToNumber(maxStr);
            if (min !== null && price < min) return false;
            if (max !== null && price > max) return false;
          } else if (priceRange.includes("이상")) {
            const min = koreanToNumber(priceRange.replace("이상", ""));
            if (min !== null && price < min) return false;
          } else if (priceRange.includes("이하")) {
            const max = koreanToNumber(priceRange.replace("이하", ""));
            if (max !== null && price > max) return false;
          }
          return true;
        });
      }
    }

    const floor = queryParams.floor;
    if (floor) {
        filteredListings = filteredListings.filter(listing => {
            const currentFloor = listing.currentFloor;
            if (currentFloor === undefined || currentFloor === null) return false;

            if (floor.includes("~")) {
                const [minStr, maxStr] = floor.replace(/층/g, "").split("~");
                const min = Number(minStr);
                const max = Number(maxStr);
                if (!isNaN(min) && currentFloor < min) return false;
                if (maxStr && !isNaN(Number(maxStr)) && currentFloor > Number(maxStr)) return false;
            } else if (floor.includes("이상")) {
                const min = Number(floor.replace("층이상", ""));
                if (!isNaN(min) && currentFloor < min) return false;
            } else {
                const singleFloor = Number(floor.replace("층", ""));
                if (!isNaN(singleFloor) && currentFloor !== singleFloor) return false;
            }
            return true;
        });
    }

    const areaRange = queryParams.areaRange;
    if (areaRange) {
        const PYEONG_TO_M2 = 3.305785;
        filteredListings = filteredListings.filter(listing => {
            const totalArea = listing.totalArea;
            if (totalArea === undefined || totalArea === null) return false;

            if (areaRange.includes("~")) {
                const [minStr, maxStr] = areaRange.replace(/평/g, "").split("~");
                const minPyeong = Number(minStr);
                const maxPyeong = Number(maxStr);
                if (!isNaN(minPyeong) && totalArea < minPyeong * PYEONG_TO_M2) return false;
                if (maxStr && !isNaN(Number(maxStr)) && totalArea > maxPyeong * PYEONG_TO_M2) return false;
            }
            else if (areaRange.includes("이상")) {
                const minPyeong = Number(areaRange.replace("평이상", ""));
                if (!isNaN(minPyeong) && totalArea < minPyeong * PYEONG_TO_M2) return false;
            }
            else if (areaRange.includes("이하")) {
                const maxPyeong = Number(areaRange.replace("평이하", ""));
                if (!isNaN(maxPyeong) && totalArea > maxPyeong * PYEONG_TO_M2) return false;
            }
            return true;
        });
    }

    return filteredListings;
  }, [listings, queryParams]);

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
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <CardItemSkeleton key={i} />)
            : displayListings.map((listing, index) => (
                <CardItem key={listing.id} listing={listing} onClick={() => handleCardClick(listing.id)} priority={index < 3} />
              ))}
        </div>

        {displayListings.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>표시할 매물이 없습니다.</p>
          </div>
        )}
      </div>
      {selectedBuildId && (
        <BuildDetailModalClient
          build={listings.find((listing) => listing.id === selectedBuildId)}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default CardList
