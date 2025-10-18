import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import ProductCard from './ProductCard';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './ProductSection.css';


const ProductSection = ({ title, products }) => {
  return (

    <section className="product-section-container container">
      <h2 className="section-title">{title}</h2>
      
      <Swiper
        modules={[Navigation, Pagination]}
        
        navigation={{
          nextEl: '.product-arrow-next',
          prevEl: '.product-arrow-prev',
        }}
        
        pagination={{ clickable: true }}
        spaceBetween={30}
        slidesPerView={3}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 10 },
          768: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
        }}
        className="product-swiper"
      >
        {products.map(product => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}

        <div className="product-arrow-prev"></div>
        <div className="product-arrow-next"></div>
      </Swiper>
      
    </section>
  );
};

export default ProductSection;