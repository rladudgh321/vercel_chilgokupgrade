import Link from 'next/link';
import { use } from 'react';

export type ListingTypeProps = {
  name: string;
  imageUrl?: string;
};

const WhatTypeLand = ({listingType}: {listingType: Promise<ListingTypeProps[]>}) => {
  const listingTypePromise = use(listingType);
  return (
    <div className="mx-auto max-w-7xl text-center p-4">
      <h2 className="text-lg sm:text-xl font-bold">어떤 종류의 매물을 찾으세요?</h2>
      <p className="text-gray-600 text-sm sm:text-base">원하시는 매물의 종류를 선택해주세요!</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4 mt-4">
        {listingTypePromise.map((property, index) => {
          const href = `/landSearch?propertyType=${encodeURIComponent(property.name)}`;
          return (
            <Link href={href} key={`${property.name}-${index}`} className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden block">
              <div
                style={{ backgroundImage: `url(${property.imageUrl})` }}
                className="h-[80px] sm:h-[100px] md:h-[115px] bg-center bg-cover"
              />
              <div className="text-center py-2 font-semibold text-sm sm:text-base">{property.name}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default WhatTypeLand;
