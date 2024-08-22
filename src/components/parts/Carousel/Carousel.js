import React from 'react';
import { Carousel } from 'antd';

const CarouselCustom = () => {

  return (
    <Carousel autoplay style={{marginBottom: 12, height: '100%'}}>
      <div>
        <img src={require('assets/img/banner1.jpg').default} alt='banner1' style={{aspectRatio: 2.5, borderRadius: 8}}/>
      </div>
      <div>
        <img src={require('assets/img/banner2.jpg').default} alt='banner1' style={{aspectRatio: 2.5, borderRadius: 8}}/>
      </div>
    </Carousel>
  );
};

export default CarouselCustom;