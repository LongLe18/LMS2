import React, { useState, useRef } from 'react';
import 'assets/demo/auth.css';
import config from '../../../configs/index';
import { Link } from 'react-router-dom';

import { Form, Input, Button, Avatar, notification } from 'antd';
import Icon from '@ant-design/icons';
import ReCAPTCHA from 'react-google-recaptcha';
// redux
import { useDispatch } from "react-redux";
import * as userActions from '../../../redux/actions/user';

const ForgotPasswordPage = (props) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const captchaRef = useRef(null);
    const [state, setState] = useState(false);

    const onSubmit = (values) => {
        const callback = (result) => {
            if (result.status === 'success') {
                setState(true);
            } else {
                notification.error({
                    message: 'Email không tồn tại',
                });
            }
        };
        const token = captchaRef.current.getValue();
        captchaRef.current.reset();
        const data = {
            email:  values.email,
            token: token,
        }
        dispatch(userActions.forgotPassword({ typeUser: 1, email: data }, callback));
    };

    return (
        <>
            <div className="logo">
                <Link to="/luyen-tap/kinh-doanh-khoa-hoc">
                    <Avatar shape="square" size={130} src={require('assets/img/logo/logo-1645539611909.png').default} />
                </Link>
            </div>
            {!state ? 
                <>
                    <Form className="login-form" form={form} onFinish={onSubmit}>
                        <p className="alert font-weight-5" style={{color: 'black'}}>Bạn vui lòng nhập e-mail, chúng tôi sẽ gửi link cập nhật mật khẩu qua e-mail.</p>
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'E-mail là trường bắt buộc' },
                                { type: 'email', message: 'Không đúng định dạng E-mail' },
                            ]}
                        >
                            <Input size="normal" prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder='Email' />
                        </Form.Item>
                        <Form.Item name="captcha"
                            rules={[
                                {
                                required: true,
                                },
                            ]}
                        >   
                            <ReCAPTCHA sitekey={config.CAPTCHA.siteKey} ref={captchaRef}/>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="login-form-button" size="normal" shape="round">
                                Khôi phục mật khẩu
                            </Button>
                            <br />
                            <div className="other-links">
                                {' '}
                                <button className="login-form-forgot font-weight-5" onClick={() => props.history.push("/auth/hocvien")}>
                                    Đăng nhập
                                </button>{' '}
                            </div>
                        </Form.Item>
                    </Form>
                </>
            : 
                <Form className="login-form">
                    <p className="alert font-weight-5" style={{color: 'black'}}>Khôi phục mật khẩu thành công. Bạn vui lòng kiểm tra Email.</p>
                    <Form.Item>
                        <div className="other-links">
                            {' '}
                            <button className="login-form-forgot font-weight-5" onClick={() => props.history.push("/luyen-tap/kinh-doanh-khoa-hoc")}>
                                Trang chủ
                            </button>{' '}
                        </div>
                    </Form.Item>
                </Form>
            }
        </>
    )
}

export default ForgotPasswordPage;