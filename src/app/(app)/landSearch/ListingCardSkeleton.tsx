const ListingCardSkeleton = () => {
  return (
    <div className="border bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-48 h-48 md:h-auto bg-gray-300"></div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCardSkeleton;