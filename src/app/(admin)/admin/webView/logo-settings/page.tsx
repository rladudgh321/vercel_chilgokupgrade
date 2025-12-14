'use client';

import SingleImageUploader from "@/app/(admin)/shared/SingleImageUploader";
import FooterLogoSettings from "@/app/(admin)/shared/FooterLogoSettings";

const LogoSettingsPage = () => {
  return (
    <>
      <FooterLogoSettings />
      <div className="mt-8">
        <SingleImageUploader
          title="로고 이미지 관리(가로 200px 설정됨)"
          getApiEndpoint="/api/admin/settings/logo"
          updateApiEndpoint="/api/admin/settings/logo"
          uploadApiEndpoint="/api/admin/settings/logo/upload"
          imageMaxWidthOrHeight={200}
        />
      </div>
    </>
  );
};

export default LogoSettingsPage;
