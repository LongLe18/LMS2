import React from 'react';
import { Carousel } from 'antd';

const CarouselCustom = () => {
  

  return (
    <Carousel autoplay style={{marginBottom: 12}}>
      <div>
        <img src={require('assets/img/banner1.jpg').default} alt='banner1'/>
      </div>
      <div>
        <img src={require('assets/img/banner2.jpg').default} alt='banner1'/>
      </div>
      <div>
        <img src={require('assets/img/banner3.jpg').default} alt='banner1'/>
      </div>
    </Carousel>
  );
};

export default CarouselCustom;