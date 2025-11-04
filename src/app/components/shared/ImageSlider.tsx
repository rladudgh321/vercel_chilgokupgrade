'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ImageSliderProps {
  images: string[];
}

const ImageSlider = ({ images }: ImageSliderProps) => {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 bg-gray-200 flex items-center justify-center rounded-md">
        <p className="text-gray-500">No image available</p>
      </div>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, A11y]}
      spaceBetween={10}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      className="w-full h-80 rounded-md"
    >
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <div
            className="w-full h-full bg-center bg-cover"
            style={{ backgroundImage: `url(${image})` }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ImageSlider;
