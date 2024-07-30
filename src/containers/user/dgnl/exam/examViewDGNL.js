import React, { useEffect, useState } from "react";
import { Helmet } from 'react-helmet';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import Hashids from "hashids";
import './css/exam.css';
import config from '../../../../configs/index';

// component
import { Layout, Row, Col, Carousel, Table, Steps, Radio, Checkbox, Button, notification, Spin } from 'antd';
import Statisic from "components/parts/statisic/Statisic";

// redux
import { useSelector, useDispatch } from 'react-redux';
import * as courseActions from '../../../../redux/actions/course';
import * as majorActions from '../../../../redux/actions/major';

const { Content } = Layout;

const ExamViewDGNL = (props) => {
    const idCourse = useParams().idCourse;
    const dispatch = useDispatch();
    const history = useHistory();
    const hashids = new Hashids();

    const [type, setType] = useState(1);
    const [subjects, setSubjects] = useState([]);
    const [spinning, setSpinning] = useState(false);

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
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const renderPages = () => {
        return (
            <>      
                <Spin spinning={spinning}  tip="Đang xử lý tạo đề thi. Quá trình này sẽ mất thời gian, bạn xin vui lòng chờ">
                    <div className="list-course-cate">        
                        <div className="wraper wraper-list-course-cate-index">
                            <Row style={{margin: '18px 0'}}>
                                <Col xl={24} md={20} xs={20}>
                                    <Carousel autoplay style={{marginBottom: 12}}>
                                        <img src={require('assets/img/seo-exam-dgnl.png').default} alt='banner1'/>
                                    </Carousel>
                                </Col>
                            </Row>
                            <Statisic />

                            {course.status === 'success' &&
                                <>
                                    <div className="header-exam">
                                        <h1>THI THỬ ĐÁNH GIÁ NĂNG LỰC ĐẠI HỌC QUỐC GIA {course.data.ten_khoa_hoc}</h1>
                                    </div>
                                    <div>
                                        <h5><b>MỤC ĐÍCH BÀI THI TRẢI NGHIỆM</b></h5>
                                        <span style={{fontSize: 20, fontWeight: 500}}>Giúp thí sinh làm quen với định dạng bài thi Đánh giá năng lực, trải nghiệm ngân hàng câu hỏi phong phú, sẵn sàng kiến thức và tâm lý cho kỳ thi chính thức.</span>
                                        <h5 style={{marginTop: 8}}><b>CẤU TRÚC BÀI THI</b></h5>
                                        <Table className='table-structure' style={{ whiteSpace: 'pre', textAlign: 'left', fontSize: 20}} dataSource={dataSource} columns={columns} pagination={false}/>;
                                        <h5><b>CHI TIẾT CẤU TRÚC:</b></h5>
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
                                        <Table dataSource={dataSource2} columns={columns2} pagination={false}/>
                                        <h5 style={{marginTop: 8}}><b>GHI CHÚ:</b></h5>
                                        <div style={{fontSize: 20}}>
                                            Đây là đề thi mô phỏng được hsaphus.edu.vn xây dựng dựa trên thông tin mới nhất ĐHQG vừa công bố.
                                        </div>
                                        <div style={{fontSize: 20}}>
                                            Đề thi đầy đủ theo đúng cấu trúc về số lượng môn, số lượng câu hỏi, định dạng.
                                        </div>
                                    </div>
                                    {/* Form chọn các môn thi */}
                                    <div className="form-exam">
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
                                                    title: 'Tự chọn (50 câu) : Khoa học',
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
                                                    const data = {
                                                        "khoa_hoc_id": hashids.decode(idCourse)[0],
                                                        "chuyen_nganh_ids": type === 5 ? type : subjects.join(', ')
                                                    };

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
                                                        .catch(error => notification.error({ message: error.message }));
                                                }}
                                            >
                                                Làm bài thi
                                            </Button>
                                        </p>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </Spin>
            </>
        )
    };

    return (
        <>
            <Layout className="main-app-dgnl">
                <Helmet>
                    <title>Thi thử đánh giá năng lực</title>
                </Helmet>
                <Content className="app-content ">
                    {renderPages()}
                </Content>
            </Layout>
        </>
    )
}

export default ExamViewDGNL;