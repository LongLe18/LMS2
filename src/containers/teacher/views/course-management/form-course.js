import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import constants from '../../../../helpers/constants';
import { Layout, Form, Input, Upload, Button, Card,
  Radio, Select, DatePicker, Space, Typography, Row,
  Col,  message, notification, InputNumber } from "antd"
import {  UploadOutlined} from "@ant-design/icons"
import './course-management.css'
import TextEditorWidget2 from "components/common/TextEditor/TextEditor2";
import moment from "moment";

import * as courseAction from '../../../../redux/actions/course';
import * as programmeAction from '../../../../redux/actions/programme';
import * as descriptionAction from '../../../../redux/actions/descriptionCourse';
import { useSelector, useDispatch } from "react-redux";

const { Header } = Layout
const { Text } = Typography
const { Option } = Select
const { Dragger } = Upload
const { RangePicker } = DatePicker


const FormCourse = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const history = useHistory();
    const idCourse = useParams().idCourse; // id of the course from URL params

    const formDefault = {
        ten_khoa_hoc: '',
        ngay_bat_dau: '',
        ngay_ket_thuc: '',
        kct_id: 1,
    };

    const [state, setState] = useState({
        form: formDefault,
        idCourse: idCourse,
        fileImg: '',
        ngay_bat_dau: '',
        ngay_ket_thuc: '',
        isEdit: idCourse !== 'create' ? true : false, 
        courseData: {},
        isShowTypeCourse: false,
    })
    const programmes = useSelector(state => state.programme.list.result);
    const course = useSelector(state => state.course.item.result);
    const description = useSelector(state => state.descriptionCourse.item.result);

    // props for upload image
    const propsImage = {
        name: 'file',
        action: '#',
    
        beforeUpload: file => {
            const isPNG = file.type === 'image/png' || file.type === 'image/jpeg';
            if (!isPNG) {
            message.error(`${file.name} có định dạng không phải là png/jpg`);
            }
            // check dung lượng file trên 1mb => không cho upload
            let size = true;
            if (file.size > 1024000) {
            message.error(`${file.name} dung lượng file quá lớn`);
            size = false;
            }
            return (isPNG && size) || Upload.LIST_IGNORE;
        },
    
        onChange(info) {
            setState({ ...state, fileImg: info.file.originFileObj });
        },
    
        async customRequest(options) {
            const { onSuccess } = options;
    
            setTimeout(() => {
            onSuccess("ok");
            }, 0);
        },
    
        onRemove(e) {
            console.log(e);
            setState({ ...state, fileImg: '' });
        },
    };
    
    useEffect(() => {
        dispatch(programmeAction.getProgrammes({ status: '' }));
        if (idCourse !== 'create') {
            dispatch(courseAction.getCourse({ id: idCourse }));
            dispatch(descriptionAction.getDescriptionCourse({ id: idCourse }));
        }
    }, []);
    
    useEffect(() => {
        if (course.status === 'success') {
            const ngay_bat_dau_raw = course?.data?.ngay_bat_dau;
            const ngay_ket_thuc_raw = course?.data?.ngay_ket_thuc;

            const ngay_bat_dau = ngay_bat_dau_raw !== null ? moment(ngay_bat_dau_raw, "YYYY/MM/DD") : null;
            const ngay_ket_thuc = ngay_ket_thuc_raw !== null ? moment(ngay_ket_thuc_raw, "YYYY/MM/DD") : null;

            // Update course data with moment dates
            course.data = {
                ...course.data,
                ngay_bat_dau: [ngay_bat_dau, ngay_ket_thuc],
            };        
            form.setFieldsValue(course.data);
            form.setFieldValue('kct_id', course.data.kct_id + '_' + course?.data?.khung_chuong_trinh?.loai_kct);
            const showTypeCourse = [2, 4, 5].includes(course?.data?.khung_chuong_trinh?.loai_kct);
            setState(prev => ({
                ...prev,
                ngay_bat_dau: ngay_bat_dau_raw,
                ngay_ket_thuc: ngay_ket_thuc_raw,
                isShowTypeCourse: showTypeCourse
            }));
        }
    }, [course]);  // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        form.setFieldsValue(description.data);
    }, [description]); // eslint-disable-line react-hooks/exhaustive-deps

    const renderProgrammes = () => {
        let options = [];
        if (programmes.status === 'success') {
            options = programmes.data
            .filter((programme) => programme.loai_kct === 2 || programme.loai_kct === 4 || programme.loai_kct === 5)
            .map((programme) => (
                <Option key={programme.kct_id} value={programme.kct_id + '_' + programme.loai_kct} >{programme.ten_khung_ct}</Option>
            ))
        }
        return (
            <Select
                showSearch={true}
                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                placeholder="Chọn khung chương trình"
                onChange={(value) => {
                    // Nếu khung chương trình : Luyện thi, ôn luyện
                    if (value.split('_')[1] === '2' || value.split('_')[1] === '4' || value.split('_')[1] === '5') {
                        setState({...state, isShowTypeCourse: true});
                    }
                    else {
                        setState({...state, isShowTypeCourse: false});
                    }
                }}
            >
                {options}
            </Select>
        );
    };

    const onChangeStart = (value, dateString) => {
        setState({...state, ngay_bat_dau: dateString[0], ngay_ket_thuc: dateString[1] });
    };

    // Event tạo/cập nhật mô tả khoá học
    const handleFormDescription = (values, khoa_hoc_id) => {
        const callback = (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                form.resetFields();
                notification.success({
                    message: 'Thành công',
                    description: !state.isEdit ? 'Thêm khóa học mới thành công' : 'Cập nhật khóa học thành công',
                })
                history.push('/teacher/course-management');
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: !state.isEdit ? 'Thêm khóa học mới thất bại' : 'Cập nhật khóa học thất bại',
                })
                history.push('/teacher/course-management');
            }
        };

        const dataSubmit = {
            khoa_hoc_id: khoa_hoc_id,
            mo_ta_chung: values.mo_ta_chung !== undefined ? values.mo_ta_chung : '',
            gioi_thieu: values.gioi_thieu !== undefined ? values.gioi_thieu : '',
            hinh_thuc_dao_tao: values.hinh_thuc_dao_tao !== undefined ? values.hinh_thuc_dao_tao : '',
            muc_tieu_cam_ket: values.muc_tieu_cam_ket !== undefined ? values.muc_tieu_cam_ket : '',
            doi_tuong: values.doi_tuong !== undefined ? values.doi_tuong : '',
            noi_dung_chi_tiet: values.noi_dung_chi_tiet !== undefined ? values.noi_dung_chi_tiet : '',
            xep_lop_thoi_gian: values.xep_lop_thoi_gian !== undefined ? values.xep_lop_thoi_gian : '',
            gia_goc: values.gia_goc !== undefined ? values.gia_goc : '0',
        };
        if (state.isEdit) {
            dispatch(descriptionAction.EditDescriptionCourse({ idCourse: idCourse, formData: dataSubmit }, callback));
        } else {
            dispatch(descriptionAction.CreateDescriptionCourse(dataSubmit, callback))
        }
    }
    
    // Event tạo/cập nhật khoá học
    const handleFormCourse = (values) => {
        const callback = (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                if (!state.isEdit) {
                    handleFormDescription(values, res?.data?.data?.khoa_hoc_id)
                } else {
                    handleFormDescription(values, idCourse)
                }
            } 
        };

        const formData = new FormData();
        formData.append('ten_khoa_hoc', values.ten_khoa_hoc);
        formData.append('ngay_bat_dau', state.ngay_bat_dau);
        formData.append('ngay_ket_thuc', state.ngay_ket_thuc );
        formData.append('giao_vien_id', JSON.parse(localStorage.getItem('userInfo'))?.giao_vien_id );
        formData.append('kct_id', values.kct_id.split('_')[0]);
        if (values.kct_id.split('_')[1] === '2' || values.kct_id.split('_')[1] === '4' || values.kct_id.split('_')[1] === '5') { // kiểm tra khung chương trình = 2 hoặc 4 là các khung ôn luyện
            formData.append('lkh_id', values.lkh_id);
        } else formData.append('lkh_id', ''); // nếu không thì mặc định là 1
        formData.append('mo_ta', values.mo_ta !== undefined ? values.mo_ta : '');
        // video , image
        if (state.fileImg !== '')
            formData.append('anh_dai_dien', state.fileImg !== undefined ? state.fileImg : '');
        if (state.isEdit) {
            formData.append('trang_thai', values.trang_thai );
            dispatch(courseAction.EditCourse({ formData: formData, idCourse: idCourse }, callback))
        } else {
            dispatch(courseAction.CreateCourse(formData, callback));
        }
    };

    return (
        <div className="form-course" style={{marginTop: 30}}>
            {/* Header */}
            <Header style={{ backgroundColor: "transparent", padding: "0 24px",  }}>
                <Row justify="space-between" align="middle" style={{ height: "100%" }}>
                    <Col>
                        <Space align="center">
                            <Text strong style={{ fontSize: "20px" }}>
                                Tạo khóa học mới
                            </Text>
                        </Space>
                    </Col>
                    
                </Row>
            </Header>

            <Layout style={{ padding: "24px", backgroundColor: "transparent" }}>
                <Form form={form} onFinish={handleFormCourse}>
                    <Row gutter={24}>
                        {/* Main Content */}
                            <Col xs={24} lg={16} >
                                {/* Course Name */}
                                <Card style={{marginBottom: 8}}>
                                    <Form.Item 
                                        className="input-col"
                                        label="Tên khóa học"
                                        name="ten_khoa_hoc"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Tên khóa học là trường bắt buộc.',
                                            },
                                        ]}
                                        >
                                            <Input placeholder="Nhập tên khoá học" />
                                    </Form.Item>
                                </Card>

                                {/* Course Image */}
                                <Card style={{marginBottom: 8}}>
                                    <Form.Item className="input-col" label="Hình đại diện" name="anh_dai_dien" rules={[]}>
                                        <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>
                                            Tối đa 5.4MB, định dạng ảnh: jpeg, jpg, png, gif, webp, tối đa 5MB
                                        </Text>
                                        <Dragger {...propsImage} maxCount={1}
                                            listType="picture"
                                            className="upload-list-inline"
                                        >
                                            <p className="ant-upload-drag-icon">
                                            <UploadOutlined />
                                            </p>
                                            <p className="ant-upload-text bold">Click hoặc kéo thả ảnh vào đây</p>
                                        </Dragger>
                                    </Form.Item>
                                </Card>        
                                    
                                <Card style={{marginBottom: 8}}>
                                    <Form.Item
                                        className="input-col"
                                        label="Mô tả chung"
                                        name="mo_ta_chung"
                                        rules={[]}
                                    >
                                        <TextEditorWidget2
                                            placeholder="Mô tả khóa học"
                                            showToolbar={true}
                                            isMinHeight200={true}
                                            isSimple={false}
                                        />
                                    </Form.Item>
                                </Card>
                                    
                                {/* Course Introduction */}
                                <Card style={{marginBottom: 8}}>
                                    <Form.Item
                                        className="input-col"
                                        label="Giới thiệu Khóa học"
                                        name="gioi_thieu"
                                        rules={[]}
                                    >
                                            <TextEditorWidget2
                                                placeholder="Giới thiệu khóa học"
                                                showToolbar={true}
                                                isMinHeight200={true}
                                                isSimple={false}
                                            />
                                    </Form.Item>    
                                </Card>

                                {/* Training Format */}
                                <Card style={{marginBottom: 8}}>
                                    <Form.Item
                                        className="input-col"
                                        label="Hình thức đào tạo"
                                        name="hinh_thuc_dao_tao"
                                        rules={[]}
                                    >
                                            <TextEditorWidget2
                                                placeholder="Hình thức đào tạo"
                                                showToolbar={true}
                                                isMinHeight200={true}
                                                isSimple={false}
                                            />
                                    </Form.Item>
                                </Card>
                                                                    
                                {/* Commitment Goals */}
                                <Card style={{marginBottom: 8}}>
                                    <Form.Item
                                        className="input-col"
                                        label="Mục tiêu cam kết"
                                        name="muc_tieu_cam_ket"
                                        rules={[]}
                                    >
                                            <TextEditorWidget2
                                                placeholder="Mục tiêu cam kết"
                                                showToolbar={true}
                                                isMinHeight200={true}
                                                isSimple={false}
                                            />
                                    </Form.Item>
                                </Card>

                                {/* Target Audience */}
                                <Card style={{marginBottom: 8}}>
                                    <Form.Item
                                        className="input-col"
                                        label="Đối tượng"
                                        name="doi_tuong"
                                        rules={[]}
                                    >
                                            <TextEditorWidget2
                                                placeholder="Đối tượng"
                                                showToolbar={true}
                                                isMinHeight200={true}
                                                isSimple={false}
                                            />
                                    </Form.Item>
                                </Card>

                                {/* Detailed Content */}
                                <Card style={{marginBottom: 8}}>
                                    <Form.Item
                                        className="input-col"
                                        label="Nội dung chi tiết"
                                        name="noi_dung_chi_tiet"
                                        rules={[]}
                                    >
                                            <TextEditorWidget2
                                                placeholder="Nội dung chi tiết"
                                                showToolbar={true}
                                                isMinHeight200={true}
                                                isSimple={false}
                                            />
                                    </Form.Item>
                                </Card>

                                {/* Class Scheduling */}
                                <Card style={{marginBottom: 8}}>
                                    <Form.Item
                                        className="input-col"
                                        label="Xếp lớp thời gian"
                                        name="xep_lop_thoi_gian"
                                        rules={[]}
                                    >
                                            <TextEditorWidget2
                                                placeholder="Xếp lớp thời gian"
                                                showToolbar={true}
                                                isMinHeight200={true}
                                                isSimple={false}
                                            />
                                    </Form.Item>
                                </Card>

                                {/* Course Price */}
                                <Card style={{marginBottom: 8}}>
                                    <Form.Item
                                            className="input-col"
                                            label="Giá gốc (Nhập liền không dấu. Ví dụ: 10000)"
                                            name="gia_goc"
                                            rules={[
                                            ]}
                                        >
                                                {/* <Input placeholder='Giá gốc'/> */}
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                placeholder="Giá gốc"
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                            />
                                        </Form.Item>
                                </Card>
                            </Col>

                        {/* Right Sidebar */}
                        <Col xs={24} lg={8}>
                            <Card title="Khung chương trình" style={{ marginBottom: "16px" }}>
                                <Form.Item name="kct_id" label="Chương trình" 
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Khung chương trình là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    {renderProgrammes()}
                                </Form.Item>
                            </Card>

                            {state.isShowTypeCourse && 
                                <Card title="Loại khóa học" style={{ marginBottom: "16px" }}>
                                    <Form.Item name="lkh_id"
                                        rules={[
                                            {
                                                required: state.isShowTypeCourse,
                                                message: 'Loại khóa học là trường bắt buộc.',
                                            },
                                        ]}
                                    >
                                        <Radio.Group options={constants.TYPE_COURSES}  />  
                                    </Form.Item>
                                </Card>
                            }

                            <Card title="Ngày bắt đầu / ngày kết thúc khóa học" style={{ marginBottom: "16px" }}>
                                <Form.Item 
                                    className="input-col"
                                    label=""
                                    name="ngay_bat_dau"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Ngày bắt đầu / ngày kết thúc là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    <RangePicker
                                        format="YYYY-MM-DD"
                                        onChange={onChangeStart}
                                        locale={{
                                            lang: {
                                            locale: 'en_US',
                                            rangePlaceholder: ['Từ ngày', 'Đến ngày'],
                                            },
                                        }}
                                    />
                                </Form.Item>   
                            </Card>

                            <Card title="Trạng thái khóa học" style={{ marginBottom: "16px" }}>
                                <Form.Item className="input-col" 
                                    name="trang_thai" rules={[]} initialValue={true}
                                >
                                    <Select disabled={!state.isEdit}
                                        placeholder="Chọn trạng thái"
                                    >
                                        <Option value={true} >Đang hoạt động</Option>
                                        <Option value={false} >Đã dừng</Option>
                                    </Select>
                                </Form.Item>
                            </Card>
                        </Col>
                    </Row>

                    {/* Bottom Actions */}
                    <Row justify="space-between" 
                        style={{ borderRadius: 6, background: '#fff', marginTop: "24px", padding: "16px 0", borderTop: "1px solid #f0f0f0" }}
                    >
                        <Col>
                        </Col>
                        <Col>
                            <Space>
                                <Button onClick={() => {
                                    // reset form to default values
                                    form.resetFields();
                                    setState({
                                        ...state,
                                        form: formDefault,
                                        fileImg: '',
                                        isEdit: false,
                                        courseData: {},
                                        isShowTypeCourse: false
                                    });
                                    if (state.isEdit) {
                                        history.push('/teacher/course-management');
                                    }
                                }}>
                                    Huỷ bỏ
                                </Button>
                                <Button style={{marginRight: 12}} 
                                    type="primary" htmlType="submit"
                                >
                                    {(state.isEdit) ? 'Cập nhật' : 'Thêm mới'}   
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>

            </Layout>
        </div>
    )
}

export default FormCourse
