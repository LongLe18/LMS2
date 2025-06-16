import React from 'react';
import { Carousel } from 'antd';

const CarouselCustom = () => {

  return (
    <Carousel autoplay style={{marginBottom: 12, height: '100%'}}>
      <div>
        <img src={require('assets/img/banner1.jpg').default} alt='banner1' style={{borderRadius: 8, minHeight: 425, maxHeight: 425, width: '100%'}}/>
      </div>
      <div>
        <img src={require('assets/img/banner2.jpg').default} alt='banner2' style={{borderRadius: 8, minHeight: 425, maxHeight: 425, width: '100%'}}/>
      </div>
      <div>
        <img src={require('assets/img/banner3.jpg').default} alt='banner3' style={{borderRadius: 8, minHeight: 425, maxHeight: 425, width: '100%'}}/>
      </div>
    </Carousel>
  );
};

export default CarouselCustom;