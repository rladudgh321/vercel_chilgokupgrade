import CardItemSkeleton from "./CardItemSkeleton";

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

      {/* Sort Options Skeleton */}
      <div className="p-2 sm:p-4 md:p-6">
        <div className="flex border-b bg-white mb-6 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 w-20 h-10 bg-gray-200 rounded-t-lg animate-pulse mr-2"></div>
          ))}
        </div>

        {/* Card List Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
