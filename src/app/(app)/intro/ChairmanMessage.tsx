import Image from "next/image";

const ChairmanMessage = () => {
  return (
    <section className="relative bg-gray-800 text-white p-4 sm:p-8 md:px-6 md:py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
        {/* 왼쪽 텍스트 */}
        <div className="space-y-6 leading-relaxed text-sm sm:text-base">
          <p>
            부동산 시장은 언제나 쉽지 않았습니다. 규제와 경기 변동,
            정보 비대칭이 반복되는 환경 속에서도, 우리는 위축되지 않고
            기본에 충실했습니다. 현장을 발로 뛰고, 데이터를 근거로
            판단하며, 고객의 입장에서 생각하는 태도가 오늘의 우리를
            만들었습니다.
          </p>
          <p>
            앞으로도 토지 매수·매도 모두에서 고객의 목적과 일정, 자금
            계획을 우선하여 최적의 전략을 제안하겠습니다. 개발 가능성
            검토에서 계약 체결, 사후 관리까지 전 과정을 투명하게
            안내하고, 필요 시 세무·법무 네트워크와 함께 문제 해결을
            돕겠습니다.
          </p>
          <p>
            신뢰는 한 번의 성과가 아니라, 매 거래마다 쌓이는 기록이라고
            믿습니다. 권오길 부동산은 고객의 땅과 내일을 이어주는
            파트너로서, 변함없는 정직과 책임으로 곁을 지키겠습니다.
          </p>

          <div className="mt-8">
            <p className="font-semibold">
              부동산 중개업 대표 <span className="ml-2">권오길</span>
            </p>
            <p className="italic text-gray-300">서명 이미지 자리</p>
          </div>
        </div>

        {/* 오른쪽 이미지 */}
        <div className="flex justify-center md:order-last order-first">
          <Image
            src="/father2.jpg"
            alt="권오길 대표"
            width={400}
            height={400}
            className="rounded-lg shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md"
          />
        </div>
      </div>
    </section>
  );
}

export default ChairmanMessage;
