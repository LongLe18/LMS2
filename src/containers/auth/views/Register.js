import React, { useRef } from 'react';
import 'assets/demo/auth.css';
import { NavLink } from 'react-router-dom';
// helper
import './css/register.css'
import config from '../../../configs/index';

import { Form, Input, Button, Avatar, notification } from 'antd';
import { UserOutlined, PhoneOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import ReCAPTCHA from 'react-google-recaptcha';

// redux
import { useDispatch } from "react-redux";
import * as userActions from '../../../redux/actions/user';

const RegisterPage = (props) => {
    const [form] = Form.useForm();
    const captchaRef = useRef(null);
    const dispatch = useDispatch();
    // const user = useSelector(state => state.user.item.result);

    const onSubmit = (values) => {
        const callback = () => {
            notification.success({
                message: 'Bạn đã đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản. Trong trường hợp không tìm thấy email kích hoạt tài khoản, quý khách vui lòng kiểm tra trong thư mục SPAM',
            });
            props.history.push('/auth/hocvien');
        };
        const token = captchaRef.current.getValue();
        values.token = token;
        captchaRef.current.reset();
        dispatch(userActions.registerUser( { type: 1, register: values }, callback));
    };

    const compareToFirstPassword = (rule, value, callback) => {
        if (value) {
            if (value !== form.getFieldValue('mat_khau')) {
                callback('Xác nhận mật khẩu không khớp');
            } else {
                callback();
            }
        }
    };

    return(
        <>
            <div className="logo">
                <NavLink to='/luyen-tap/kinh-doanh-khoa-hoc'>
                    <Avatar shape="square" size={130} src={require('assets/img/logo/logo-1645539611909.png').default} />
                </NavLink>
            </div>
            <div className="login-form">
                <Form  onFinish={onSubmit} form={form}>
                    <Form.Item name="ho_ten">
                        <Input size="normal" prefix={<UserOutlined />} placeholder='Họ và tên' />
                    </Form.Item>
                    <Form.Item name="sdt" rules={[
                        { required: true, message: 'Số điện thoại là trường bắt buộc.' },
                    ]}>
                        <Input size="normal" type={"tel"} prefix={<PhoneOutlined />} placeholder='Số điện thoại' />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'E-mail là trường bắt buộc.' },
                            { type: 'email', message: 'Không đúng định dạng E-mail.' },
                        ]}
                    >
                        <Input size="normal" prefix={<MailOutlined />} placeholder='Email' />
                    </Form.Item>
                    <Form.Item
                        name="mat_khau"
                        rules={[
                            {
                                required: true,
                                message: 'Mật khẩu là trường bắt buộc.',
                            },
                            { pattern: new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/), 
                                message: 'Mật khẩu chưa đúng dạng gồm: Chữ hoa, chữ thường, ký tự đặc biệt, số, ít nhất 8 kí tự' 
                            }
                        ]}
                    >
                        <Input.Password size="normal" prefix={<LockOutlined />} placeholder='Mật khẩu' iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
                    </Form.Item>
                    <Form.Item
                        name="xac_nhan_mat_khau"
                        rules={[
                            {
                                required: true,
                                message: 'Xác nhận mật khẩu là trường bắt buộc.',
                            },
                            {
                                validator: compareToFirstPassword,
                            },
                        ]}
                    >
                        <Input.Password
                            size="normal"
                            prefix={<LockOutlined />}
                            placeholder='Xác nhận mật khẩu'
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
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
                    

                    <Form.Item style={{textAlign: "center"}}>
                        <Button type="primary" htmlType="submit" size="normal" shape="round">
                            Đăng ký
                        </Button>{' '}
                        hoặc         
                    </Form.Item>
                </Form>
                <div className="other-links" style={{marginBottom: "15px",textAlign: 'center'}}>
                    <button onClick={() => props.history.push("/auth/hocvien")} className='login-form-forgot font-weight-5'>Đăng nhập</button> |{' '}
                    <button className="login-form-forgot font-weight-5" onClick={() => props.history.push("/auth/forgot-password")}>
                        Quên mật khẩu
                    </button>
                </div>
            </div>
        </>
    )
}

export default RegisterPage;