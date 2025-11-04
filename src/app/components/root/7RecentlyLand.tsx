import CardSlide from "./shaped/CardSlide";
import { Listing } from "./ListingSection";

const RecentlyLand = ({ RecentlyData, onCardClick }: { RecentlyData:Listing[]; onCardClick: (id: number) => void }) => {

  return (
    <div className="text-center p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold">최신매물</h2>
      <p className="text-sm sm:text-base text-gray-600">최신매물을 만나보세요</p>
      <CardSlide listings={RecentlyData} onCardClick={onCardClick} />
    </div>
  );
};

export default RecentlyLand