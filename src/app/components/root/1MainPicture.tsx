"use client"

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { use } from 'react';

export type Banner = {
  id: number;
  imageUrl: string;
  imageName: string;
};

const MainPicture = ({banners}: {banners: Promise<Banner[]>}) => {
  const bannersPromise = use(banners)
  return (
    <section className="w-full mt-14">
      {bannersPromise.length > 0 && (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
        >
          {bannersPromise.map((banner) => (
            <SwiperSlide key={banner.id}>
              <Image
                src={banner.imageUrl}
                alt={banner.imageName}
                width={1920} 
                height={400} 
                sizes="100vw"
                className="w-full h-auto"
                priority
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
};

export default MainPicture;