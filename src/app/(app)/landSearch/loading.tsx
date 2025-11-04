import ListingCardSkeleton from "./ListingCardSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* SearchBar Skeleton */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="h-10 bg-gray-200 rounded-lg w-full mb-4 animate-pulse"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Mobile view toggle skeleton */}
      <div className="sm:hidden p-2 bg-white border-b">
        <div className="flex justify-center gap-4">
          <div className="px-4 py-2 rounded-lg bg-gray-200 w-20 h-10 animate-pulse"></div>
          <div className="px-4 py-2 rounded-lg bg-gray-200 w-20 h-10 animate-pulse"></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row h-[calc(100vh-120px)]">
        {/* Map View Skeleton */}
        <div className="flex-1 min-w-0 bg-gray-200 animate-pulse"></div>

        {/* Listing List Skeleton */}
        <div className="w-full sm:w-[480px] flex-shrink-0 bg-white border-l flex flex-col h-full">
          {/* Sort Options Skeleton */}
          <div className="flex border-b bg-white flex-shrink-0 overflow-x-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 w-20 h-10 bg-gray-200 rounded-t-lg animate-pulse mr-2"></div>
            ))}
          </div>

          {/* Listing Cards Skeleton */}
          <div className="flex-1 overflow-hidden p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}