import React, { useEffect } from "react";
import './css/CourseCates.css';
import './css/business.css';
import './css/Testimonials.css';

import { Helmet } from 'react-helmet';
import { Link, useHistory } from "react-router-dom";
import axios from 'axios';

// helper
import defaultImage from 'assets/img/default.jpg';
import config from '../../../../configs/index';
import moment from "moment";
import Hashids from 'hashids';

// hooks
import useFetch from "hooks/useFetch";

// component
import { Layout, Row, Col, Button, notification } from 'antd';
import CarouselCustom from 'components/parts/Carousel/Carousel';
import NoRecord from "components/common/NoRecord";

// redux
import { useSelector, useDispatch } from 'react-redux';
import * as receiptAction from '../../../../redux/actions/receipt';
import * as courseAction from '../../../../redux/actions/course';

const {Content} = Layout;
const CoursesUser = (props) => {
    const dataInit = [];
    let history = useHistory();
    const dispatch = useDispatch();
    const hashids = new Hashids();
    
    const coursesUser = useSelector(state => state.receipt.listUser.result);
    const courses = useSelector(state => state.course.list.result);
    const [courseOfUser] = useFetch(`/student/list/course`);


    useEffect(() => {
        dispatch(receiptAction.getRECEIPTsUser({ status: 1 }));
        dispatch(courseAction.getCourses({ idkct: '', status: '', search: '' }))
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (coursesUser.status === 'success' && courses.status === 'success') {
        coursesUser.data.map((courseUser, index) => {
            courses.data.map((course, index2) => {
                if (course.khoa_hoc_id === courseUser.san_pham_id) {
                    courseUser.anh_dai_dien = course.anh_dai_dien;
                    courseUser.ngay_bat_dau = course.ngay_bat_dau;
                    courseUser.ngay_ket_thuc = course.ngay_ket_thuc;
                    courseUser.key = index2;
                }
                return null;
            })
            return null;
        })
        dataInit.push(coursesUser.data[0]);
    };

    const requestExamOnline = (idCourse) => {
        axios.get(config.API_URL + `/exam/onlineExam?khoa_hoc_id=${idCourse}`, { headers: {Authorization: `Bearer ${localStorage.getItem('userToken')}`,} })
            .then(
                res => {
                    if (res.status === 200 && res.statusText === 'OK') {
                        let data = res.data.data;
                        if (data.length > 0) {
                            const randomIndex = Math.floor(Math.random() * data.length);
                            const randomlySelectedElement = data[randomIndex];
                            history.push(`/luyen-tap/xem/${hashids.encode(randomlySelectedElement.de_thi_id)}/${hashids.encode(idCourse)}`)
                        }
                        else {
                            notification.warning({
                                message: 'Cảnh báo',
                                description: 'Khóa học này hiện chưa có đề thi. Xin vui lòng thử lại sau',
                            })
                        }
                    } else {
                        notification.error({
                            message: 'Lỗi',
                            description: 'Có lỗi xảy ra khi lấy dữ liệu',
                        })
                    }
                }
            )
            .catch(error => notification.error({ message: error.message }));
    }

    const renderCourses = () => {
        return (
            <div className="list-course-cate">
                <div className="wraper wraper-list-course-cate-index">
                    <CarouselCustom />
                    {(courseOfUser.length > 0) ? (
                        <>
                            <h2 className="section-title section-title-center">
                                <b></b>
                                    <span className="section-title-main">KHÓA HỌC CỦA BẠN</span>
                                <b></b>
                            </h2>
                    
                            <Row gutter={[16, 16]} className="list-cate-items">
                                {courseOfUser.map((cate, index) => {
                                    return (
                                        <Col xl={6} sm={12} xs={12} className="course-cate-row" key={cate.khoa_hoc_id}>
                                            <div className="course-cate-box">
                                                <div className="image-box">
                                                    {cate.loai_kct === 1 
                                                    ?
                                                        <Button className='btn-enter-online-course' onClick={() => requestExamOnline(cate.khoa_hoc_id)}>
                                                            <img src={ cate.anh_dai_dien ? config.API_URL + `${cate.anh_dai_dien}` : defaultImage} alt={cate.ten_khoa_hoc} />
                                                        </Button>
                                                    :
                                                        <Link to={`/luyen-tap/luyen-tap/${hashids.encode(cate.khoa_hoc_id)}`}>
                                                            <img src={ cate.anh_dai_dien ? config.API_URL + `${cate.anh_dai_dien}` : defaultImage} alt={cate.ten_khoa_hoc} />
                                                        </Link>
                                                    }
                                                </div>
                                                <div className="box-text">
                                                    {cate.loai_kct === 1
                                                    ?
                                                    <Button className='btn-enter-online-course' onClick={() => requestExamOnline(cate.khoa_hoc_id)}>
                                                        {cate.ten_khoa_hoc}
                                                    </Button>
                                                    :
                                                        <h3 className="course-cate-title">
                                                            <Link to={`/luyen-tap/luyen-tap/${hashids.encode(cate.khoa_hoc_id)}`}>{cate.ten_khoa_hoc}</Link>
                                                        </h3>
                                                    }
                                                    <p className="course-cate-description">
                                                        <span>Ngày bắt đầu: {moment(cate.ngay_bat_dau).format(config.DATE_FORMAT_SHORT)}</span>
                                                        <span>Ngày kết thúc: {moment(cate.ngay_ket_thuc).format(config.DATE_FORMAT_SHORT)}</span>
                                                        {cate.loai_kct === 1
                                                        ?
                                                            <div>
                                                                <Button type="primary" className="mt-2 mb-2" style={{borderRadius: 6}}  onClick={() => requestExamOnline(cate.khoa_hoc_id)} >
                                                                    Bắt đầu thi
                                                                </Button>
                                                            </div>
                                                        :
                                                            <Link to={`/luyen-tap/luyen-tap/${hashids.encode(cate.khoa_hoc_id)}`}>
                                                                <Button type="primary" style={{borderRadius: 6}}>
                                                                    Bắt đầu học
                                                                </Button>
                                                            </Link>
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </Col>
                                    )
                                })}
                            </Row>
                        </>
                    ): 
                        <NoRecord title={'Bạn chưa mua khóa học nào'} subTitle={''}/>
                    }
                    {/* Tài liệu */}
                    {dataInit.length > 0 ? (
                        <>
                            <h2 className="section-title section-title-center">
                                <b></b>
                                    <span className="section-title-main">TÀI LIỆU CỦA BẠN</span>
                                <b></b>
                            </h2>
                            <Row gutter={[16, 16]} className="list-cate-items">
                                {coursesUser.data.map((cate, index) => {
                                    if (cate.loai_san_pham === 'Tài liệu') {
                                        return (
                                            <Col xl={6} sm={12} xs={12} className="course-cate-row" key={cate.san_pham_id}>
                                                <div className="course-cate-box">
                                                    <div className="image-box">
                                                        <Link to={`/luyen-tap/luyen-tap/${hashids.encode(cate.san_pham_id)}`}>
                                                            <img src={ cate.anh_dai_dien ? config.API_URL + `${cate.anh_dai_dien}` : defaultImage} alt={cate.ten_khoa_hoc} />
                                                        </Link>
                                                    </div>
                                                    <div className="box-text">
                                                        <h3 className="course-cate-title">
                                                            <Link to={`/luyen-tap/luyen-tap/${hashids.encode(cate.san_pham_id)}`}>{cate.ten_san_pham}</Link>
                                                        </h3>
                                                        <p className="course-cate-description">
                                                            <span>Ngày bắt đầu: {moment(cate.ngay_bat_dau).format(config.DATE_FORMAT_SHORT)}</span>
                                                            <span>Ngày kết thúc: {moment(cate.ngay_ket_thuc).format(config.DATE_FORMAT_SHORT)}</span>
                                                            <Link to={`/luyen-tap/luyen-tap/${hashids.encode(cate.san_pham_id)}`}>
                                                                <Button type="primary">
                                                                    Bắt đầu xem
                                                                </Button>
                                                            </Link>
                                                        </p>
                                                    </div>
                                                </div>
                                            </Col>
                                        )
                                    }
                                    return null; 
                                })}
                            </Row>
                        </>
                    ): 
                        <NoRecord title={'Bạn chưa mua tài liệu nào'} subTitle={''}/>
                    }
                </div>
            </div>
        )
    }
    return (
        <>  
            <Layout className="main-app">
                <Helmet>
                    <title>Danh sách khóa học của bạn</title>
                </Helmet>
                <Content className="app-content ">
                    {renderCourses()}
                </Content>
            </Layout>
        </>
    )
}

export default CoursesUser;