'use client';

import ImageManager from "@/app/(admin)/shared/ImageManager";

const BannerPage = () => {
  return (
    <ImageManager
      title="웹뷰 배너 관리"
      apiEndpoint="/api/admin/webView/banner"
      imageMaxWidthOrHeight={1920}
    />
  );
};

export default BannerPage;
