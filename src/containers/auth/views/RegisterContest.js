import React, { useRef, useState, useEffect } from 'react';
import 'assets/demo/auth.css';
// helper
import './css/register.css'
import config from '../../../configs/index';

import { Form, Input, Button, Avatar, notification, DatePicker, Space, Radio, Select, Checkbox, Row , Col} from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import ReCAPTCHA from 'react-google-recaptcha';
// redux
import { useDispatch } from "react-redux";
import * as userActions from '../../../redux/actions/user';

import axios from 'axios';

const { Option } = Select;

const RegisterContest = (props) => {
    const [form] = Form.useForm();
    const captchaRef = useRef(null);
    const dispatch = useDispatch();

    const [province, setProvinces] = useState([]);

    const [state, setState] = useState({
        codeprovince: 1,
        nameprovince: '',
        type: 'CCCD',
    });

    const onSubmit = (values) => {
        values.dia_chi = values.class + ' - ' + values.namehightschool + ' - ' + values.distrinct + ' - Hà Nội';
        values.truong_hoc = values.class + ' - ' + values.namehightschool + ' - ' + values.distrinct + ' - Hà Nội';
        const callback = () => {
            notification.success({
                message: 'Bạn đã đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản. Trong trường hợp không tìm thấy email kích hoạt tài khoản, quý khách vui lòng kiểm tra trong thư mục SPAM',
            });
            window.location.href = 'https://www.tainangtienganhthudo.vn/';
        };
        const token = captchaRef.current.getValue();
        values.token = token;
        captchaRef.current.reset();
        dispatch(userActions.registerContest({ register: values }, callback));
    };

    const getProvince = () => {
        axios.get(config.API_URL + '/province', )
            .then(
                res => {
  
                    if (res.status === 200 && res.statusText === 'OK') {
                        res.data.data.push({ten: 'Tất cả', ttp_id: ''});
                        setProvinces(res.data.data);
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

    useEffect(() => {
        getProvince();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const renderProvince = () => {
        let options = [];
        if (province.length !== 0) {
            options = province.map((province) => (
                <Option key={province.ttp_id} value={province.ttp_id} >{province.ten}</Option>
            ));
        }
        return (
            <Select style={{width: '100%'}} initialValue={state.codeprovince}
                showSearch={true}
                optionFilterProp="children"
                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                placeholder="Chọn tỉnh / thành phố"
                onChange={(id, name) => setState({ ...state, codeprovince: id, nameprovince: name })}
            >
                {options}
            </Select>
        );
    }

    const renderCard = () => {
        return (
            <Select
              value={state.type} defaultValue={state.type}
              onChange={(type) => setState({ ...state, type: type })}
              placeholder="Chọn loại giấy tờ"
            >
              <Option value={'CCCD'} >Căn cước công dân</Option>
              <Option value={'CMND'} >Chứng minh nhân dân</Option>
              <Option value={'PP'} >Passport</Option>
            </Select>
          );
    }
      
    return(
        <>
            <div className="logo">
                <a href='https://www.tainangtienganhthudo.vn/'>
                    <Avatar shape="square" size={130} src={require('assets/img/logo/logo-contest.png').default} />
                </a>
            </div>
            <div className="login-form"  style={{marginBottom: 100}}>
                <h3 style={{textAlign: 'center'}}>Đăng ký thông tin</h3>
                <div className="col-12 col-sm-12">
                    <p className="text-center mb-0 pb-2" style={{fontSize: 14, fontWeight: 'bold', color: '#dc0303'}}>
                        Thông tin của thí sinh được bảo mật và chỉ sử dụng liên quan đến Kỳ thi
                    </p>
                </div>
                <Form  onFinish={onSubmit} form={form} layout='vertical'>
                    <Form.Item 
                        name="ho_ten" label="Họ và tên thí sinh (tiếng Việt có dấu)"
                        rules={[
                            { required: true, message: 'Họ và tên là trường bắt buộc.' },
                        ]}
                    >
                        <Input size="normal" prefix={<UserOutlined />} placeholder='Họ và tên' />
                    </Form.Item>
                    <Form.Item 
                        name="sdt" label="Số điện thoại của thí sinh"
                        rules={[
                            { required: true, message: 'Số điện thoại là trường bắt buộc.' },
                        ]}
                    >
                        <Input size="normal" type={"tel"} prefix={<PhoneOutlined />} placeholder='Số điện thoại' />
                    </Form.Item>
                    <Form.Item
                        name="email" label="Email của thí sinh"
                        rules={[
                            { required: true, message: 'E-mail là trường bắt buộc.' },
                            { type: 'email', message: 'Không đúng định dạng E-mail.' },
                        ]}
                    >
                        <Input size="normal" prefix={<MailOutlined />} placeholder='Email' />
                    </Form.Item>
                    <Space direction='horizontal' size={48}>
                        <Form.Item label="Ngày tháng năm sinh"
                            name="ngay_sinh"
                            rules={[
                                { required: true, message: 'Ngày sinh là trường bắt buộc.' },
                            ]}
                        >
                            <DatePicker placeholder='Chọn ngày' format={'DD/MM/YYYY'}/>
                        </Form.Item>
                            
                        <Form.Item label="Giới tính" style={{flexDirection: 'row'}}
                            name="gioi_tinh" 
                            rules={[
                                { required: true, message: 'Giới tính là trường bắt buộc.' },
                            ]}
                        >
                            <Radio.Group style={{marginLeft: 20}}>
                                <Radio value="Nam"> Nam </Radio>
                                <Radio value="Nữ"> Nữ </Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Space>
                    <Row>
                        <Col xl={9} sm={9} xs={9}>
                            <Form.Item initialValue={1}
                                name="ttp_id" label="Tỉnh/Thành phố"
                                rules={[
                                    { required: true, message: 'Tỉnh/Thành phố là bắt buộc' }
                                ]}
                            >
                                {renderProvince()}
                            </Form.Item>
                        </Col>
                        
                        <Col xl={9} sm={9} xs={9} offset={3}>
                            <Form.Item
                                name="distrinct" label="Quận/Huyện"
                                rules={[
                                    { required: true, message: 'Quận/Huyện phố là bắt buộc' }
                                ]}
                            >
                                <Input placeholder="Quận/Huyện của trường đang học"/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col xl={9} sm={9} xs={9}>
                            <Form.Item
                                name="namehightschool"
                                label="Trường học"
                                rules={[
                                    { required: true, message: 'Trường học là bắt buộc' }
                                ]}
                            >
                                <Input size="normal" placeholder='Ví dụ: Trường THPT Lê Quý Đôn' />
                            </Form.Item>
                        </Col>
                        <Col xl={9} sm={9} xs={9}  offset={3}>
                            <Form.Item
                                name="class"
                                label="Lớp"
                                rules={[
                                    { required: true, message: 'Lớp là bắt buộc' }
                                ]}
                            >
                                <Input size="normal" placeholder='Ví dụ: Lớp 11A' />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col xl={9} sm={9} xs={9}>
                            <Form.Item initialValue={'CCCD'}
                                name="id_type"
                                label="Giấy tờ tùy thân"
                                rules={[
                                    { required: true, message: 'Giấy tờ tùy thân là bắt buộc' }
                                ]}
                            >   
                                {renderCard()}
                            </Form.Item>
                        </Col>
                        <Col xl={9} sm={9} xs={9}  offset={3}>
                            <Form.Item
                                name="id_number"
                                label="Số giấy tờ"
                                rules={[
                                    { required: true, message: 'id tùy thân là bắt buộc' },
                                    { pattern: new RegExp(/(?=.*?[0-9]).{8,}$/), 
                                        message: 'Mật khẩu chưa đúng dạng gồm: Chữ hoa, chữ thường, ký tự đặc biệt, số, ít nhất 8 kí tự' 
                                    }
                                ]}
                            >
                                <Input placeholder='Nhập số CMND/CCCD/Passport'/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row >
                        <Col xl={9} sm={9} xs={9}>
                            <Form.Item
                                name="id_deadline"
                            >
                                <DatePicker placeholder='Ngày hết hạn' style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col xl={9} sm={9} xs={9}  offset={3}>
                            <Form.Item
                                name="id_issued"
                            >
                                <Input placeholder="Nơi cấp"/>
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Form.Item name="captcha"
                        rules={[
                            {
                            required: true,
                            },
                        ]}
                    >   
                        <ReCAPTCHA sitekey={config.CAPTCHA.siteKey} ref={captchaRef}/>
                    </Form.Item>
                    <Form.Item
                        name="checkbox" valuePropName="checked"
                        rules={[
                            {
                                required: true,
                                message: 'Bạn chưa đồng ý quy định.',
                            },
                        ]}
                    >
                        <Checkbox> Đã đọc và đồng ý với 
                            <a href="https://www.netalent.vn/the-le-ky-thi-tai-nang-ielts-lan-thu-i-dar15/" target="_blank" rel="noopener noreferrer"> thể lệ </a>
                            và
                            <a href="http://www.englishtalentcontest.vn/terms-conditions/" target="_blank" rel="noopener noreferrer"> các điều khoản toàn cầu của kỳ thi IELTS</a>
                            </Checkbox>
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

export default RegisterContest;