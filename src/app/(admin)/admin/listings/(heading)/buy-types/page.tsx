import ListManager from "@adminShared/ListManager";
import BuyTypePresetManager from "@adminShared/BuyTypePresetManager";

const BuyTypesPage = () => {
  return (
    <div>
      <div className="text-center bg-amber-400">매매, 전세, 실입주금, 관리비, 보증금, 반전세의 월세만 등록 하실 수 있습니다</div>
      <ListManager
        title="거래 유형"
        placeholder="새로운 거래유형"
        buttonText="거래유형 등록"
        apiEndpoint="/api/buy-types"
      />
      <div className="mt-12">
        <BuyTypePresetManager />
      </div>
    </div>
  );
};

export default BuyTypesPage;
