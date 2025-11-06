import CardSlide from "./shaped/CardSlide";
import { Listing } from "./ListingSection";

const RecommendLand = ({ RecommendData, onCardClick }: { RecommendData: Listing[]; onCardClick: (id: number) => void }) => {
  return (
    <div className="text-center p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold">이달의 인기 부동산</h2>
      <p className="text-sm sm:text-base text-gray-600">이 달의 인기 매물을 확인해보세요!</p>
      <CardSlide listings={RecommendData} onCardClick={onCardClick} />
    </div>
  );
};

export default RecommendLand;
