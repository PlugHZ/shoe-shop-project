import React from 'react';
import Banner from '../components/Banner';
import Badges from '../components/Badges';
import ProductSection from '../components/ProductSection';
import { products } from '../data/mockData';

const Home = () => {
  return (
    <>
      <Banner />
      <Badges />
      
      
      <ProductSection 
        title="สินค้ามาใหม่" 
        products={products} 
         
      />
      
      
      <ProductSection 
        title="สินค้ายอดฮิต" 
        products={[...products].reverse()} 
        
      />
    </>
  );
};

export default Home;