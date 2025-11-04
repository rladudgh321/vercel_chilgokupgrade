import CardSlide from "./shaped/CardSlide";
import { Listing } from "./ListingSection";

const QuickSale = ({ QuickSaleData, onCardClick }: { QuickSaleData: Listing[]; onCardClick: (id: number) => void }) => {
  return (
    <div className="text-center p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold">급매물</h2>
      <p className="text-sm sm:text-base text-gray-600">급매 매물 모음입니다</p>
      <CardSlide listings={QuickSaleData} onCardClick={onCardClick} />
    </div>
  );
};

export default QuickSale;
