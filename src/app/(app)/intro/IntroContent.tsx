import Image from "next/image"; 

const IntroContent = () => {
  return (
    <section className="relative bg-gradient-to-r from-red-900 to-slate-800 text-white p-4 sm:p-8 md:px-6 md:py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
        {/* 왼쪽 이미지 */}
        <div className="flex justify-center">
          <Image
            src="/father.jpg"
            alt="대표 프로필"
            width={400}
            height={400}
            className="rounded-lg shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md"
          />
        </div>

        {/* 오른쪽 텍스트 */}
        <div className="space-y-6 leading-relaxed text-sm sm:text-base">
          <p>
            권오길 부동산은 토지 중개에 특화된 지역 전문가로서, 고객의
            생활과 투자 목적에 맞춘 맞춤형 컨설팅을 지향합니다. 우리는
            지적도·토지이용계획·개발 가능성·인허가 이슈 등 핵심 정보를
            꼼꼼히 검토하여, 한 번의 거래가 아니라 긴 호흡의 신뢰를
            만들어갑니다.
          </p>
          <p>
            농지·임야·대지·전원주택 부지 등 다양한 토지 유형을 다루며,
            현장 답사와 드론 촬영, 권리분석과 계약 검토, 등기 이전까지
            이어지는 안전한 프로세스를 제공합니다. “정직한 안내, 책임
            중개, 끝까지 케어”라는 원칙으로 고객의 내일을 돕겠습니다.
          </p>
        </div>
      </div>
    </section>
  );
}

export default IntroContent;
