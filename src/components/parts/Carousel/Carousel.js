import React from 'react';
import { Carousel } from 'antd';

// const contentStyle = {
//   margin: 0,
//   height: '160px',
//   color: '#fff',
//   lineHeight: '160px',
//   textAlign: 'center',
//   background: '#364d79',
// };

const CarouselCustom = () => {
  // const onChange = (currentSlide) => {
  //   console.log(currentSlide);
  // };

  return (
    <Carousel autoplay style={{marginBottom: 12, minHeight: 475}}>
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