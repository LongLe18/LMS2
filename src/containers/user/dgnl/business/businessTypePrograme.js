import React, { useEffect, useState } from "react";
import './css/CourseCates.css';
import './css/business.css';
import './css/Testimonials.css';
import constants from '../../../../helpers/constants';

import { Helmet } from 'react-helmet';
import { Link, useParams } from "react-router-dom";
import Hashids from 'hashids';

// helper
import defaultImage from 'assets/img/default.jpg';
import config from '../../../../configs/index';

// component
import { Layout, Row, Col, Button, Input, Select, Form, Menu } from 'antd';
import CarouselCustom from 'components/parts/Carousel/Carousel';
import FooterBusiness from "components/parts/Footers/FooterBusiness";
import CardSlider from 'components/parts/CardSlider/CardSlider';
import { BookOutlined, BarsOutlined, StarOutlined, MenuOutlined, } from '@ant-design/icons';

// redux
import { useSelector, useDispatch } from 'react-redux';
import * as courseAction from '../../../../redux/actions/course';
import * as programmeAction from '../../../../redux/actions/programme';
import Statisic from "components/parts/statisic/Statisic";

const { Content } = Layout;
const { Option } = Select;

const BusinessTypeProgramePage = (props) => {
    const idTypeKCT = useParams().idTypeKCT;
    const hashids = new Hashids();
    const [dataInit, setDataInit] = useState([]); // eslint-disable-next-line no-unused-vars
    const [dataSearch, setDataSearch] = useState([]);
    const [selectedTabs, setSelectedTabs] = useState({});
    
    const dispatch = useDispatch();

    const [form] = Form.useForm();
    const courses = useSelector(state => state.course.list.result);
    const programmes = useSelector(state => state.programme.list.result);
    const programmeCourses = useSelector(state => state.programme.courses.result);

    const typeProgrammes = [
        {
            id: 1,
            name: 'Kiểm tra trình độ đầu vào',
            name2: 'Kiểm tra trình độ đầu vào Online', 
            idElement: 'testEntrance',
            description: 'Bài kiểm tra được xây dựng bởi đội ngũ các Thầy Cô uy tín, nhiều năm kinh \n nghiệm giảng dạy nhằm đánh giá đúng trình độ đầu vào của mỗi HS'
        },
        { 
            id: 0,
            name: 'Thi thử tốt nghiệp - đgnl - đgtd', 
            name2: 'Thi thử ĐGNL - ĐHQGHN (HSA) Online', 
            idElement: 'testCapacity',
            description: 'Trải nghiệm làm bài thi tốt nghiệp THPT, ĐGNL (HSA), ĐGTD (TSA) trên phần mềm thi thử \n giống như khi làm bài HSA - TSA trên thực tế ở tổ chức tại ĐHQGHN, ĐHBK ...' 
        }, 
        {
            id: 3,
            name: 'Thi thử tốt nghiệp - đgnl - đgtd', 
            name2: 'Thi thử tốt nghiệp THCS, THPT và ĐGTD ĐHBK (TSA)',
            idElement: 'testCapacity',
            description: 'Trải nghiệm làm bài thi tốt nghiệp THPT, ĐGNL (HSA), ĐGTD (TSA) trên phần mềm thi thử \n giống như khi làm bài HSA - TSA trên thực tế ở tổ chức tại ĐHQGHN, ĐHBK ...',
        }, {
            id: 2,
            name: 'Khóa luyện thi hàng đầu', 
            name2: 'Luyện thi ĐGNL (HSA), ĐGTD (TSA)', 
            description: 'Được xây dựng và thiết kế bởi đội ngũ giáo viên, chuyên gia uy tín hàng đầu đến từ ĐHQGHN, ĐHSP HN, ĐHBK ...' ,
            idElement: 'study', 
        }, {
            id: 4,
            name: 'Khóa luyện thi hàng đầu', 
            name2: 'Luyện thi tốt nghiệp THCS, THPT',
            idElement: 'study',
            description: 'Được xây dựng và thiết kế bởi đội ngũ giáo viên, chuyên gia uy tín hàng đầu đến từ ĐHQGHN, ĐHSP HN, ĐHBK ...' 
        }, {
            id: 5,
            name: 'Giáo trình, học liệu, bộ đề thi chuẩn',
            name2: 'Học liệu, giáo trình, trải nghiệm giáo dục, steam - stem, ...', 
            idElement: 'study', 
            description: 'Được xây dựng và thiết kế bởi đội ngũ giáo viên, chuyên gia uy tín hàng đầu đến từ ĐHQGHN, ĐHSP HN, ĐHBK ...' 
        }, {
            id: 6,
            name: 'Giáo trình, học liệu, bộ đề thi chuẩn',
            name2: 'Bộ đề thi chuẩn được cập nhật mới theo từng năm',
            idElement: 'examSample',
            description: 'Được xây dựng và thiết kế bởi đội ngũ giáo viên, chuyên gia uy tín hàng đầu đến từ ĐHQGHN, ĐHSP HN, ĐHBK ...' 
        }
    ];
    
    useEffect(() => {
        dispatch(courseAction.getCourses({ idkct: '', status: 1, search: '', pageSize: 99999999, pageIndex: 1 }, (res) => {
            if (res.status === 'success') {
                res.data.sort((objA, objB) => Number(new Date(objB.ngay_bat_dau)) - Number(new Date(objA.ngay_bat_dau)));
                setDataInit(res.data);
            }
        }));
        dispatch(programmeAction.getProgrammes({ status: '' }));
        dispatch(programmeAction.getProgrammeCourses({ pageIndex: 1, pageSize: 99999999 }));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleTabClick = (khungCT, value) => {
        setSelectedTabs(prev => ({
            ...prev,
            [khungCT]: value,
        }));
    };

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
            dispatch(courseAction.getCourses({ idkct: values.kct_id, status: 1, search: values.ten_khoa_hoc, idLinhVuc: values.linh_vuc_id, pageSize: 99999999, pageIndex: 1 }, (res) => {
                if (res.status === 'success') {
                    setDataSearch(res.data);
                }
            }));
        } else if (values.ten_khoa_hoc !== undefined && values.linh_vuc_id !== undefined) {
            dispatch(courseAction.getCourses({ idkct: '', status: 1, search: values.ten_khoa_hoc, idLinhVuc: values.linh_vuc_id, pageSize: 99999999, pageIndex: 1 }, (res) => {
                if (res.status === 'success') {
                    setDataSearch(res.data);
                }
            }));
        } else if (values.linh_vuc_id !== undefined && values.kct_id !== undefined) {
            dispatch(courseAction.getCourses({ idkct: values.kct_id, status: 1, search: '', idLinhVuc: values.linh_vuc_id, pageSize: 99999999, pageIndex: 1 }, (res) => {
                if (res.status === 'success') {
                    setDataSearch(res.data);
                }
            }));
        } else if (values.ten_khoa_hoc !== undefined && values.kct_id !== undefined) {
            dispatch(courseAction.getCourses({ idkct: values.kct_id, status: 1, search: values.ten_khoa_hoc, idLinhVuc: '', pageSize: 99999999, pageIndex: 1 }, (res) => {
                if (res.status === 'success') {
                    setDataSearch(res.data);
                }
            }));
        } else if (values.kct_id !== undefined) {
            dispatch(courseAction.getCourses({ idkct: values.kct_id, status: 1, search: '', pageSize: 99999999, pageIndex: 1 }, (res) => {
                if (res.status === 'success') {
                    setDataSearch(res.data);
                }
            }));
        } else if (values.ten_khoa_hoc !== undefined) {
            dispatch(courseAction.getCourses({ idkct: '', status: 1, search: values.ten_khoa_hoc, pageSize: 99999999, pageIndex: 1 }, (res) => {
                if (res.status === 'success') {
                    setDataSearch(res.data);
                }
            }));
        } else if (values.linh_vuc_id !== undefined) {
            dispatch(courseAction.getCourses({ idkct: '', status: 1, idLinhVuc: values.linh_vuc_id, search: '', pageSize: 99999999, pageIndex: 1 }, (res) => {
                if (res.status === 'success') {
                    setDataSearch(res.data);
                }
            }));
        }
    };

    function getItem(label, icon, key, children, type) {
        return {
            key,
            icon,
            children,
            label,
            type,
        };
    }
    
    // menu khóa học
    const items = [];
    if (programmeCourses.status === 'success') {
        programmeCourses?.data.filter(item => item.trang_thai).filter(item => item.loai_kct !== 5).forEach((item, index) => {
            let children = [];
            if (item.khoa_hocs && item.khoa_hocs.length > 0) {
                item.khoa_hocs.forEach((item2, index2) => {
                    
                    children.push(getItem(item2.ten_khoa_hoc, <BookOutlined />, item2.khoa_hoc_id, null, 'item'));
                });
            }
            items.push(getItem(item.ten_khung_ct, <BookOutlined />, item.kct_id, children, 'item'));
        });
    }

    const renderCourses = () => {
        const data = courses?.data?.filter(course => course?.khung_chuong_trinh?.loai_kct === Number(idTypeKCT));
        const khoaHocTheoKhung = data
        ?.sort((a, b) => {
            return a.khung_chuong_trinh.thu_tu - b.khung_chuong_trinh.thu_tu;
        })
        ?.reduce((acc, khoaHoc) => {
            const khungCT = khoaHoc.khung_chuong_trinh.ten_khung_ct;
            if (!acc[khungCT]) {
                acc[khungCT] = [];
            }
            acc[khungCT].push(khoaHoc);
            return acc;
        }, {});

        return (
            <div className="list-course-cate">        
                <div className="wraper wraper-list-course-cate-index">
                    <Row gutter={16} style={{margin: '18px 0'}}>
                        <Col xl={6} md={24} xs={24} style={{paddingLeft: 0, marginBottom: 12}}>
                            {(programmeCourses.status === 'success' && items.length > 0) &&
                                <Menu style={{borderRadius: 6}}
                                    mode="vertical"
                                    theme="light"
                                    defaultSelectedKeys={['1']}
                                >
                                    <Menu.Item style={{background: 'rgb(40, 157, 40)', marginTop: 0, borderTopRightRadius: 6, borderTopLeftRadius: 6}}
                                        icon={<BarsOutlined style={{color: '#fff'}}/>}
                                    >
                                        <span style={{fontWeight: 600, color: "#fff"}}>Các khóa học</span>
                                    </Menu.Item>
                                    {items.map((item, index) => {
                                        return (
                                            <Menu.SubMenu title={item.label} key={Number(index)} icon={item.icon}>
                                                {item.children?.map((child, index) => {
                                                    return (
                                                        <Menu.Item key={child.key}>
                                                            <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${hashids.encode(child.key)}`}>{child.label}</Link>
                                                        </Menu.Item>
                                                    )
                                                })}
                                            </Menu.SubMenu>
                                        )
                                    })}
                                </Menu>
                            }
                        </Col> 
                        <Col xl={18} md={24} xs={24}>
                            <CarouselCustom />
                        </Col>
                    </Row>
                    <Statisic />

                    <br/>
                    
                    <Row>
                        <Col span={24} className="filter-todo">
                            <Form layout="vertical" form={form} autoComplete="off" onFinish={search}>
                                <Row justify="center" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
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
                                        <Button type="primary" htmlType="submit" style={{borderRadius: 6}}>Tìm kiếm</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Col>
                    </Row>

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
                                                    <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${hashids.encode(cate.khoa_hoc_id)}`}>
                                                        <img src={ cate.anh_dai_dien ? config.API_URL + `${cate.anh_dai_dien}` : defaultImage} alt={cate.ten_khoa_hoc} />
                                                    </Link>
                                                </div>
                                                <div className="box-text">
                                                    <h3 className="course-cate-title">
                                                        <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${hashids.encode(cate.khoa_hoc_id)}`}>{cate.ten_khoa_hoc}</Link>
                                                    </h3>
                                                    <p className="course-cate-description">
                                                        {/* Ngày bắt đầu: {moment(cate.ngay_bat_dau).format(config.DATE_FORMAT_SHORT)} */}
                                                        <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${hashids.encode(cate.khoa_hoc_id)}`} >
                                                            <Button type="primary" style={{margin: '12px 0 12px 0', fontSize: 12, borderRadius: 4}}>
                                                                Chi tiết
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

                    {(Number(idTypeKCT) === 2 || Number(idTypeKCT) === 4 || Number(idTypeKCT) === 5) ? (
                        typeProgrammes.filter((type) => type.id === Number(idTypeKCT)).map((item, index) => {
                            return (
                                <div key={'key_' + index}>
                                    <h3 className="section-title section-title-center" style={{marginTop: 24}}>
                                        <b></b>
                                        <MenuOutlined style={{color: 'rgb(25, 105, 45)', fontSize: 20, marginLeft: 6}}/>
                                        <span style={{justifyContent: 'center', textTransform: 'uppercase', 
                                            color: 'rgb(25, 105, 45)', fontWeight: 700, margin: '0 15px'}}
                                        >
                                            {item.name2}
                                        </span>
                                        <b></b>
                                    </h3>
                                    <div className="description-course">
                                        <div dangerouslySetInnerHTML={{__html: item.description}} className="description-course-item"></div>
                                        <div>
                                            <StarOutlined style={{margin: '0 12px 12px 0', color: '#ff6c00', fontSize: 24}}/>
                                            <StarOutlined style={{margin: '0 12px 12px 0', color: '#ff6c00', fontSize: 24}}/>
                                            <StarOutlined style={{margin: '0 12px 12px 0', color: '#ff6c00', fontSize: 24}}/>
                                        </div>
                                    </div>
                                    {khoaHocTheoKhung && Object.keys(khoaHocTheoKhung).map((khungCT, indexKCT) => {
                                        const selectedTab = selectedTabs[khungCT] || constants.TYPE_COURSES[0].value;
                                        return (
                                            <div className="main-section" key={'key_' + indexKCT}>
                                                <div className="header-section" style={{background: 'white'}}>
                                                    <h3 className="section-title section-title-center" 
                                                        style={{marginBottom: 0, marginTop: 0, borderLeft: '5px rgb(25, 105, 45) solid'}}
                                                    >
                                                        <span className="section-title-main" style={{color: 'rgb(25, 105, 45)'}}>{khungCT}</span>
                                                    </h3>
                                                </div>
                                                <Row className="button-tabs" gutter={16}>
                                                    {constants.TYPE_COURSES.map((item, index) => (
                                                        <Col span={8} key={'keytab_' + item.value}>
                                                            <div className={`tab-courses ${selectedTab === item.value ? 'active-tab' : ''}`}
                                                                onClick={() => handleTabClick(khungCT, item.value)}
                                                            >
                                                                {item.label}
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                                <CardSlider id={indexKCT}
                                                    courses={khoaHocTheoKhung[khungCT].filter(course => course?.loai_khoa_hoc?.lkh_id === selectedTab)
                                                        .sort((a, b) => {
                                                            if (a.ten_khoa_hoc < b.ten_khoa_hoc) return -1;
                                                            if (a.ten_khoa_hoc > b.ten_khoa_hoc) return 1;
                                                            return 0;
                                                    })} 
                                                    link={`/luyen-tap/gioi-thieu-khoa-hoc/`}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })   
                    )
                    :
                        <Row gutter={16}>
                        {
                            typeProgrammes.filter((type) => type.id === Number(idTypeKCT)).map((item, index) => {
                                return (
                                    <Col Col xl={24} md={24} xs={24} key={'key_' + index}>
                                        <h3 className="section-title section-title-center" style={{marginTop: 24}}>
                                            <b></b>
                                            <MenuOutlined style={{color: 'rgb(21, 87, 21)', fontSize: 20, marginLeft: 6}}/>
                                            <span style={{justifyContent: 'center', textTransform: 'uppercase', 
                                                color: 'rgb(21, 87, 21)', fontWeight: 700, margin: '0 15px'}}
                                            >
                                                {item.name}
                                            </span>
                                            <b></b>
                                        </h3>
                                        <div className="description-course">
                                            <div dangerouslySetInnerHTML={{__html: item.description}} className="description-course-item"></div>
                                            <div>
                                                <StarOutlined style={{margin: '0 12px 12px 0', color: '#ff6c00', fontSize: 24}}/>
                                                <StarOutlined style={{margin: '0 12px 12px 0', color: '#ff6c00', fontSize: 24}}/>
                                                <StarOutlined style={{margin: '0 12px 12px 0', color: '#ff6c00', fontSize: 24}}/>
                                            </div>
                                        </div>
                                        <Row gutter={[16, 16]} className="list-cate-items">
                                            {courses.status === 'success' && courses.data.filter(course => course.khung_chuong_trinh.loai_kct === item.id).map((cate, index) => {
                                                return (
                                                    <Col xl={5} sm={12} xs={12} className="course-cate-row" key={cate.key}>
                                                        <div className="course-cate-box">
                                                            <div className="image-box">

                                                                <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${hashids.encode(cate.khoa_hoc_id)}`}>
                                                                    <img src={ cate.anh_dai_dien ? config.API_URL + `${cate.anh_dai_dien}` : defaultImage} alt={cate.ten_khoa_hoc} />
                                                                </Link>
                                                            </div>
                                                            <div className="box-text pb-1">
                                                                <h3 className="course-cate-title" style={{minHeight: 38}}>
                                                                    <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${hashids.encode(cate.khoa_hoc_id)}`}>{cate.ten_khoa_hoc}</Link>
                                                                </h3>
                                                                <p className="course-cate-description">
                                                                    <Link to={`/luyen-tap/gioi-thieu-khoa-hoc/${hashids.encode(cate.khoa_hoc_id)}`} >
                                                                        <Button type="primary" style={{margin: '12px 0 12px 0', fontSize: 12, borderRadius: 4}}>
                                                                            Chi tiết
                                                                        </Button>
                                                                    </Link>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                )
                                            })}
                                        </Row>
                                    </Col>
                                )
                            })
                        }
                        </Row>
                    }

                    
                
                    {/* {(courses.status === 'success' && programmes.status === 'success' && programmes.data.length > 0) && 
                        typeProgramme.filter((type) => type.id === idTypeKCT).map((item, index) => {
                            return (
                                <div>
                                    <h3 className="section-title section-title-center" 
                                        style={{justifyContent: 'center', textTransform: 'uppercase', color: 'green', marginTop: 12, fontWeight: 700}}
                                    >
                                        {item.name}
                                    </h3>
                                    <div key={index} className="main-section" id={item.idElement}>
                                        <div className="header-section">
                                            <h3 className="section-title section-title-center" style={{marginBottom: 0}}>
                                                <span className="section-title-main">{item.name}</span>
                                            </h3>
                                            <Link style={{borderRadius: 8, margin: '12px 15px'}} className="ant-btn ant-btn-default ant-btn-lg"
                                                to={`/luyen-tap/chuong-trinh/${khoa_hoc_id}`}
                                            >
                                                Xem tất cả >
                                            </Link>
                                        </div>
                                        {programmes.data.length > 0 && <CardSlider courses={courses.data.filter(course => course.loai_kct === item.id)} id={index }/>}
                                    </div>
                                </div>
                            )
                        })
                    } */}
                </div>
            </div>
        )
    };

    return (
        <Layout className="main-app">
            <Helmet>
                <title>Danh sách khóa học</title>
            </Helmet>
            <Content className="app-content ">
                {renderCourses()}
                <FooterBusiness course={true}/>
            </Content>
        </Layout>
    )
}

export default BusinessTypeProgramePage;