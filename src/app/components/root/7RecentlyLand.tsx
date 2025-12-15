import CardSlide from "./shaped/CardSlide";
import { Listing } from "./ListingSection";

const RecentlyLand = ({ RecentlyData, onCardClick }: { RecentlyData:Listing[]; onCardClick: (id: number) => void }) => {

  return (
    <div className="text-center p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold">새로 올라온 매물들을 만나보세요</h2>
      <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">막 올라온 신규 매물을 가장 먼저 확인해보세요</p>
      <CardSlide listings={RecentlyData} onCardClick={onCardClick} />
    </div>
  );
};

export default RecentlyLand