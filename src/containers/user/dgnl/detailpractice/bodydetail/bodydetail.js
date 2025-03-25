import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { get } from 'lodash';
import { useHistory } from 'react-router-dom';
import './body.css'
// helper
import axios from "axios";
import Hashids from "hashids";
import config from '../../../../../configs/index';

import * as thematicActions from '../../../../../redux/actions/thematic';
import * as lessonActions from '../../../../../redux/actions/lesson';
import * as examActions from '../../../../../redux/actions/exam';
import LoadingCustom from 'components/parts/loading/Loading';

// component
import ContentDetailPage from "../contentdetail/contentdetail";
import { notification, Collapse, Modal, Form, Input, Button, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, EyeTwoTone, EyeInvisibleOutlined, PushpinOutlined } from '@ant-design/icons';
import ReCAPTCHA from "react-google-recaptcha";
import SocialLogin from 'components/common/SocialLogin';
// other
import jwt_decode from 'jwt-decode';

// redux
import * as userActions from '../../../../../redux/actions/user';

const { Panel } = Collapse;

const BodyDetailPage = (props) => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const history = useHistory();
    const hashids = new Hashids();
    const captchaRef = useRef(null);

    const [idThematic, setidThematic] = useState(0);
    const [existCourse, setExistCourse] = useState(false);
    const [visible, setVisible] = useState(false);
    const userToken = localStorage.getItem('userToken');

    const thematics = useSelector(state => state.thematic.listbyId.result);
    const lesson = useSelector(state => state.lesson.item.result);
    const loading = useSelector(state => state.thematic.list.loading);
    const exams = useSelector(state => state.exam.list.result);
    const error = useSelector(state => state.thematic.list.error);
    const loadingLesson = useSelector(state => state.lesson.item.loading);
    const errorLesson = useSelector(state => state.lesson.item.error);

    const getCourseOfUser = () => {
        axios.get(config.API_URL + `/student/list/course`, { headers: {Authorization: `Bearer ${localStorage.getItem('userToken')}`,} 
        })
            .then(
                res => {
                    if (res.status === 200 && res.statusText === 'OK') {
                        res.data.data.map(course => {
                            if (course.khoa_hoc_id === props.idCourse[0]) {
                                setExistCourse(true);
                            }
                            return null;
                        })
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

    const notificationNotExistCourse = (error) => {
        return (
            notification.error({
                message: 'Lỗi',
                description: 'Có lỗi xảy ra khi lấy dữ liệu',
            })
        )
    }

    useEffect(() => {
        dispatch(thematicActions.getThematicsByIdModule({ 'idModule': props?.id }));  
        if (userToken) {
            dispatch(examActions.filterExam({ idCourse: props?.idCourse, idModule: props?.id, idThematic: '', status: 1, search: '', 
                start: '', end: '', idType: 2, publish: '', offset: '', limit: 1000000 })); // get exam module
            getCourseOfUser();
        }    
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const OnHandleThematic = (id) => {
        setidThematic(id);
        dispatch(lessonActions.getLessonByIdThe({ "idThematic": id, idCourse: props.idCourse[0], idModule: props.id })) // Lấy dữ liệu cho lesson
    }

    const showModal = () => {
        setVisible(true);
    };

    const handleOk = () => {
        setVisible(false);
    };

    const onSubmitLogin = (values) => {
            const callback = (res) => {
                if (res.status === 200 && res.statusText === 'OK') {
                    setVisible(false);
                    notification.success({
                        message: 'Thông báo',
                        description: 'Đăng nhập thành công.',
                    });
                    const json_token = jwt_decode(localStorage.getItem('userToken'));
                    if (json_token.role === 0) {
                        setTimeout(() => {
                            dispatch(userActions.logoutUser());
                        }, 18000000);
                        dispatch(userActions.getUserStudent({ hoc_vien_id: json_token.userId, isUpdateStorage: true }, (res) => {
                            if (res.status === 'success') window.location.reload();
                        }));
                    } 
                    else {
                        notification.error({
                            message: 'Tài khoản của bạn không có quyền đăng nhập vào ',
                        });
                        localStorage.clear();
                        return;
                    }
                } else {
                    notification.error({
                        message: 'Đăng nhập thất bại',
                        description: 'Bạn vui lòng kiểm tra lại thông tin đăng nhập',
                    });
                }
            };
            const token = captchaRef.current.getValue();
            values.token = token;
            captchaRef.current.reset();
            dispatch(userActions.loginUser({ type: 1, login: values }, callback));
        };

    const renderLogin = () => {
        return (
            <Form form={form} className="login-form app-form" name="login-form" onFinish={onSubmitLogin}>
                <h2 className="form-title">Đăng nhập</h2>
                <Form.Item name="email" rules={[{ required: true, message: 'Bạn chưa nhập email', type: "email" }]}>
                    <Input size="normal" prefix={<UserOutlined />} placeholder="Email" />
                </Form.Item>

                <Form.Item name="mat_khau" rules={[
                        { required: true, message: 'Bạn chưa nhập mật khẩu!' },
                        { pattern: new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/), 
                        message: 'Mật khẩu chưa đúng dạng gồm: Chữ hoa, chữ thường, ký tự đặc biệt, số, ít nhất 8 kí tự' 
                    }]}
                >
                    <Input.Password prefix={<LockOutlined />} iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} placeholder="Mật khẩu" />
                </Form.Item>
                <Form.Item name="captcha"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >   
                    <ReCAPTCHA sitekey={config.CAPTCHA.siteKey} ref={captchaRef} />
                </Form.Item>
                <Form.Item className="center-buttons">
                    <Button type="primary" shape="round" htmlType="submit" className="btn-login">
                        Đăng nhập
                    </Button>
                </Form.Item>

                <div className="footer-login">
                    {/* Social Links */}
                    <SocialLogin />
                    <div className="forgot-password">
                        Bạn quên mật khẩu?
                        <Button
                            type="link"
                            onClick={() => {
                                window.location.href = config.BASE_URL + '/auth/forgot-password';
                            }}
                        >
                            Lấy lại mật khẩu
                        </Button>
                    </div>
                    <div className="forgot-password">
                        Bạn chưa có tài khoản?
                        <Button
                            type="link"
                            onClick={() => {
                                window.location.href = config.BASE_URL + '/auth/register';
                            }}
                        >
                            Đăng ký ngay
                        </Button>
                    </div>
                </div>
            </Form>
        )
    }

    return (
        <>
            {loading && <LoadingCustom/>}
            <div className="body-detail" style={{padding: 12}}>   
                <div className="title text-center mb-0">
                    <h3 className="red-text bold" style={{fontSize: 24}}>ĐỀ CƯƠNG CHI TIẾT CỦA KHOÁ HỌCz</h3>
                </div>

                <Row gutter={[16, 16]}>
                        {thematics.status === "success" &&
                            thematics.data.thematics
                                .filter(obj => obj.trang_thai === true)
                                .map(({ chuyen_de_id, ten_chuyen_de }, index) => (
                                    <Col span={12} key={'key' + index}>
                                        <Collapse defaultActiveKey={['0']} >
                                            <Panel 
                                                header={
                                                    <span style={{ fontWeight: 500 }}>
                                                        🟠 {ten_chuyen_de}
                                                    </span>
                                                } 
                                                key={chuyen_de_id}
                                            >
                                                <div style={{ paddingLeft: 20 }}>
                                                    <div className="btn-thematic" 
                                                        onClick={() => !userToken ? showModal() : existCourse ? OnHandleThematic(chuyen_de_id) : notificationNotExistCourse()}
                                                    >
                                                        <PushpinOutlined /> VIDEO BÀI GIẢNG
                                                    </div>
                                                    <div className="btn-thematic" 
                                                        onClick={() => !userToken ? showModal() : existCourse ? OnHandleThematic(chuyen_de_id) : notificationNotExistCourse()}
                                                    >
                                                        <PushpinOutlined /> BÀI GIẢNG (PDF)
                                                    </div>
                                                    <div className="btn-thematic" 
                                                        onClick={() => !userToken ? showModal() : existCourse ? window.location.href = `/luyen-tap/chuyen-de/xem/${hashids.encode(chuyen_de_id)}/${hashids.encode(props.idCourse)}` : notificationNotExistCourse()}
                                                    >
                                                        <PushpinOutlined /> BÀI KIỂM TRA
                                                    </div>
                                                </div>
                                            </Panel>
                                        </Collapse>
                                    </Col>
                            ))
                        }
                    
                </Row>
                

                {exams.status === 'success' && exams.data.filter(obj => obj.xuat_ban === 1) &&
                    <Row className="body-detail-button mb-4" style={{marginTop: 12}}>
                        <Button color="success" type="primary" style={{maxWidth: 'none', width: 'auto', borderRadius: 4}}
                            onClick={() => history.push(`/luyen-tap/kiem-tra-mo-dun/${hashids.encode(props.idCourse)}/${hashids.encode(props.id)}`) }>
                                Danh sách đề thi mô đun
                        </Button>
                    </Row>
                }
            </div>
            {error && !loading && <p>{error}</p>}    
            {errorLesson && !loadingLesson && notification.error({
                message: get(errorLesson, 'response.data.error', 'Tải dữ liệu bài giảng thất bại: ' + errorLesson.response.data.message),
            })}    
            <br/>
            {(idThematic !== 0 && lesson.status === 'success' && 
                (lesson.data.video.length > 0 || lesson.data.pdf != null)) && 
                    <ContentDetailPage props={lesson} idThematic={idThematic} idModule={props.id} idCourse={props.idCourse}></ContentDetailPage>
            }
            <Modal
                className="cra-auth-modal"
                wrapClassName="cra-auth-modal-container"
                maskStyle={{ background: 'rgba(0, 0, 0, 0.8)' }}
                maskClosable={false}
                footer={null}
                mask={true}
                centered={true}
                visible={visible}
                onOk={handleOk}
                onCancel={handleOk}
                width={480}
            >
                {renderLogin()}
            </Modal>
        </>
    )
}

export default BodyDetailPage;