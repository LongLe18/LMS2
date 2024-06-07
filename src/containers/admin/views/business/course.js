import React, { useEffect, useMemo, useState } from "react";

// helper
import config from '../../../../configs/index';
import defaultImage from 'assets/img/default.jpg';
import moment from "moment";

// component
import AppFilter from "components/common/AppFilter";
import LoadingCustom from 'components/parts/loading/Loading';
import { Table, Button, Row, Col, notification, Space, Avatar, Form, Select, Input } from 'antd';
import TextEditorWidget2 from "components/common/TextEditor/TextEditor2";

// redux
import * as courseAction from '../../../../redux/actions/course';
import * as programmeAction from '../../../../redux/actions/programme';
import * as descriptionAction from '../../../../redux/actions/descriptionCourse';
import { useSelector, useDispatch } from "react-redux";

// hooks
import useDebounce from "hooks/useDebounce";

const { Option } = Select;

const BussinessCourses = (props) => {
    
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    const [state, setState] = useState({
        idDescription: 1,
        isEdit: false,
        dataCourse: [],
    })

    const courses = useSelector(state => state.course.list.result);
    const programmes = useSelector(state => state.programme.list.result);

    const description = useSelector(state => state.descriptionCourse.item.result);
    const loading = useSelector(state => state.descriptionCourse.item.loading);

    const [filter, setFilter] = useState({
        trang_thai: 2,
        search: '',
        start: '',
        end: '',
    });
    const searchValue = useDebounce(filter.search, 250);

    const columns = [
        {
            title: 'Ảnh đại diện',
            dataIndex: 'anh_dai_dien',
            key: 'anh_dai_dien',
            responsive: ['lg'],
            render: (src) => (
              <Avatar src={src !== null ? config.API_URL + src : defaultImage} size={50} shape='circle' />
            )
        },
        {
          title: 'Tên khóa học',
          dataIndex: 'ten_khoa_hoc',
          key: 'ten_khoa_hoc',
          responsive: ['md'],
        },
        {
          title: 'Khung chương trình',
          dataIndex: 'ten_khung_ct',
          key: 'ten_khung_ct',
          responsive: ['md'],
        },
        {
          title: 'Ngày bắt đầu',
          dataIndex: 'ngay_bat_dau',
          key: 'ngay_bat_dau',
          responsive: ['md'],
          render: (date) => (
            moment(date).utc(7).format(config.DATE_FORMAT_SHORT)
          )
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'ngay_ket_thuc',
            key: 'ngay_ket_thuc',
            responsive: ['md'],
            render: (date) => (
              moment(date).utc(7).format(config.DATE_FORMAT_SHORT)
            )
        },
        {
          title: 'Tùy chọn',
          key: 'khoa_hoc_id',
          dataIndex: 'khoa_hoc_id',
          // Redirect view for edit
          render: (khoa_hoc_id) => (
            <Space size="middle">
              <Button  type="button" onClick={() => goToDetail(khoa_hoc_id)} className="ant-btn ant-btn-round ant-btn-primary">Xem</Button>
              <Button  type="button" onClick={() => EditDescription(khoa_hoc_id)} className="ant-btn ant-btn-round ant-btn-primary">Sửa</Button>
            </Space>
          ),
        },
    ];

    const goToDetail = (id) => {
        window.open(config.BASE_URL + `/luyen-tap/gioi-thieu-khoa-hoc/${id}`, '_blank');
    }

    useEffect(() => {
        const callback = (res) => {
            let temp = [];
            if (res.status === 'success') {
                const subCallback = (subRes) => {
                    if (subRes.status === 'success') {
                        res.data.map((item, index) => {
                            subRes.data.map((subItem, subIntex) => {
                                if (item.khoa_hoc_id === subItem.khoa_hoc_id) {
                                    temp.push({...item, key: subIntex})
                                }
                                return null;
                            });
                            return null;
                        });
                    }
                    setState({...state, dataCourse: temp})
                }
                dispatch(descriptionAction.getDescriptionCourses({}, subCallback)) 
            };
        }
        dispatch(programmeAction.getProgrammes({ status: '' }));
        dispatch(courseAction.filterCourses({ status: '', search: filter.search, start: filter.start, end: filter.end}, callback));

    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const onFilterChange = (field, value) => {
        if (field === 'ngay') {
          setFilter((state) => ({ ...state, start: value[0] }));  
          setFilter((state) => ({ ...state, end: value[1] }));  
        }
        else {
          setFilter((state) => ({ ...state, [field]: value }));  
        }
    };
    
    const callbackFilter = (res) => {
        let temp = [];
        if (res.status === 'success') {
            const subCallback = (subRes) => {
                if (subRes.status === 'success') {
                    res.data.map((item, index) => {
                        subRes.data.map((subItem, subIntex) => {
                            if (item.khoa_hoc_id === subItem.khoa_hoc_id) {
                                temp.push({...item, key: subIntex})
                            }
                            return null;
                        });
                        return null;
                    });
                }
                setState({...state, dataCourse: temp})
            }
            dispatch(descriptionAction.getDescriptionCourses({}, subCallback)) 
        };
    }

    useEffect(() => {
        dispatch(courseAction.filterCourses({ status: filter.trang_thai === 2 ? '' : filter.trang_thai, search: filter.search,
            start: filter.start, end: filter.end }, callbackFilter));
    }, [filter.trang_thai, filter.start, filter.end]); // eslint-disable-line react-hooks/exhaustive-deps

    useMemo(() => {
        dispatch(courseAction.filterCourses({ status: filter.trang_thai === 2 ? '' : filter.trang_thai, search: filter.search,
            start: filter.start, end: filter.end }, callbackFilter));
    }, [searchValue]); // eslint-disable-line react-hooks/exhaustive-deps

    const renderProgrammes = () => {
        
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
                onChange={(kct_id) => dispatch(courseAction.getCourses({ idkct: kct_id, status: '', search: filter.search }))}
            >
            {options}
            </Select>
        );
    };

    const renderCourses = () => {
        let options = [];
        if (courses.status === 'success') {
            options = courses.data.map((course) => (
                <Option key={course.khoa_hoc_id} value={course.khoa_hoc_id} >{course.ten_khoa_hoc}</Option>
            ))
        }
        return (
            <Select
            showSearch={false}
            placeholder="Chọn khóa học"
            >
                {options}
            </Select>
        );
    };

    const EditDescription = (idCourse) => {
        const callback = (res) => {
            if (res.status === 'success') {
                if (res.data === null) form.setFieldsValue({'khoa_hoc_id': idCourse});
                form.setFieldsValue(res.data);
                document.getElementsByClassName('cate-form-block')[0].scrollIntoView();
            }
        }
        form.resetFields();
        dispatch(descriptionAction.getDescriptionCourse({ id: idCourse }, callback));
        setState({ ...state, idDescription: idCourse, isEdit: true });
    };  

    const cancelEdit = () => {
        setState({ ...state, isEdit: false })
        form.resetFields();
    };

    const submitForm = (values) => {
        const callback = (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                form.resetFields();
                setState({ ...state, isEdit: false });
                dispatch(courseAction.filterCourses({ status: filter.trang_thai === 2 ? '' : filter.trang_thai, search: filter.search,
                    start: filter.start, end: filter.end }, (res) => {
                        if (res.status === 'success') {
                            let temp = [];
                            const subCallback = (subRes) => {
                                if (subRes.status === 'success') {
                                    res.data.map((item, index) => {
                                        subRes.data.map((subItem, subIntex) => {
                                            if (item.khoa_hoc_id === subItem.khoa_hoc_id) {
                                                temp.push({...item, key: subIntex})
                                            }
                                            return null;
                                        });
                                        return null;
                                    });
                                }
                                setState({...state, dataCourse: temp})
                            }
                            dispatch(descriptionAction.getDescriptionCourses({}, subCallback)) 
                        };
                    }));
                notification.success({
                    message: 'Thành công',
                    description: state.isEdit ?  'Sửa mô tả khóa học thành công' : 'Thêm mô tả khóa học mới thành công',
                })
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: state.isEdit ? 'Sửa mô tả khóa học thất bại' : 'Thêm mô tả khóa học mới thất bại',
                })
            }
        };

        const dataSubmit = {
            khoa_hoc_id: values.khoa_hoc_id,
            mo_ta_chung: values.mo_ta_chung !== undefined ? values.mo_ta_chung : '',
            gioi_thieu: values.gioi_thieu !== undefined ? values.gioi_thieu : '',
            hinh_thuc_dao_tao: values.hinh_thuc_dao_tao !== undefined ? values.hinh_thuc_dao_tao : '',
            muc_tieu_cam_ket: values.muc_tieu_cam_ket !== undefined ? values.muc_tieu_cam_ket : '',
            doi_tuong: values.doi_tuong !== undefined ? values.doi_tuong : '',
            noi_dung_chi_tiet: values.noi_dung_chi_tiet !== undefined ? values.noi_dung_chi_tiet : '',
            xep_lop_thoi_gian: values.xep_lop_thoi_gian !== undefined ? values.xep_lop_thoi_gian : '',
            gia_goc: values.gia_goc !== undefined ? values.gia_goc : '',
        };
        if (state.isEdit) {
            dispatch(descriptionAction.EditDescriptionCourse({ idCourse: state.idDescription, formData: dataSubmit }, callback));
        } else {
            dispatch(descriptionAction.CreateDescriptionCourse(dataSubmit, callback))
        }
    };
    
    return (
        <>
            <div className="content">
                <Row className="app-main">
                    <Col xl={24} className="body-content">
                        <Row>
                            <Col xl={24} sm={24} xs={24}>
                                <AppFilter
                                title="Danh sách khóa học"
                                isShowCourse={false}
                                isShowModule={false}
                                isShowThematic={false}
                                isShowStatus={true}
                                isShowSearchBox={true}
                                isShowDatePicker={true}
                                isRangeDatePicker={true}
                                courses={courses.data}
                                onFilterChange={(field, value) => onFilterChange(field, value)}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                {state.dataCourse.length > 0 && 
                    <Table className="table-striped-rows" columns={columns} dataSource={state.dataCourse} />
                }
                <Row>
                    <Col xl={24} sm={24} xs={24} className="cate-form-block">
                        {loading && <LoadingCustom/>}  
                        {(state.isEdit && description.status === 'success' && description) ? <h5>Sửa thông tin mô tả khóa học</h5> : <h5>Thêm mới mô tả khóa học</h5>}  
                        <Form layout="vertical" className="category-form" form={form} autoComplete="off" onFinish={submitForm}>  
                            <Form.Item initialValue={1}
                                className="input-col"
                                label="Khung chương trình"
                                name="kct_id"
                                rules={[
                                    {
                                    required: true,
                                    message: 'Khung chương trình là trường bắt buộc.',
                                    },
                                ]}
                                >
                                    {renderProgrammes()}
                            </Form.Item>
                            <Form.Item
                                className="input-col"
                                label="Khóa học"
                                name="khoa_hoc_id"
                                rules={[
                                    {
                                    required: true,
                                    message: 'Khóa học là trường bắt buộc.',
                                    },
                                ]}
                                >
                                    {renderCourses()}
                            </Form.Item>
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
                            <Form.Item
                                className="input-col"
                                label="Giá gốc (Nhập liền không dấu. Ví dụ: 10000)"
                                name="gia_goc"
                                rules={[]}
                                >
                                    <Input placeholder='Giá gốc'/>
                            </Form.Item>
                            <Form.Item className="button-col">
                                <Space>
                                    <Button shape="round" type="primary" htmlType="submit" >
                                        {(state.isEdit && description.status === 'success' && description) ? 'Cập nhật' : 'Thêm mới'}   
                                    </Button>
                                    {(state.isEdit && description.status === 'success' && description) 
                                    ?   <Button shape="round" type="danger" onClick={() => cancelEdit()} > 
                                            Hủy bỏ
                                        </Button>
                                    : ''}    
                                </Space>    
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </div>
        </>
    )
};

export default BussinessCourses;