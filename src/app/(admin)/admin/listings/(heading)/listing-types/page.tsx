'use client';

import ListManager from "@adminShared/ListManager";

const ListingTypePage = () => {
  return (
    <ListManager
      title="매물 유형 설정"
      placeholder="새로운 매물 유형"
      buttonText="유형 등록"
      apiEndpoint="/api/listing-type"
      enableImageUpload={true}
      imageMaxWidthOrHeight={300}
    />
  );
};

export default ListingTypePage;
