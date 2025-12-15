import CardSlide from "./shaped/CardSlide";
import { Listing } from "./ListingSection";

const QuickSale = ({ QuickSaleData, onCardClick }: { QuickSaleData: Listing[]; onCardClick: (id: number) => void }) => {
  return (
    <div className="text-center p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold">놓치면 아쉬운 급매 매물 모음</h2>
      <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">지금 바로 거래 가능한 알짜 매물만 모았습니다</p>
      <CardSlide listings={QuickSaleData} onCardClick={onCardClick} />
    </div>
  );
};

export default QuickSale;
