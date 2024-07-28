import React, { useEffect, useState } from "react";
import { Link, useParams, useHistory } from "react-router-dom";

// component
import { Row, Col, Button } from 'antd';

// helper
import defaultImage from 'assets/img/default.jpg';
import config from '../../../configs/index';
import moment from 'moment';

// redux
import { useDispatch } from 'react-redux';
import * as courseAction from '../../../redux/actions/course';

const FooterBusiness = (props) => {
    const [dataInit, setdataInit] = useState([]);
    let history = useHistory();
    const idTypeCourse = useParams().idKCT;
    
    const dispatch = useDispatch();
    
    useEffect(() => {
        const callback = (response) => {
            if (response.status === 'success') {
                response.data.sort((objA, objB) => Number(new Date(objB.ngay_bat_dau)) - Number(new Date(objA.ngay_bat_dau)));
                setdataInit(response.data);
            }
        };

        if (props.course) dispatch(courseAction.getCourses({ idkct: '', status: 1, search: '' }, callback));
        else {
            if (idTypeCourse !== undefined) dispatch(courseAction.getCourses({ idkct: idTypeCourse, status: 1, search: '' }, callback));
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    return (
        <footer className="footer list-course-cate">
            <div className="wraper wraper-list-course-cate-index" style={{borderRadius: 6}}>
                {props.course ? 
                <>
                    <h2 className="section-title section-title-center">
                        <b></b>
                        <span className="section-title-main">Các Khóa học khác</span>
                        <b></b>
                    </h2>
                    {dataInit.length > 0 && (
                        <Row gutter={[16, 16]} className="list-cate-items">
                            {dataInit.map((cate, index) => {
                                if (index >= 4) 
                                {
                                    return (
                                        <Col xl={6} sm={12} xs={12} className="course-cate-row" key={cate.khoa_hoc_id}>
                                            <div className="course-cate-box">
                                                <div className="image-box">
                                                    <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${cate.khoa_hoc_id}`}>
                                                        <img src={ cate.anh_dai_dien ? config.API_URL + `${cate.anh_dai_dien}` : defaultImage} alt={cate.ten_khoa_hoc} />
                                                    </Link>
                                                </div>
                                                <div className="box-text" style={{paddingBottom: 8}}>
                                                    <h3 className="course-cate-title">
                                                        <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${cate.khoa_hoc_id}`}>{cate.ten_khoa_hoc}</Link>
                                                    </h3>
                                                    <p className="course-cate-description">
                                                        {/* Ngày bắt đầu: {moment(cate.ngay_bat_dau).format(config.DATE_FORMAT_SHORT)} */}
                                                        <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${cate.khoa_hoc_id}`}>
                                                            <Button style={{borderRadius: 6}} type="primary" onClick={() => history.push(`/luyen-tap/gioi-thieu-khoa-hoc/${cate.khoa_hoc_id}`)}>
                                                                Xem chi tiết
                                                            </Button>
                                                        </Link>
                                                    </p>
                                                </div>
                                            </div>
                                        </Col>
                                    )
                                } else return null;
                            })}
                        </Row>
                    )}
                </>
                :
                <>
                    <h2 className="section-title section-title-center">
                        <b></b>
                        <span className="section-title-main">Các Khóa học liên quan</span>
                        <b></b>
                    </h2>
                    {dataInit.length > 0 && (
                        <Row gutter={[16, 16]} className="list-cate-items">
                            {dataInit.map((cate, index) => {
                                if (index >= 4) 
                                {
                                    return (
                                        <Col xl={6} sm={12} xs={12} className="course-cate-row" key={cate.khoa_hoc_id}>
                                            <div className="course-cate-box">
                                                <div className="image-box">
                                                    <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${cate.khoa_hoc_id}`}>
                                                        <img src={ cate.anh_dai_dien ? config.API_URL + `${cate.anh_dai_dien}` : defaultImage} alt={cate.ten_khoa_hoc} />
                                                    </Link>
                                                </div>
                                                <div className="box-text">
                                                    <h3 className="course-cate-title">
                                                        <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${cate.khoa_hoc_id}`}>{cate.ten_khoa_hoc}</Link>
                                                    </h3>
                                                    <p className="course-cate-description">
                                                        Ngày bắt đầu: {moment(cate.ngay_bat_dau).format(config.DATE_FORMAT_SHORT)}
                                                        <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${cate.khoa_hoc_id}`}>
                                                            <Button style={{borderRadius: 6}} type="primary" onClick={() => history.push(`/luyen-tap/gioi-thieu-khoa-hoc/${cate.khoa_hoc_id}`)}>
                                                                Xem chi tiết
                                                            </Button>
                                                        </Link>
                                                    </p>
                                                </div>
                                            </div>
                                        </Col>
                                    )
                                } else return null;
                            })}
                        </Row>
                    )}
                </>
                }
            </div>
        </footer>
    )
}

export default FooterBusiness; 