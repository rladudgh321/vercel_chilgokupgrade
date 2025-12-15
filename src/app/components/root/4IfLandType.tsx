import Link from "next/link";
import { use } from 'react';

export type ThemeImageProps = { name: string; image?: string; theme: string };

const IfLandType = ({ themeImage }: { themeImage: Promise<ThemeImageProps[]> }) => {
  const themeImagePromise = use(themeImage);
  return (
    <div className="mx-auto max-w-7xl text-center p-4">
      <h2 className="text-lg sm:text-xl font-bold">당신의 기준에 맞는 매물을 한눈에!</h2>
      <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
        테마별로 정리된 매물로 더 쉽게 만날 수 있습니다
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 mt-4 px-2">
        {themeImagePromise.map((item, index) => {
          const href = `/landSearch?theme=${encodeURIComponent(item.theme)}`;

          return (
            <Link
              href={href}
              key={index}
              className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden block hover:shadow-lg transition-shadow"
            >
              <div
                className="h-[80px] sm:h-[100px] md:h-[115px] bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <div className="text-center py-2 font-semibold text-sm sm:text-base dark:text-gray-700">
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default IfLandType;
