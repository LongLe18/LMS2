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
import { BookOutlined, BarsOutlined, } from '@ant-design/icons';
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
    
    const dataSource2 = [
        {
            key: '1',
            content: `Động học, Động lực học, Công, Năng lượng và công suất, Động lượng, Chuyển động tròn, Biến dạng của vật rắn, Dao động, Sóng, Điện, Từ, Vật lý nhiệt, Hạt nhân và phóng xạ, Thí nghiệm/thực hành...`,
            field: `Vật lý`,
        },
        {
            key: '2',
            content: `Bảng tuần hoàn các nguyên tố hóa học, Liên kết hóa học, Năng lượng hóa học, Động hóa học, Điện hóa học, Hóa học vô cơ và các nguyên tố, Đại cương kim loại, Phức chất hóa học, Các dãy hidrocacbon, Dẫn xuất halogen - alcohol - phenol, Các hợp chất carnonyl, Chất béo (ester - lipid), Carbohydrate, Hợp chất chứa dị tố nitơ, lưu huỳnh, Hợp chất polymer, Thí nghiệm/thực hành...`,
            field: `Hóa học`,
        },
        {
            key: '3',
            content: `Các cấp độ tổ chức của thế giới sống, Sinh học tế bào, Vi sinh vật và virus, Sinh học cơ thể, Di truyền học, Tiến hóa, Sinh thái học và môi trường, Sinh học phân tử, Kiểm soát sinh học, Thí nghiệm/thực hành...`,
            field: `Sinh học`,
        },
        {
            key: '4',
            content: `Lịch sử thế giới cận đại và hiện đại, Lịch sử Đông Nam Á, Lịch sử Việt Nam cận - hiện đại, Lịch sử Việt Nam và một số chuyên đề danh nhân lịch sử, quá trình hội nhập quốc tế của Việt Nam...`,
            field: `Lịch sử`,
        },
        {
            key: '5',
            content: `Địa lý đại cương, Địa lý kinh tế - xã hội thế giới, Địa lý Việt Nam (tự nhiên, dân cư, chuyển dịch cơ cấu kinh tế, các ngành kinh tế, các vùng kinh tế) và một số chuyên đề thiên tai và các biện pháp phòng chống, phát triển làng nghề...`,
            field: `Địa lý`,
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

    const columns2 = [
        {
          title: 'Lĩnh vực',
          dataIndex: 'field',
          key: 'field',
        },
        {
          title: 'Nội dung',
          dataIndex: 'content',
          key: 'content',
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
        return (
            <div className="list-course-cate">        
                <div className="wraper wraper-list-course-cate-index" style={{maxWidth: 1600}}>
                    
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

                    <Row>
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
                                        <h5 style={{marginTop: 8, fontWeight: 500}}>CẤU TRÚC BÀI THI</h5>
                                        <Table className='table-structure' style={{ whiteSpace: 'pre', textAlign: 'left', fontSize: 20}} dataSource={dataSource} columns={columns} pagination={false}/>;
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
                                            <span style={{fontWeight: 700}}>Phần 3 (tự chọn):</span> Khoa học thiết kế thời gian là 60 phút gồm 50 câu hỏi trắc nghiệm và điền đáp án. Thí sinh lựa chọn 3 trong 5 chủ đề thuộc lĩnh vực:
                                        </div>
                                        <Table className='table-structure' dataSource={dataSource2} columns={columns2} pagination={false}/>
                                        <div style={{fontSize: 20, marginTop: 6}}>
                                            <span>Đề thi tham khảo của bài thi Đánh giá năng lực năm 2025 dự kiến công bố trong tháng 8 năm 2024.</span>
                                        </div>
                                        <span></span>
                                        <div style={{textAlign: 'center'}}>
                                            <img style={{marginTop: 12}} src={require('assets/img/cau-truc-de-thi-dgnl-ha-noi-2025-2.png').default} alt='banner1'/>
                                        </div>
                                        <h5 style={{marginTop: 8, fontWeight: 500}}>GHI CHÚ:</h5>
                                        <div style={{fontSize: 20}}>
                                            Đây là đề thi mô phỏng được hsaphus.edu.vn xây dựng dựa trên thông tin mới nhất ĐHQG vừa công bố.
                                        </div>
                                        <div style={{fontSize: 20}}>
                                            Đề thi đầy đủ theo đúng cấu trúc về số lượng môn, số lượng câu hỏi, định dạng.
                                        </div>
                                    </div>
                                    <div style={{textAlign: 'center', marginTop: 12}}>
                                        <Button type="primary" size="large" className="join-exam-button" 
                                            onClick={() => setIsJoinExam(1)}
                                            style={{borderRadius: 8, backgroundColor: 'rgb(229 100 19 / 92%)', borderColor: 'rgb(229 100 19 / 92%)'}}
                                        >
                                            Tham gia thi
                                        </Button>
                                    </div>
                                </>
                            }
                        </Col>
                        <Col xl={6} style={{padding: "0", textAlign: 'center'}}>
                            <SideBarComponent/>
                            <Button type="primary" size="large" className="join-exam-button" 
                                onClick={() => setIsJoinExam(1)}
                                style={{borderRadius: 8, backgroundColor: 'rgb(229 100 19 / 92%)', borderColor: 'rgb(229 100 19 / 92%)', marginTop: 12}}
                            >
                                Tham gia thi
                            </Button>
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
                    <h5 className="textCenter">Đề trải nghiệm Đánh giá năng lực Hà Nội</h5>
                    <h6 className="textCenter" style={{color: '#747474'}}>Để các em có thể làm bài trải nghiệm và định hình được kiểu ra đề.</h6>
                    <h6 className="textCenter" style={{fontWeight: 700, marginTop: 12}}>Bài thi gồm có</h6>
                    <Steps style={{alignItems: 'center'}}
                        progressDot
                        current={2}
                        direction="vertical"
                        items={[
                            {
                                title: 'Toán học và xử lý số liệu (50 câu)',
                            },
                            {
                                title: 'Văn học - Ngôn ngữ (50 câu)',
                            },
                            {
                                title: type === 5 ? 'Tự chọn (50 câu) : Tiếng Anh' : 'Tự chọn (50 câu) : Khoa học',
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
                        <Button type="primary" size="large" className="join-exam-button" style={{borderRadius: 8, backgroundColor: 'rgba(0, 115, 8, 0.92)', borderColor: 'rgba(0, 115, 8, 0.92)'}}
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
                            Làm bài thi
                        </Button>
                    </p>
                </div>
            </Spin>
        )
    }

    const renderConfirmExam = (id) => {
        return (
            <div className="wraper wraper-list-course-cate-index" style={{maxWidth: 1600}}>
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
                    <span style={{fontWeight: 600, fontSize: 18, color: 'green'}}>Hướng dẫn làm bài</span>
                    <div style={{fontSize: 16, textAlign: 'justify'}}>
                        Bài thi ĐGNL học sinh THPT (HSA) gồm 03 phần. Các câu hỏi thi được đánh số lằn lượt từ 1 đến 150 gồm câu hỏi trắc nghiệm khách quan bốn lựa chọn từ các phương án
                        A, B, C hoặc D và câu hỏi điền đáp án. Trường hợp bài thi có thêm câu hỏi thử nghiệm (không tính điểm) thì tỗng số câu hỏi không quá 153 câu. Mỗi câu hỏi trắc nghiệm có một đáp án duy nhất. Thí sinh chọn đáp án bằng cách <span style={{color: 'red'}}>nhấp chuột trái máy tính</span> vào ô đáp án (o), máy tính sẽ tự đông ghi nhận và hiển thị thành ô tròn màu xanh (•). 
                        Trường hợp bạn chọn câu trả lời lằn thứ nhất và muốn chọn lại câu trả lời thì đưa con trỏ chuột máy tính đến đáp án mới và nhấp chuột trái. Ô tròn màu xanh mới (•) sẽ được ghi nhận và ô tròn cũ sẽ trở lại trạng thái ban đầu (o), <span style={{color: 'red'}}>KHÔNG nhấp chuột máy tính quá 2.000 lượt</span> trong suốt quá trình làm bài thi. Thí sinh có thễ bắm chuột vào <span style={{color: 'red'}}>biểu tượng CHK</span> ở góc trên bên phải màn hình đễ kiểm tra ghi nhận của các câu hỏi đã trả lời. Thí sinh được quay lại làm lại câu hỏi trong cùng 1 phần, không thê quay lại
                        làm câu hỏi của phần thi <span style={{color: 'red'}}>đã kết thúc.</span>
                        <br/>
                        Đối với các <span style={{color: 'red'}}>câu hỏi điền đáp án</span>, thí sinh nhập <span style={{color: 'red'}}>đáp án vào ô trống dạng số nguyên dương, nguyên âm</span> (không có dấu cách giữa dấu - và chữ số, ví dụ đúng: -3) <span style={{color: 'red'}}>hoặc phân số tối giản</span> (ví dụ: 3/4), <span style={{color: 'red'}}>không nhập chữ số thập phân, không nhập đơn vị vào ô đáp án</span>. Mỗi câu trả lời đúng được 01 điểm, câu trả lời sai hoặc không trả lời được 0 điểm. <span style={{color: 'red'}}>Hãy thận trọng trước khi lựa chọn đáp án.</span>
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
                        <Button type="primary" size="large" className="join-exam-button" style={{borderRadius: 8, backgroundColor: 'rgba(0, 115, 8, 0.92)', borderColor: 'rgba(0, 115, 8, 0.92)'}}
                            onClick={() => {
                                const data = {
                                    "khoa_hoc_id": hashids.decode(idCourse)[0],
                                    "chuyen_nganh_ids": type === 5 ? type : subjects.join(', ')
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