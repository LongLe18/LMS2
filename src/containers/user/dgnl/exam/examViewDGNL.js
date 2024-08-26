import React, { useEffect, useState } from "react";
import { Helmet } from 'react-helmet';
import { useParams, useHistory, Link } from 'react-router-dom';
import axios from 'axios';
import Hashids from "hashids";
import './css/exam.css';
import config from '../../../../configs/index';

// component
import { Layout, Row, Col, Carousel, Table, Steps, Radio, 
    Checkbox, Button, notification, Spin, Menu, Avatar } from 'antd';
import Statisic from "components/parts/statisic/Statisic";
import CarouselCustom from 'components/parts/Carousel/Carousel';
import { BookOutlined, BarsOutlined, QuestionCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import SideBarComponent from "../mainpractice/sidebar/SideBar";

// redux
import { useSelector, useDispatch } from 'react-redux';
import * as courseActions from '../../../../redux/actions/course';
import * as majorActions from '../../../../redux/actions/major';
import * as programmeAction from '../../../../redux/actions/programme';

const { Content } = Layout;

const ExamViewDGNL = (props) => {
    const idCourse = useParams().idCourse;
    const dispatch = useDispatch();
    const history = useHistory();
    const hashids = new Hashids();

    const [type, setType] = useState(1);
    const [subjects, setSubjects] = useState([]);
    const [spinning, setSpinning] = useState(false);
    // isJoinExam: 0 - chưa tham gia, 1 - tham gia thi, 2 - đã chọn môn thi
    const [isJoinExam, setIsJoinExam] = useState(0);
    
    const dataSource = [
        {
          key: '1',
          content: `Phần 1: Toán học và xử lý số liệu (Định lượng)\n- Thời gian: 75 phút - 50 câu\n- Toán học\n- Xử lý số liệu`,
            note: `- 35 câu hỏi trắc nghiệm bốn lựa chọn, 15 câu hỏi điền đáp án\n- Phần thi bắt buộc, thí sinh làm tất cả các câu hỏi trong phần này`,
        },
        {
          key: '2',
          content: `Phần 2: Văn học - Ngôn ngữ (Định tính)\n- Thời gian: 60 phút - 50 câu\n- Văn học\n- Ngôn ngữ`,
            note: `- Gồm 50 câu hỏi trắc nghiệm\n- Phần thi bắt buộc, thí sinh làm tất cả các câu hỏi trong phần này`,
        },
        {
            key: '3',
            content: `Phần 3: Khoa học\n- Thời gian: 60 phút - 50 câu`,
              note: `Phần tự chọn, thí sinh lựa chọn các câu hỏi thuộc 3 trong 5 chủ đề (môn học)`,
        },
    ];

    const columns = [
        {
          title: 'Nội dung',
          dataIndex: 'content',
          key: 'content',
        },
        {
          title: 'Ghi chú',
          dataIndex: 'note',
          key: 'note',
        },
    ];

    const course = useSelector(state => state.course.item.result);
    const majors = useSelector(state => state.major.list.result);
    const programmeCourses = useSelector(state => state.programme.courses.result);

    // sự kiên đổi loại thi phần 3
    const onChangeType = (e) => {
        setType(e.target.value);
    };

    const onChangeSubject = (checkedValues) => {
        /// prevent checked to checkbox
        if (checkedValues.length > 3) {
            checkedValues.shift();
        }
        setSubjects(checkedValues);
    };

    useEffect(() => {
        dispatch(majorActions.getMajors());
        dispatch(courseActions.getCourse({ id: hashids.decode(idCourse) }));
        dispatch(programmeAction.getProgrammeCourses());
        
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        programmeCourses?.data.forEach((item, index) => {
            let children = [];
            if (item.khoa_hocs && item.khoa_hocs.length > 0) {
                item.khoa_hocs.forEach((item2, index2) => {
                    
                    children.push(getItem(item2.ten_khoa_hoc, <BookOutlined />, item2.khoa_hoc_id, null, 'item'));
                });
            }
            items.push(getItem(item.ten_khung_ct, <BookOutlined />, item.kct_id, children, 'item'));
        });
    }

    const renderPages = () => {
        document.getElementById("main-content")?.scrollIntoView({
            behavior: "smooth"
        })
        
        return (
            <div className="list-course-cate">        
                <div className="wraper wraper-list-course-cate-index" >
                    
                    <Row gutter={16} style={{margin: '18px 0'}}>
                        <Col xl={5} md={4} xs={4} style={{paddingLeft: 0}}>
                            {(programmeCourses.status === 'success' && items.length > 0) &&
                                <Menu style={{borderRadius: 6}}
                                    mode="vertical"
                                    theme="light"
                                    defaultSelectedKeys={['1']}
                                >
                                    <Menu.Item style={{background: '#3da844', marginTop: 0, borderTopRightRadius: 6, borderTopLeftRadius: 6}}
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

                    <Row id="main-content">
                        <Col xl={18} md={24} xs={24}>
                            <Row style={{margin: '18px 0'}}>
                                <Col xl={24} md={20} xs={20}>
                                    <Carousel autoplay style={{marginBottom: 12}}>
                                        <img src={require('assets/img/seo-exam-dgnl.png').default} alt='banner1'/>
                                    </Carousel>
                                </Col>
                            </Row>
                            {course.status === 'success' &&
                                <>
                                    <div className="header-exam">
                                        <h1 style={{color: '#000'}}>THI THỬ ĐÁNH GIÁ NĂNG LỰC ĐẠI HỌC QUỐC GIA {course.data.ten_khoa_hoc}</h1>
                                    </div>
                                    <div>
                                        <h5 className="text-black" style={{fontWeight: 500}}>MỤC ĐÍCH BÀI THI TRẢI NGHIỆM</h5>
                                        <span style={{fontSize: 20, fontWeight: 500}}>Giúp thí sinh làm quen với định dạng bài thi Đánh giá năng lực, trải nghiệm ngân hàng câu hỏi phong phú, sẵn sàng kiến thức và tâm lý cho kỳ thi chính thức.</span>
                                        <h5 style={{marginTop: 8, fontWeight: 500, color: 'green'}}>CẤU TRÚC BÀI THI</h5>
                                        <Table className='table-structure' style={{ whiteSpace: 'break-spaces', textAlign: 'left', fontSize: 20}} dataSource={dataSource} columns={columns} pagination={false}/>;
                                        <h5 yle={{fontWeight: 500}}>CHI TIẾT CẤU TRÚC:</h5>
                                        <div style={{fontSize: 20}}>
                                            Về hình thức, bài thi ĐGNL năm 2025 điều chỉnh chủ yếu ở phần 3 và cách đặt câu hỏi. Sau khi hoàn thành hai phần thi đầu, phần thi thứ 3 thí sinh sẽ được lựa chọn 3 trong 5 chủ đề thuộc lĩnh vực Lý, Hóa, Sinh, Sử, Địa để hoàn thành bài thi trong thời gian 195 phút (không kể thời gian bù thêm cho câu hỏi thử nghiệm).
                                        </div>
                                        <div style={{fontSize: 20, marginTop: 6}}>
                                            Riêng phần lựa chọn liên quan đến Ngoại ngữ sẽ được xây dựng thành một hợp phần riêng thay thế phần Khoa học để đánh giá năng lực chuyên biệt.
                                        </div>
                                        <div style={{fontSize: 20, marginTop: 6}}>
                                            Về câu hỏi, mỗi chủ đề thi sẽ xuất hiện câu hỏi chùm, trong một ngữ cảnh dữ liệu đầu bài sẽ hỏi kèm 1- 3 câu hỏi khác nhau để đánh giá năng lực tổng hợp của thí sinh. Câu hỏi chùm có thể là chủ đề mới với ngữ liệu cho trước đòi hỏi thí sinh phải nhận định, phân tích và đưa ra phương án giải quyết vấn đề đã cho.
                                        </div>

                                        <div style={{textAlign: 'center'}}>
                                            <img style={{marginTop: 12}} src={require('assets/img/cau-truc-de-thi-dgnl.png').default} alt='banner1'/>
                                        </div>

                                        <div style={{fontSize: 20}}>
                                            <span style={{fontWeight: 700}}>Phần 1 (bắt buộc):</span> Toán học và Xử lý số liệu được làm bài trong 75 phút gồm 50 câu hỏi (35 câu hỏi trắc nghiệm bốn lựa chọn, 15 câu hỏi điền đáp án) thuộc lĩnh vực đại số và một số yếu tố giải tích, hình học và đo lường, thống kê và xác suất.
                                        </div>
                                        <div style={{fontSize: 20, marginTop: 6}}>
                                            <span style={{fontWeight: 700}}>Phần 2 (bắt buộc):</span> Ngôn ngữ - Văn học được hoàn thành trong 60 phút gồm 50 câu hỏi trắc nghiệm sử dụng ngữ liệu liên quan đến nhiều lĩnh vực trong đời sống như văn học, ngôn ngữ (từ vựng, ngữ pháp, hoạt động giao tiếp, sự phát triển của ngôn ngữ và các biến thể ngôn ngữ, hành văn), văn hóa, xã hội, lịch sử, địa lý, nghệ thuật, v.v… Ngữ liệu được lựa chọn trong hoặc ngoài chương trình giáo dục phổ thông.
                                        </div>
                                        <div style={{fontSize: 20, marginTop: 6}}>
                                            <span style={{fontWeight: 700}}>Phần 3 (tự chọn):</span> Khoa học thiết kế thời gian là 60 phút gồm 50 câu hỏi trắc nghiệm và điền đáp án. Thí sinh lựa chọn 3 trong 5 chủ đề thuộc lĩnh vực: Hóa học, Sinh học, Vật lý, Địa lý, Lịch sử
                                        </div>
                                        
                                    </div>
                                    <div style={{textAlign: 'center', marginTop: 12, height: 50}}>
                                        <Button type="primary" size="large" className="join-exam-button" 
                                            onClick={() => setIsJoinExam(1)}
                                            style={{borderRadius: 8, backgroundColor: 'rgb(229 100 19 / 92%)', borderColor: 'rgb(229 100 19 / 92%)', width: '20%'}}
                                        >
                                            Tham gia thi
                                        </Button>
                                    </div>
                                </>
                            }
                        </Col>
                        <Col xl={6} style={{padding: "0", textAlign: 'center'}}>
                            <Button type="primary" size="large" className="join-exam-button" 
                                onClick={() => setIsJoinExam(1)}
                                style={{borderRadius: 8, backgroundColor: 'rgb(229 100 19 / 92%)', borderColor: 'rgb(229 100 19 / 92%)', marginBottom: 12, width: '80%', fontWeight: 700}}
                            >
                                Tham gia thi thử ngay
                            </Button>
                            <SideBarComponent/>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    };

    const formSubject = () => {
        // Form chọn các môn thi 
        return (
            <Spin spinning={spinning}  tip="Đang xử lý tạo đề thi. Quá trình này sẽ mất thời gian, bạn xin vui lòng chờ">
                <div className="form-exam" style={{fontSize: 20}}>
                    <div className="title-main">
                        <div style={{color: '#F5F5F5'}}>testtesttesttesttesttesttesttesttest</div>
                        <h5 className="textCenter" style={{textTransform: 'uppercase', color: 'rgb(169, 0, 0) !important'}}>Chào mừng bạn tham gia kỳ thi ĐGNL ĐHQGHN (HSA)</h5>
                        <img alt="hsa" src={require('assets/img/logo/logo-hsa.png').default} style={{width: '15%'}}/>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'center'}}>
                        <div className="description-title">
                            <span className="textCenter" style={{marginRight: 12}}><QuestionCircleOutlined /> Bài thi gồm 150 câu</span>
                            <span><ClockCircleOutlined /> 195 phút</span>
                        </div>
                    </div>
                    <h6 style={{margin: '24px 0px 12px 0px', color: 'rgb(24, 98, 24)', fontWeight: 700}}>Cấu trúc bài thi</h6>
                    <Steps style={{alignItems: 'center'}}
                        progressDot
                        current={2}
                        direction="vertical"
                        items={[
                            {
                                title: 'Phần 1: Tư duy định lượng (Toán học và xử lý số liệu) - 75 phút',
                            },
                            {
                                title: 'Phần 2: Tư duy định tính (Văn học - Ngôn ngữ) - 60 phút',
                            },
                            {
                                title: type === 5 ? 'Phần 3: Tiếng Anh - 60 phút' : 'Phần 3: Khoa học - 60 phút',
                            },
                        ]}
                    />
                    <Radio.Group onChange={onChangeType} value={type}>
                        <Radio value={1}>Khoa học</Radio>
                        <Radio value={5}>Tiếng Anh</Radio>
                    </Radio.Group>
                    {type === 1 && 
                        <>
                            <h6 style={{marginTop: 12}}>Bạn hãy chọn 3 môn phía dưới:</h6>
                        
                            <Checkbox.Group style={{ width: '100%', display: 'flex', justifyContent: 'center' }} onChange={onChangeSubject} value={subjects}>
                                <Row style={{width: '10%', textAlign: 'left'}}>
                                    {majors.status === 'success' && 
                                        majors.data.map((major) => {

                                            if (major.chuyen_nganh_id !== 1 && major.chuyen_nganh_id !== 7 && major.chuyen_nganh_id !== 5) {
                                                return (
                                                    <Col span={24}>
                                                        <Checkbox value={major.chuyen_nganh_id} checked={true}>{major.ten_chuyen_nganh}</Checkbox>
                                                    </Col>
                                                )
                                            }
                                            return null;
                                        })
                                    }
                                </Row>
                            </Checkbox.Group>
                        </>
                    }

                    <p className="block-action text-center mt-4">
                        <Button type="primary" size="large" className="join-exam-button" 
                            style={{borderRadius: 8, backgroundColor: 'rgb(229 100 19 / 92%)', borderColor: 'rgb(229 100 19 / 92%)', width: '10%'}}
                            onClick={() => {
                                // Nếu không chọn Tiếng Anh thì phải Chọn đủ 3 môn học
                                if (type !== 5 && subjects.length < 3) {
                                    notification.error({
                                        message: 'Thông báo',
                                        description: 'Vui lòng chọn đủ 3 môn học mà bạn muốn thi'
                                    });
                                    return;
                                }
                                setIsJoinExam(2);
                            }}
                        >
                            Bắt đầu
                        </Button>
                    </p>
                </div>
            </Spin>
        )
    }

    const renderConfirmExam = (id) => {
        return (
            <div className="wraper wraper-list-course-cate-index">
                <Row className="logo" align={'middle'} style={{marginTop: 12}}>
                    <Col xs={{ span: 24 }} lg={{ span: 4 }}>
                        <div className="logo">
                            <Avatar shape="square" size={130} src={require('assets/img/logo/vnu-cet-logo.png').default} />
                        </div>
                    </Col>
                    <Col xs={{ span: 22, offset: 1 }} lg={{ span: 16, }} style={{textAlign: 'center'}}>
                        <h4 style={{color: "red", fontWeight: 500, fontSize: 30}}>Chào mừng bạn tham gia kỳ thi thử ĐGNL ĐHQGHN (HSA)</h4>
                        <h4 style={{fontWeight: 500}}>Kỳ thi đánh giá năng lực học sinh THPT</h4>
                    </Col>
                </Row>
                <div className="content-page">
                    <span style={{fontWeight: 600, fontSize: 20, color: 'green'}}>Hướng dẫn làm bài</span>
                    <div style={{fontSize: 20, textAlign: 'justify'}}>
                        Bài thi ĐGNL học sinh THPT (HSA) gồm 03 phần. Các câu hỏi thi được đánh số lằn lượt từ 1 đến 150 gồm câu hỏi trắc nghiệm khách quan bốn lựa chọn từ các phương án
                        A, B, C hoặc D và câu hỏi điền đáp án. Trường hợp bài thi có thêm câu hỏi thử nghiệm (không tính điểm) thì tỗng số câu hỏi không quá 153 câu. Mỗi câu hỏi trắc nghiệm có một đáp án duy nhất. Thí sinh chọn đáp án bằng cách <span style={{color: 'red'}}>nhấp chuột trái máy tính</span> vào ô đáp án (o), máy tính sẽ tự đông ghi nhận và hiển thị thành ô tròn màu xanh (•). 
                        Trường hợp bạn chọn câu trả lời lằn thứ nhất và muốn chọn lại câu trả lời thì đưa con trỏ chuột máy tính đến đáp án mới và nhấp chuột trái. Ô tròn màu xanh mới (•) sẽ được ghi nhận và ô tròn cũ sẽ trở lại trạng thái ban đầu (o), <span style={{color: 'red'}}>KHÔNG nhấp chuột máy tính quá 2.000 lượt</span> trong suốt quá trình làm bài thi. Thí sinh có thễ bắm chuột vào <span style={{color: 'red'}}>biểu tượng CHK</span> ở góc trên bên phải màn hình đễ kiểm tra ghi nhận của các câu hỏi đã trả lời. Thí sinh được quay lại làm lại câu hỏi trong cùng 1 phần, không thê quay lại
                        làm câu hỏi của phần thi <span style={{color: 'red'}}>đã kết thúc.</span>
                        <br/>
                        <span style={{background: 'yellow'}}>Đối với các <span style={{color: 'red'}}>câu hỏi điền đáp án</span>, thí sinh nhập <span style={{color: 'red'}}>đáp án vào ô trống dạng số nguyên dương, nguyên âm</span> (không có dấu cách giữa dấu - và chữ số, ví dụ đúng: -3) <span style={{color: 'red'}}>hoặc phân số tối giản</span> (ví dụ: 3/4), <span style={{color: 'red'}}>không nhập chữ số thập phân, không nhập đơn vị vào ô đáp án</span>. Mỗi câu trả lời đúng được 01 điểm, câu trả lời sai hoặc không trả lời được 0 điểm. <span style={{color: 'red'}}>Hãy thận trọng trước khi lựa chọn đáp án.</span></span>
                        <br/>
                        <br/>
                        Theo điều 6, khoản 2 của Quy chế thi, bài thi ĐGNL là <span style={{color: 'red'}}>KHÔNG PHÚC KHẢO</span> nên thí sinh bình tĩnh <span style={{color: 'red'}}>đọc kỹ câu hỏi thi, KIẾM TRA cần thận điểm từng phản và ĐIỂM TỔNG bài thi</span> sau khi nộp bài. Nếu có bất kỳ ý kiến thắc mắc về câu hỏi thi, điểm bài thi, công tác tố chức thi... phải thực hiện tại phòng thi bằng cách thông báo cho cán bộ coi thi/Hội đồng thi trước khi ra khỏi phòng thi. Các kiến nghị, thắc mắc của thí sinh sau khi đã <span style={{color: 'red'}}>rời khỏi phòng thi sẽ KHÔNG ĐƯỢC xem xét giải quyết.</span>
                        <br/>
                        <br/>
                        <span style={{fontWeight: 600, fontSize: 18, color: 'green'}}>Cam kết thỏa thuận:</span>
                        <br/>
                        Câu hỏi thi ĐGNL/đề thi là tài sản của Trung tâm Khảo thí ĐHQGHN. Thí sinh tham dự kỳ thi ĐGNL có trách nhiệm bảo quản câu hỏi thi ĐGNL/ đề thi; KHÔNG được phép sao chép một phản hay toàn bộ câu hỏi thi ĐGNL (dạng chữ viết, hình ảnh, âm thanh, video/clip...) 
                        chuyễn cho người khác dưới mọi hình thức trong quá trình làm bài thi và cả khi đã kết thúc ca thi, 
                        KHÔNG được phép mang các tài liệu/tài sản của Trung tâm Khảo thí ra khỏi phòng thi/khu vực thi. 
                        Thí sinh <span style={{color: 'red'}}>KHÔNG được phép tiết lộ, chia sẻ một phản hay toàn bộ dữ kiện của đẻ thi/câu hỏi thi ĐGNL</span> 
                        (dạng hình ảnh,âm thanh, video/clip, chữ viết...) với cá nhân, tỗ chứ khác, trên các phương tiện đại chúng khi chưa có sự đồng ý của Trung tâm Khảo thí ĐHQGHN sau kỳ thi. 
                        Thí sinh vi phạm <span style={{color: 'red'}}>sẽ bị đình chỉ thi, hủy tất cả các kết quả điểm bài thi ĐGNL; dừng và hủy toàn bộ đăng ký (nếu có)</span>. 
                        Trung tâm Khảo thí ĐHQGHN sẽ <span style={{color: 'red'}}>thông báo thí sinh bị đình chỉ thi tới Trường THPT, Sở Giáo dục & Đào tạo, các trường đại học....</span>
                        <br/>
                        <br/>
                        <span style={{fontWeight: 600, fontSize: 18, color: 'green'}}>Trách nhiệm của thí sinh:</span>
                        <br/>
                        Tự chịu trách nhiệm về những vật dụng được phép mang vào phòng thi. Kiểm tra chính xác thông tin cá nhân hiến thị trên màn hình sau đăng nhập.
                        <br/>
                        KHÔNG tự ý đăng nhập, tự ý thoát khỏi chương trình thi, tự ý thoát ra khỏi tài khoản thi trong suốt quá trình làm bài thi, KHÔNG được khởi động lại màn hình, máy tính, đường truyền bằng bắt cứ hình thức nào; 
                        KHÔNG được tắt máy tính khi chưa được CBCT cho phép, 
                        KHÔNG sử dụng bắt cứ một chương trình nào cài đặt trên máy tính trong thời gian thi; 
                        KHÔNG được rời phòng thi trong suốt thời gian làm bài thi.
                        <br/>
                        Nộp lại tất cả các tờ giấy nháp thi (đã sử dụng, chưa sử dụng), nộp lại Phiếu tài khoản cho CBCT và kiểm tra CCCD trước khi rời phòng thi.

                    </div>
                    <p className="block-action text-center mt-4">
                        <Button type="primary" size="large" className="join-exam-button" 
                            style={{borderRadius: 8, backgroundColor: 'rgb(229 100 19 / 92%)', borderColor: 'rgb(229 100 19 / 92%)', width: '10%'}}
                            onClick={() => {
                                const data = {
                                    "khoa_hoc_id": hashids.decode(idCourse)[0],
                                    "chuyen_nganh_ids": type === 5 ? type.toString() : subjects.join(', ')
                                };
                                localStorage.setItem('mon_thi', subjects.join(', '));
                                // Tạo đề thi
                                setSpinning(true); // chờ
                                axios({
                                    method: 'post', 
                                    url: config.API_URL + `/student_exam/dgnl/create`, 
                                    timeout: 1000 * 60 * 5,
                                    data,
                                    headers: {Authorization: `Bearer ${localStorage.getItem('userToken')}`,}
                                })
                                    .then(
                                        res => {
                                            if (res.statusText === 'OK' && res.status === 200) {
                                                setSpinning(false);
                                                // điều hướng vào bài thi
                                                history.push(`/luyen-tap/xem/${hashids.encode(res.data.data.de_thi_id)}/${idCourse}`);
                                            } else {
                                                notification.error({
                                                    message: 'Thông báo',
                                                    description: 'Tạo đề thi thất bại. Bạn xin vui lòng thử lại sau ít phút...',
                                                })
                                            }
                                        }
                                    )
                                    .catch(error => notification.error({ message: error.response.data.message }));
                            }}
                        >
                            Đồng ý
                        </Button>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <>
            <Layout className="main-app-dgnl">
                <Helmet>
                    <title>Thi thử đánh giá năng lực</title>
                </Helmet>
                <Content className="app-content ">
                    {isJoinExam === 1 ? formSubject() : isJoinExam === 0 ? renderPages() : renderConfirmExam()}
                </Content>
            </Layout>
        </>
    )
}

export default ExamViewDGNL;