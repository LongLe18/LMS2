import React from 'react';
import './CardSlider.css';
import config from '../../../configs/index';
import { Link } from "react-router-dom";

const Card = ({ ten_khoa_hoc, anh_dai_dien, mo_ta, khoa_hoc_id }) => {
  return (
        <div className="card">
            <div className="image-box">
                <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${khoa_hoc_id}`}>
                    <img src={anh_dai_dien ? config.API_URL + `${anh_dai_dien}` : require('assets/img/default.jpg').default} alt={ten_khoa_hoc} />
                </Link>
            </div>
            <div className="card-content">
                <h3 className="course-cate-title">
                    <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${khoa_hoc_id}`} style={{color: 'green'}}>{ten_khoa_hoc}</Link>
                </h3>
                <p>{mo_ta}</p>
            </div>
        </div>
    );
};

const CardSlider = ({ courses, id }) => {

    const scrollLeft = () => {
        document.querySelector(`#cards-container-${id}`).scrollBy({ left: -230, behavior: 'smooth' });
    };
      
    const scrollRight = () => {
        // scroll right
        document.querySelector(`#cards-container-${id}`).scrollBy({ left: 230, behavior: 'smooth' });
    };

    return (
        <div className="card-slider">
            <button className="scroll-button left" onClick={scrollLeft}>{'<'}</button>
            <div className="cards-container" id={`cards-container-${id}`}>
                {courses.map((course, index) => (
                    <Card key={index} {...course} />
                ))}
            </div>
            <button className="scroll-button right" onClick={scrollRight}>{'>'}</button>
        </div>
    );
};

export default CardSlider;
