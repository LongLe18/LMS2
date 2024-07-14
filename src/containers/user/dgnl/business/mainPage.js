import React, { useEffect } from "react";
import './css/CourseCates.css';
import './css/business.css';
import './css/Testimonials.css';

import { Helmet } from 'react-helmet';
import { Link } from "react-router-dom";

// component
import { Layout, Row, Col, Menu } from 'antd';
import CarouselCustom from 'components/parts/Carousel/Carousel';

// redux
import { useSelector, useDispatch } from 'react-redux';
// import * as courseAction from '../../../../redux/actions/course';
import * as programmeAction from '../../../../redux/actions/programme';
import Statisic from "components/parts/statisic/Statisic";

const { Content } = Layout;
// const { Option } = Select;

const MainPageUser = (props) => {
    
    const dispatch = useDispatch();

    // const [form] = Form.useForm();
    // const programmes = useSelector(state => state.programme.list.result);
    const programmeCourses = useSelector(state => state.programme.courses.result);

    useEffect(() => {
        
        dispatch(programmeAction.getProgrammeCourses());
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    

    function getItem(label, key, children, type) {
        return {
          key,
          children,
          label,
          type,
        };
    }
    
    // menu khóa học
    const items = [];
    if (programmeCourses.status === 'success') {
        programmeCourses?.data.forEach((item, index) => {
            let children = [];
            if (item.khoa_hocs && item.khoa_hocs.length > 0) {
                item.khoa_hocs.forEach((item2, index2) => {
                    
                    children.push(getItem(item2.ten_khoa_hoc, item2.khoa_hoc_id, null, 'item'));
                });
            }
            items.push(getItem(item.ten_khung_ct, item.kct_id, children, 'item'));
        });
    }
    
    
    const renderCourses = () => {
        return (
            <>      
                <div className="list-course-cate">        
                    <div className="wraper wraper-list-course-cate-index">
                        <Row gutter={16} style={{margin: '18px 0'}}>
                            <Col xl={5} md={4} xs={4} style={{paddingLeft: 0}}>
                                {(programmeCourses.status === 'success' && items.length > 0) &&
                                    <Menu style={{borderRadius: 6}}
                                        mode="vertical"
                                        theme="light"
                                        defaultSelectedKeys={['1']}
                                    >
                                        <Menu.Item style={{background: '#3da844', marginTop: 0, borderTopRightRadius: 6, borderTopLeftRadius: 6}}>
                                            <span style={{fontWeight: 600, color: "#fff"}}>Các khóa học</span>
                                        </Menu.Item>
                                        {items.map((item, index) => {
                                            return (
                                                <Menu.SubMenu title={item.label}>
                                                    {item.children?.map((child, index) => {
                                                        return (
                                                            <Menu.Item key={child.key}>
                                                                <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${child.key}`}>{child.label}</Link>
                                                            </Menu.Item>
                                                        )
                                                    })}
                                                </Menu.SubMenu>
                                            )
                                        })}
                                    </Menu>
                                }
                            </Col> 
                            <Col xl={19} md={20} xs={20}>
                                <CarouselCustom />
                            </Col>
                        </Row>
                        <Statisic />
                        <img alt="..."  style={{borderRadius: 6}}
                            className="img-no-padding img-responsive"
                            src={require("assets/img/lich_khoa_hoc.jpg").default}
                        />

                        <br/>

                        <img alt="..."  style={{borderRadius: 6, width: '100%'}}
                            className="img-no-padding img-responsive"
                            src={require("assets/img/chuc_nang.png").default}
                        />

                        <br/>

                        <img alt="..."  style={{borderRadius: 6, width: '100%'}}
                            className="img-no-padding img-responsive"
                            src={require("assets/img/trai_nghiem.png").default}
                        />
                    </div>
                </div>
                
            </>
        )
    };

    return (
        <>
            <Layout className="main-app">
                <Helmet>
                    <title>Trang chủ</title>
                </Helmet>
                <Content className="app-content ">
                    {renderCourses()}
                </Content>
            </Layout>
        </>
    )
}

export default MainPageUser;