"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

const Institue = () => {
  return (
    <div className="my-8">
      <Swiper
        style={{ margin: "10px" }}
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={10}
        pagination={{ clickable: true }}
        breakpoints={{
          320: {
            slidesPerView: 3,
            spaceBetween: 10
          },
          480: {
            slidesPerView: 4,
            spaceBetween: 10
          },
          768: {
            slidesPerView: 5,
            spaceBetween: 10
          },
          1024: {
            slidesPerView: 6,
            spaceBetween: 10
          }
        }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <SwiperSlide key={`institu${i + 1}`}>
            <div
              className="h-[50px] sm:h-[60px] md:h-[70px] border border-gray-300 bg-center bg-no-repeat bg-cover"
              style={{
                backgroundImage: `url("/img/4/${i + 1}.png")`,
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Institue;
