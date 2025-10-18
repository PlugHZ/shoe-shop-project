import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './Banner.css';

const Banner = () => {
  return (
    <section className="banner-section">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={true}
        pagination={{ clickable: true }}
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="main-banner-swiper"
      >
        <SwiperSlide>
          <img src="/images/banners/banner1.jpg" alt="Puma Sale Banner" />
        </SwiperSlide>
        <SwiperSlide>
          <img src="/images/banners/banner2.jpg" alt="Adidas Promo Banner" />
        </SwiperSlide>
      </Swiper>
    </section>
  );
};
export default Banner;