import 'assets/demo/auth.css';
import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

// redux
import { useDispatch, useSelector } from "react-redux";
import * as userActions from '../../../../redux/actions/user';

// antd
import { Form, Input, Button, Avatar, notification } from 'antd';
import { LockOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

// other
import jwt_decode from 'jwt-decode';

const LoginAdminPage = (props) => {
    const roleCheck = 2;
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const user = useSelector(state => state.user.staff.result);
    // const [login, setLogin] = useState(false);

    const onSubmit = (values) => {
        const callback = () => {
            notification.success({
                message: 'Đăng nhập thành công',
            });
            const json_token = jwt_decode(localStorage.getItem('userToken'));
            if (json_token.role === 2 && json_token.role === roleCheck) {
                setTimeout(() => {
                    dispatch(userActions.logoutUser());
                }, 18000000);
                dispatch(userActions.getUserStaff({ nhan_vien_id: json_token.userId, isUpdateStorage: true }));
            } 
            else {
                notification.error({
                    message: 'Tài khoản của bạn không có quyền đăng nhập vào ',
                });
                localStorage.clear();
                return;
            }
            // setLogin(true);
        };
        dispatch(userActions.loginUser( { type: 3, login: values } , callback));
    };

    useEffect(() => {
        if (user.status === 'success') {
            if (user.data[0].trang_thai === 1) {       // tài khoản đã kích hoạt
                if (localStorage.getItem('userToken') !== null)  {
                    const json_token = jwt_decode(localStorage.getItem('userToken'));
                    if (json_token.role === 0) {
                        props.history.push('/luyen-tap/kinh-doanh-khoa-hoc');
                    }
                    else props.history.push('/admin/dashboard');
                }        
            } else {
                notification.warning({
                    message: 'Tài khoản của bạn chưa được kích hoạt',
                });
                localStorage.removeItem('userToken');
                localStorage.removeItem('userInfo');
                return;
            }
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    
    return(
        <>
            <div className="logo">
                <NavLink to='/luyen-tap/kinh-doanh-khoa-hoc'>
                    <Avatar shape="square" size={130} src={require('assets/img/logo/logo-1645539611909.png').default} />
                </NavLink>
            </div>
            <div className='login-form'>
                <Form  form={form} onFinish={onSubmit}>
                    <Form.Item name="email" rules={[{ required: true, message: 'Bạn chưa nhập email', type: "email" }]}>
                        <Input size="normal" prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>
                    <Form.Item name="mat_khau" rules={[{ required: true, message: 'Mật khẩu là trường bắt buộc' }]}>
                        <Input.Password size="normal" prefix={<LockOutlined />} placeholder='Mật khẩu' iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
                    </Form.Item>
                    <Form.Item className='center-buttons'>
                        <Button type="primary" htmlType="submit" size="normal" shape="round">
                            Đăng nhập
                        </Button>
                        {/* Social Links */}
                    </Form.Item>
                </Form>
                {/* <div className="other-links" style={{marginBottom: "15px",textAlign: 'center'}}>
                    <NavLink className="login-form-forgot font-weight-5" to="/auth/register">
                        Đăng ký
                    </NavLink>{' '}
                    |{' '}
                    <NavLink className="login-form-forgot font-weight-5" to="/auth/forgot-password">
                        Quên mật khẩu
                    </NavLink>{' '}
                </div> */}
            </div>
        </>
            
    )
}

export default LoginAdminPage;