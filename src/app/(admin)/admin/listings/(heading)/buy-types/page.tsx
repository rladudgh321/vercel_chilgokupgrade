import ListManager from "@adminShared/ListManager";
import BuyTypePresetManager from "@adminShared/BuyTypePresetManager";

const BuyTypesPage = () => {
  return (
    <div>
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
