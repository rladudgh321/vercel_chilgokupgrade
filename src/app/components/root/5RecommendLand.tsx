import CardSlide from "./shaped/CardSlide";
import { Listing } from "./ListingSection";

const RecommendLand = ({ RecommendData, onCardClick }: { RecommendData: Listing[]; onCardClick: (id: number) => void }) => {
  return (
    <div className="text-center p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold">이달의 주목받는 터전들</h2>
      <p className="text-sm sm:text-base text-gray-600">많은 분들이 찾은 인기 매물을 만나보세요</p>
      <CardSlide listings={RecommendData} onCardClick={onCardClick} />
    </div>
  );
};

export default RecommendLand;
