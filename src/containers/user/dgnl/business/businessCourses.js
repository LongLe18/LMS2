import React, { useEffect, useState } from "react";
import './css/CourseCates.css';
import './css/business.css';
import './css/Testimonials.css';

import { Helmet } from 'react-helmet';
import { Link } from "react-router-dom";

// helper
import defaultImage from 'assets/img/default.jpg';
import config from '../../../../configs/index';
import moment from "moment";

// component
import { Layout, Row, Col, Button, Input, Select, Form } from 'antd';
import Statisic from 'components/parts/statisic/Statisic';

// redux
import { useSelector, useDispatch } from 'react-redux';
import * as courseAction from '../../../../redux/actions/course';
import * as programmeAction from '../../../../redux/actions/programme';

const { Content } = Layout;
const { Option } = Select;

const CoursesPage = (props) => {
    const [dataInit, setDataInit] = useState([]);
    const [dataSearch, setDataSearch] = useState([]);
    
    const dispatch = useDispatch();

    const [form] = Form.useForm();
    const courses = useSelector(state => state.course.list.result);
    const programmes = useSelector(state => state.programme.list.result);

    useEffect(() => {
        dispatch(courseAction.getCourses({ idkct: '', status: 1, search: '' }, (res) => {
            if (res.status === 'success') {
                res.data.sort((objA, objB) => Number(new Date(objB.ngay_bat_dau)) - Number(new Date(objA.ngay_bat_dau)));
                setDataInit(res.data);
                // dataInit.push(...courses.data);    
            }
        }));
        dispatch(programmeAction.getProgrammes({ status: '' }))
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const renderProgramme = () => {
        let options = [];
        if (programmes.status === 'success') {
            options = programmes.data.map((programme) => (
                <Option key={programme.kct_id} value={programme.kct_id} >{programme.ten_khung_ct}</Option>
            ))
        }
        return (
            <Select 
                showSearch={false}
                placeholder="Chọn khung chương trình"
                maxTagCount="responsive"
            >
                <Option value='' >Tất cả</Option>
                {options}
            </Select>
        );
    };

    const renderLinhVuc = () => {
        // let options = [];
        // if (programmes.status === 'success') {
        //     options = programmes.data.map((programme) => (
        //         <Option key={programme.kct_id} value={programme.kct_id} >{programme.ten_khung_ct}</Option>
        //     ))
        // }
        return (
            <Select
                showSearch={false}
                placeholder="Chọn lĩnh vực"
                maxTagCount="responsive"
            >   
                <Option value='' >Tất cả</Option>
                {/* {options} */}
            </Select>
        );
    };

    const search = (values) => {
        if (values.ten_khoa_hoc !== undefined && values.linh_vuc_id !== undefined && values.kct_id !== undefined) {
            dispatch(courseAction.getCourses({ idkct: values.kct_id, status: 1, search: values.ten_khoa_hoc, idLinhVuc: values.linh_vuc_id }, (res) => {
                if (res.status === 'success') {
                    setDataSearch(res.data);
                }
            }));
        } else if (values.ten_khoa_hoc !== undefined && values.linh_vuc_id !== undefined) {
            dispatch(courseAction.getCourses({ idkct: '', status: 1, search: values.ten_khoa_hoc, idLinhVuc: values.linh_vuc_id }, (res) => {
                if (res.status === 'success') {
                    setDataSearch(res.data);
                }
            }));
        } else if (values.linh_vuc_id !== undefined && values.kct_id !== undefined) {
            dispatch(courseAction.getCourses({ idkct: values.kct_id, status: 1, search: '', idLinhVuc: values.linh_vuc_id }, (res) => {
                if (res.status === 'success') {
                    setDataSearch(res.data);
                }
            }));
        } else if (values.ten_khoa_hoc !== undefined && values.kct_id !== undefined) {
            dispatch(courseAction.getCourses({ idkct: values.kct_id, status: 1, search: values.ten_khoa_hoc, idLinhVuc: '' }, (res) => {
                if (res.status === 'success') {
                    setDataSearch(res.data);
                }
            }));
        } else if (values.kct_id !== undefined) {
            dispatch(courseAction.getCourses({ idkct: values.kct_id, status: 1, search: '', }, (res) => {
                if (res.status === 'success') {
                    setDataSearch(res.data);
                }
            }));
        } else if (values.ten_khoa_hoc !== undefined) {
            dispatch(courseAction.getCourses({ idkct: '', status: 1, search: values.ten_khoa_hoc }, (res) => {
                if (res.status === 'success') {
                    setDataSearch(res.data);
                }
            }));
        } else if (values.linh_vuc_id !== undefined) {
            dispatch(courseAction.getCourses({ idkct: '', status: 1, idLinhVuc: values.linh_vuc_id, search: '' }, (res) => {
                if (res.status === 'success') {
                    setDataSearch(res.data);
                }
            }));
        }
    };

    const renderCourses = () => {
        return (
            <>      
                <div className="list-course-cate">        
                    <div className="wraper wraper-list-course-cate-index">
                        <Row>
                            <Col span={24} className="filter-todo">
                                <Form layout="vertical" form={form} autoComplete="off" onFinish={search}>
                                    <Row justify="center">
                                        
                                        <Col xl={6} md={6} xs={24}>
                                            <Form.Item 
                                                initialValue={''}
                                                className="input-col"
                                                name="kct_id"
                                                rules={[]} >
                                                    {renderProgramme()}
                                            </Form.Item>  
                                        </Col>
                                        <Col xl={6} md={6} xs={24}>
                                            <Form.Item 
                                                className="input-col"
                                                initialValue={''}
                                                name="linh_vuc_id"
                                                rules={[]} >
                                                    {renderLinhVuc()}
                                            </Form.Item>  
                                        </Col>
                                        <Col xl={6} md={6} xs={24}>
                                            <Form.Item 
                                                className="input-col"
                                                name="ten_khoa_hoc"
                                                rules={[]} >
                                                    <Input placeholder="Nhập tên khóa học"/>
                                            </Form.Item>  
                                        </Col>
                                        <Col xl={2} md={6} xs={24} style={{textAlign: 'center'}}>
                                            <Button type="primary" htmlType="submit">Tìm kiếm</Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </Col>
                        </Row>
                        <br/>
                        {dataSearch.length > 0 && (
                        <>
                            <h2 className="section-title section-title-center">
                                <b></b>
                                <span className="section-title-main">KẾT QUẢ TÌM KIẾM</span>
                                <b></b>
                            </h2>
                            <Row gutter={[16, 16]} className="list-cate-items">
                                {dataSearch.map((cate, index) => {
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
                                                        <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${cate.khoa_hoc_id}`} >
                                                            <Button type="primary" style={{margin: '12px 0 12px 0'}}>
                                                                Xem chi tiết
                                                            </Button>
                                                        </Link>
                                                    </p>
                                                </div>
                                            </div>
                                        </Col>
                                    )
                                })}
                            </Row>
                        </>
                        )}
                        
                        <h2 className="section-title section-title-center">
                            <b></b>
                            <span className="section-title-main">KHÓA HỌC MỚI NHẤT</span>
                            <b></b>
                        </h2>
                        {dataInit.length > 0 && (
                        <Row gutter={[16, 16]} className="list-cate-items">
                            {dataInit.map((cate, index) => {
                                if (index < 4) 
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
                                                        <span>Ngày bắt đầu: {moment(cate.ngay_bat_dau).format(config.DATE_FORMAT_SHORT)}</span>
                                                        <span>Ngày kết thúc: {moment(cate.ngay_ket_thuc).format(config.DATE_FORMAT_SHORT)}</span>
                                                        <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${cate.khoa_hoc_id}`}>
                                                            <Button type="primary" style={{margin: '12px 0 12px 0'}}>
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

                        {(courses.status === 'success' && programmes.status === 'success' && programmes.data.length > 0) && programmes.data.map((item, index) => {
                                return (
                                    
                                    <div key={index}>
                                        <h2 className="section-title section-title-center" >
                                            <b></b>
                                            {courses.data.length > 0 && <span className="section-title-main">{item.ten_khung_ct}</span>}
                                            <b></b>
                                        </h2>
                                        <Row gutter={[16, 16]} className="list-cate-items" >
                                        {programmes.data.length > 0 ? courses.data.filter(course => course.kct_id === item.kct_id).map((item2, index2) => {
                                            return (
                                                <Col xl={6} sm={12} xs={12} className="course-cate-row" key={index2}>
                                                    <div className="course-cate-box">
                                                        <div className="image-box">
                                                            <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${item2.khoa_hoc_id}`}>
                                                                <img src={ item2.anh_dai_dien ? config.API_URL + `${item2.anh_dai_dien}` : defaultImage} alt={item2.ten_khoa_hoc} />
                                                            </Link>
                                                        </div>
                                                        <div className="box-text">
                                                            <h3 className="course-cate-title">
                                                                <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${item2.khoa_hoc_id}`}>{item2.ten_khoa_hoc}</Link>
                                                            </h3>
                                                            <p className="course-cate-description">
                                                                <span>Ngày bắt đầu: {moment(item2.ngay_bat_dau).format(config.DATE_FORMAT_SHORT)}</span>
                                                                <span>Ngày kết thúc: {moment(item2.ngay_ket_thuc).format(config.DATE_FORMAT_SHORT)}</span>
                                                                <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${item2.khoa_hoc_id}`}>
                                                                    <Button type="primary" style={{margin: '12px 0 12px 0'}}>
                                                                        Xem chi tiết
                                                                    </Button>
                                                                </Link>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Col>
                                            )           
                                        }) : null}
                                        </Row>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                
            </>
        )
    };

    return (
        <>
            <Layout className="main-app">
                <Helmet>
                    <title>Danh sách khóa học</title>
                </Helmet>
                <Content className="app-content ">
                    <Statisic />
                    {renderCourses()}
                </Content>
            </Layout>
        </>
    )
}

export default CoursesPage;