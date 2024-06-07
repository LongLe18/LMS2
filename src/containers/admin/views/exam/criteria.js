import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

// component
import { Row, Col, Table, notification, Button, Space, Form, InputNumber, Select, Modal } from 'antd';
import LoadingCustom from 'components/parts/loading/Loading';
import AppFilter from 'components/common/AppFilter';
import { PlusOutlined } from '@ant-design/icons';

// redux
import * as criteriaAction from '../../../../redux/actions/criteria';
import * as courseAction from '../../../../redux/actions/course';
import * as moduleAction from '../../../../redux/actions/part';
import * as thematicAction from '../../../../redux/actions/thematic';
import { useSelector, useDispatch } from "react-redux"; 

const { Option } = Select;

const Criteria = () => {
    const [form] = Form.useForm();
    const [formOnline] = Form.useForm();
    const dataCriteriaCourse = [];
    const dataCriteriaModule = [];
    const dataCriteriaThematic = [];
    const dataCriteriaOnline = [];
    const dispatch = useDispatch();

    const [numberExams, setNumberOfItems] = useState(1);
    const [course, setCourse] = useState(false);
    const [module, setModule] = useState(false);
    const [thematic, setThematic] = useState(false);
    const [require, setRequire] = useState({
        isEdit: false,
        course: false,
        module: false,
        thematic: false,
    });
    const [state, setState] = useState({
        khoa_hoc_id: '',
        mo_dun_id: '',
        idCriteria: '',
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisibleOnline, setIsModalVisibleOnline] = useState(false);

    const handleNumberExamChange = (value) => {
        setNumberOfItems(value);
      };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };
    
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const showModalOnline = () => {
        setIsModalVisibleOnline(true);
    };

    const handleOkOnline = () => {
        setIsModalVisibleOnline(false);
    };
    
    const handleCancelOnline = () => {
        setIsModalVisibleOnline(false);
    };

    const criteriaCourse = useSelector(state => state.criteria.listCourse.result);
    const loadingCourse = useSelector(state => state.criteria.listCourse.loading);

    const criteriaModule = useSelector(state => state.criteria.listModule.result);
    const loadingModule = useSelector(state => state.criteria.listModule.loading);

    const criteriaThematic = useSelector(state => state.criteria.listThematic.result);
    const loadingThematic = useSelector(state => state.criteria.listThematic.loading);

    const criteriaOnline = useSelector(state => state.criteria.listOnline.result);
    const loadingOnline = useSelector(state => state.criteria.listOnline.loading);

    const courses = useSelector(state => state.course.list.result);
    const loadingcourses = useSelector(state => state.course.list.loading);
    const modules = useSelector(state => state.part.list.result);
    const loadingmodules = useSelector(state => state.part.list.loading);
    // const thematics = useSelector(state => state.thematic.listbyId.result);
    // const loadingthematics = useSelector(state => state.thematic.listbyId.loading);

    useEffect(() => {
        dispatch(criteriaAction.getCriteriasCourse());
        dispatch(criteriaAction.getCriteriasOnline());
        dispatch(criteriaAction.getCriteriasModule());
        dispatch(criteriaAction.getCriteriasThematic());
        dispatch(courseAction.getCourses({ idkct: '', status: '', search: '' }));

    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const columns = [
        {
            title: 'Tên khóa học',
            dataIndex: 'ten_khoa_hoc',
            key: 'ten_khoa_hoc',
            responsive: ['md'],
        },
        {
            title: 'Số câu hỏi',
            dataIndex: 'so_cau_hoi',
            key: 'so_cau_hoi',
            responsive: ['md'],
        },
        {
            title: 'Thời gian thi',
            dataIndex: 'thoi_gian',
            key: 'thoi_gian',
            responsive: ['md'],
        },
        {
            title: 'Yêu cầu',
            dataIndex: 'yeu_cau',
            key: 'yeu_cau',
            responsive: ['md'],
        },
        {
            title: 'Số lần thi',
            dataIndex: 'so_lan_thi',
            key: 'so_lan_thi',
            responsive: ['md'],
        },
        {
            title: 'Tùy chọn',
            key: 'tcdth_khoa_hoc_id',
            dataIndex: 'tcdth_khoa_hoc_id',
            // Redirect view for edit
            render: (tcdth_khoa_hoc_id) => (
                <Space size="middle">
                <Button  type="button" onClick={() => EditCriteriaCourse(tcdth_khoa_hoc_id)} className="ant-btn ant-btn-round ant-btn-primary">Sửa</Button>
                <Button shape="round" type="danger" onClick={() => DeleteCriteriaCourse(tcdth_khoa_hoc_id)} >Xóa</Button> 
                </Space>
            ),
        },
    ];

    const columns2 = [
        {
            title: 'Tên mô đun',
            dataIndex: 'ten_mo_dun',
            key: 'ten_mo_dun',
            responsive: ['md'],
        },
        {
            title: 'Số câu hỏi',
            dataIndex: 'so_cau_hoi',
            key: 'so_cau_hoi',
            responsive: ['md'],
        },
        {
            title: 'Thời gian thi',
            dataIndex: 'thoi_gian',
            key: 'thoi_gian',
            responsive: ['md'],
        },
        {
            title: 'Yêu cầu',
            dataIndex: 'yeu_cau',
            key: 'yeu_cau',
            responsive: ['md'],
        },
        {
            title: 'Số lần thi',
            dataIndex: 'so_lan_thi',
            key: 'so_lan_thi',
            responsive: ['md'],
        },
        {
            title: 'Tùy chọn',
            key: 'tcdmd_khoa_hoc_id',
            dataIndex: 'tcdmd_khoa_hoc_id',
            // Redirect view for edit
            render: (tcdmd_khoa_hoc_id) => (
                <Space size="middle">
                <Button  type="button" onClick={() => EditCriteriaModule(tcdmd_khoa_hoc_id)} className="ant-btn ant-btn-round ant-btn-primary">Sửa</Button>
                <Button shape="round" type="danger" onClick={() => DeleteCriteriaModule(tcdmd_khoa_hoc_id)} >Xóa</Button> 
                </Space>
            ),
        },
    ];

    const columns3 = [
        {
            title: 'Tên mô đun',
            dataIndex: 'ten_mo_dun',
            key: 'ten_mo_dun',
            responsive: ['md'],
        },
        {
            title: 'Số câu hỏi',
            dataIndex: 'so_cau_hoi',
            key: 'so_cau_hoi',
            responsive: ['md'],
        },
        {
            title: 'Thời gian thi',
            dataIndex: 'thoi_gian',
            key: 'thoi_gian',
            responsive: ['md'],
        },
        {
            title: 'Yêu cầu',
            dataIndex: 'yeu_cau',
            key: 'yeu_cau',
            responsive: ['md'],
        },
        {
            title: 'Số lần thi',
            dataIndex: 'so_lan_thi',
            key: 'so_lan_thi',
            responsive: ['md'],
        },
        {
            title: 'Tùy chọn',
            key: 'tcdcd_mo_dun_id',
            dataIndex: 'tcdcd_mo_dun_id',
            // Redirect view for edit
            render: (tcdcd_mo_dun_id) => (
                <Space size="middle">
                <Button  type="button" onClick={() => EditCriteriaThematic(tcdcd_mo_dun_id)} className="ant-btn ant-btn-round ant-btn-primary">Sửa</Button>
                <Button shape="round" type="danger" onClick={() => DeleteCriteriaThematic(tcdcd_mo_dun_id)} >Xóa</Button> 
                </Space>
            ),
        },
    ];

    const columns4 = [
        {
            title: 'Tên khóa học',
            dataIndex: 'ten_khoa_hoc',
            key: 'ten_khoa_hoc',
            responsive: ['md'],
        },
        {
            title: 'Số phần',
            dataIndex: 'so_phan',
            key: 'so_phan',
            responsive: ['md'],
        },
        {
            title: 'Tổng số câu hỏi',
            dataIndex: 'so_cau_hoi',
            key: 'so_cau_hoi',
            responsive: ['md'],
        },
        {
            title: 'Tổng thời gian thi',
            dataIndex: 'thoi_gian',
            key: 'thoi_gian',
            responsive: ['md'],
        },
        {
            title: 'Số câu hỏi phần 1',
            dataIndex: 'so_cau_hoi_phan_1',
            key: 'so_cau_hoi_phan_1',
            responsive: ['md'],
        },
        {
            title: 'Yêu cầu phần 1',
            dataIndex: 'yeu_cau_phan_1',
            key: 'yeu_cau_phan_1',
            responsive: ['md'],
        },
        {
            title: 'Thời gian phần 1',
            dataIndex: 'thoi_gian_phan_1',
            key: 'thoi_gian_phan_1',
            responsive: ['md'],
        },
        {
            title: 'Số câu hỏi phần 2',
            dataIndex: 'so_cau_hoi_phan_2',
            key: 'so_cau_hoi_phan_2',
            responsive: ['md'],
        },
        {
            title: 'Yêu cầu phần 2',
            dataIndex: 'yeu_cau_phan_2',
            key: 'yeu_cau_phan_2',
            responsive: ['md'],
        },
        {
            title: 'Thời gian phần 2',
            dataIndex: 'thoi_gian_phan_2',
            key: 'thoi_gian_phan_2',
            responsive: ['md'],
        },
        {
            title: 'Số câu hỏi phần 3',
            dataIndex: 'so_cau_hoi_phan_3',
            key: 'so_cau_hoi_phan_3',
            responsive: ['md'],
        },
        {
            title: 'Yêu cầu phần 3',
            dataIndex: 'yeu_cau_phan_3',
            key: 'yeu_cau_phan_3',
            responsive: ['md'],
        },
        {
            title: 'Thời gian phần 3',
            dataIndex: 'thoi_gian_phan_3',
            key: 'thoi_gian_phan_3',
            responsive: ['md'],
        },
        {
            title: 'Số câu hỏi phần 4',
            dataIndex: 'so_cau_hoi_phan_4',
            key: 'so_cau_hoi_phan_4',
            responsive: ['md'],
        },
        {
            title: 'Yêu cầu phần 4',
            dataIndex: 'yeu_cau_phan_4',
            key: 'yeu_cau_phan_4',
            responsive: ['md'],
        },
        {
            title: 'Thời gian phần 4',
            dataIndex: 'thoi_gian_phan_4',
            key: 'thoi_gian_phan_4',
            responsive: ['md'],
        },
        {
            title: 'Tùy chọn',
            key: 'idtieu_chi_de_thi_online',
            dataIndex: 'idtieu_chi_de_thi_online',
            // Redirect view for edit
            render: (idtieu_chi_de_thi_online) => (
                <Space size="middle">
                <Button  type="button" onClick={() => EditCriteriaOnline(idtieu_chi_de_thi_online)} className="ant-btn ant-btn-round ant-btn-primary">Sửa</Button>
                <Button shape="round" type="danger" onClick={() => DeleteCriteriaOnline(idtieu_chi_de_thi_online)} >Xóa</Button> 
                </Space>
            ),
        },
    ];

    if (criteriaCourse.status === 'success' && criteriaModule.status === 'success' && criteriaThematic.status) {
        criteriaCourse.data.map((item, index) => dataCriteriaCourse.push({...item, 'key': index}));
        criteriaModule.data.map((item, index) => dataCriteriaModule.push({...item, 'key': index}));
        criteriaThematic.data.map((item, index) => dataCriteriaThematic.push({...item, 'key': index}));
        criteriaOnline.data.map((item, index) => dataCriteriaOnline.push({...item, 'key': index}));
    };

    const EditCriteriaCourse = (id) => {
        const callback = (res) => {
            if (res.status === 'success') {
                form.setFieldsValue(res.data);
                showModal();
                setCourse(true);
                setModule(false);
                setThematic(false);
                setRequire({...state, course: true, module: false, thematic: false, isEdit: true});
            }
        };
        setState({...state, idCriteria: id});
        dispatch(criteriaAction.getCriteriaCourse({ id: id }, callback))
    };

    const EditCriteriaModule = (id) => {
        const callback = (res) => {
            if (res.status === 'success') {
                form.setFieldsValue(res.data);
                showModal();
                setCourse(false);
                setModule(true);
                setThematic(false);
                setRequire({...state, course: true, module: true, thematic: false, isEdit: true});
            }
        };
        setState({...state, idCriteria: id});
        dispatch(criteriaAction.getCriteriaModule({ id: id }, callback))
    };

    const EditCriteriaThematic = (id) => {
        const callback = (res) => {
            if (res.status === 'success') {
                form.setFieldsValue(res.data);
                showModal();
                setCourse(false);
                setModule(false);
                setThematic(true);
                setRequire({...state, course: true, module: true, thematic: true, isEdit: true});
            }
        };
        setState({...state, idCriteria: id});
        dispatch(criteriaAction.getCriteriaThematicById({ id: id }, callback))
    };

    const EditCriteriaOnline = (id) => {
        const callback = (res) => {
            if (res.status === 'success') {
                setNumberOfItems(res.data.so_phan)
                formOnline.setFieldsValue(res.data);
                showModalOnline();
                setRequire({...state, isEdit: true});
            }
        };
        setState({...state, idCriteria: id});
        dispatch(criteriaAction.getCriteriaOnline({ id: id }, callback))
    };

    const DeleteCriteriaCourse = (id) => {
        const result = window.confirm('Bạn có chắc chán muốn xóa tiêu chí này?');
        if (result) {
          const callback = (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                dispatch(criteriaAction.getCriteriasCourse());
                notification.success({
                    message: 'Thành công',
                    description: 'Xóa tiêu chí thành công',
                })
            } else {
              notification.error({
                message: 'Thông báo',
                description: 'Xóa tiêu chí mới thất bại',
              })
            };
          }
          dispatch(criteriaAction.deleteCriteriaCourse({ id: id }, callback))
        }
    };

    const DeleteCriteriaModule = (id) => {
        const result = window.confirm('Bạn có chắc chán muốn xóa tiêu chí này?');
        if (result) {
          const callback = (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
            dispatch(criteriaAction.getCriteriasModule());         
                notification.success({
                    message: 'Thành công',
                    description: 'Xóa tiêu chí thành công',
                })
            } else {
              notification.error({
                message: 'Thông báo',
                description: 'Xóa tiêu chí mới thất bại',
              })
            };
          }
          dispatch(criteriaAction.deleteCriteriaModule({ id: id }, callback))
        }
    };

    const DeleteCriteriaThematic = (id) => {
        const result = window.confirm('Bạn có chắc chán muốn xóa tiêu chí này?');
        if (result) {
          const callback = (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                dispatch(criteriaAction.getCriteriasThematic());
                notification.success({
                    message: 'Thành công',
                    description: 'Xóa tiêu chí thành công',
                })
            } else {
              notification.error({
                message: 'Thông báo',
                description: 'Xóa tiêu chí mới thất bại',
              })
            };
          }
          dispatch(criteriaAction.deleteCriteriaThematic({ id: id }, callback))
        }
    };

    const createCriteria = (values) => {
        const callback = (res) => {
            if (res.status === 200 && res.statusText === 'OK') {
                form.resetFields();
                if (course) dispatch(criteriaAction.getCriteriasCourse());
                else if (module) dispatch(criteriaAction.getCriteriasModule());
                else if (thematic) dispatch(criteriaAction.getCriteriasThematic());
                if (!require.isEdit) {
                    notification.success({
                        message: 'Thành công',
                        description: 'Thêm tiêu chí mới thành công',
                    })
                } else {
                    notification.success({
                        message: 'Thành công',
                        description: 'Sửa thông tin tiêu chí thành công',
                    })
                }
                setIsModalVisible(false);
            } else {
                if (!require.isEdit) {
                    if (res.response.data.message === 'already exist') {
                        notification.error({
                            message: 'Thông báo',
                            description: 'Đã tồn tại tiếu chí',
                        })
                    } else {
                        notification.error({
                            message: 'Thông báo',
                            description: 'Thêm mới tiêu chí thất bại' + res.response.data.message,
                        })
                    }
                } else {
                    notification.error({
                        message: 'Thông báo',
                        description: 'Sửa tiếu chí thất bại',
                    })
                }
            }
        };

        let dataSubmit = {
            "so_cau_hoi": values.so_cau_hoi,
            "thoi_gian": values.thoi_gian,
            "yeu_cau": values.yeu_cau,
            "so_lan_thi": values.so_lan_thi,
        };

        if (!require.isEdit) {
            if (course) {
                dataSubmit.khoa_hoc_id = values.khoa_hoc_id;
                dispatch(criteriaAction.createCriteriaCourse(dataSubmit, callback));
            } else if (module) {
                dataSubmit.mo_dun_id = values.mo_dun_id;
                dispatch(criteriaAction.createCriteriaModule(dataSubmit, callback));
            } else if (thematic) {
                dataSubmit.mo_dun_id = values.mo_dun_id;
                dispatch(criteriaAction.createCriteriaThematic(dataSubmit, callback));
            }
        } else {
            if (course) {
                dataSubmit.khoa_hoc_id = values.khoa_hoc_id;
                dispatch(criteriaAction.editCriteriaCourse({ id: state.idCriteria, formData: dataSubmit}, callback));
            } else if (module) {
                dataSubmit.mo_dun_id = values.mo_dun_id;
                dispatch(criteriaAction.editCriteriaModule({ id: state.idCriteria, formData: dataSubmit}, callback));
            } else if (thematic) {
                dataSubmit.mo_dun_id = values.mo_dun_id;
                dispatch(criteriaAction.editCriteriaThematic({ id: state.idCriteria, formData: dataSubmit}, callback));
            }
        }   
    };

    const createOrupdateCriteriaOnline = (values) => {
        const callback = (res) => {
            if (res.status === 200 && res.statusText === 'OK') {
                formOnline.resetFields();
                dispatch(criteriaAction.getCriteriasOnline());
                if (!require.isEdit) {
                    notification.success({
                        message: 'Thành công',
                        description: 'Thêm tiêu chí mới thành công',
                    })
                } else {
                    notification.success({
                        message: 'Thành công',
                        description: 'Sửa thông tin tiêu chí thành công',
                    })
                }
                setIsModalVisibleOnline(false);
            } else {
                if (!require.isEdit) {
                    if (res.response.data.message === 'already exist') {
                        notification.error({
                            message: 'Thông báo',
                            description: 'Đã tồn tại tiếu chí',
                        })
                    } else {
                        notification.error({
                            message: 'Thông báo',
                            description: 'Thêm mới tiêu chí thất bại' + res.response.data.message,
                        })
                    }
                } else {
                    notification.error({
                        message: 'Thông báo',
                        description: 'Sửa tiếu chí thất bại',
                    })
                }
            }
        };

        let dataSubmit = {
            "so_phan": values.so_phan,
            "khoa_hoc_id": values.khoa_hoc_id,
            "so_cau_hoi": 0,
            "thoi_gian": 0,
        };

        Array.from({ length: numberExams }).map((_, index) => {
            dataSubmit[`so_cau_hoi_phan_${index + 1}`] = values[`so_cau_hoi_phan_${index + 1}`];
            dataSubmit[`thoi_gian_phan_${index + 1}`] = values[`thoi_gian_phan_${index + 1}`];
            dataSubmit[`yeu_cau_phan_${index + 1}`] = values[`yeu_cau_phan_${index + 1}`];
            dataSubmit.so_cau_hoi = dataSubmit.so_cau_hoi + values[`so_cau_hoi_phan_${index + 1}`];
            dataSubmit.thoi_gian = dataSubmit.thoi_gian + values[`thoi_gian_phan_${index + 1}`];
            return null;
        })
        

        if (!require.isEdit) {
            dispatch(criteriaAction.createCriteriaOnline(dataSubmit, callback));
        } else {
            dispatch(criteriaAction.editCriteriaOnline({ id: state.idCriteria, formData: dataSubmit}, callback));
        }   
    };

    const DeleteCriteriaOnline = (id) => {
        const result = window.confirm('Bạn có chắc chán muốn xóa tiêu chí này?');
        if (result) {
          const callback = (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                dispatch(criteriaAction.getCriteriasOnline());
                notification.success({
                    message: 'Thành công',
                    description: 'Xóa tiêu chí thành công',
                })
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: 'Xóa tiêu chí thất bại',
                })
            };
          }
          dispatch(criteriaAction.deleteCriteriaOnline({ id: id }, callback))
        }
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
                showSearch={false} value={state.courseId}
                loading={loadingcourses}
                onChange={(khoa_hoc_id) => {
                    setState({khoa_hoc_id, ...state, isChanged: true })
                    dispatch(moduleAction.getModulesByIdCourse({ idCourse: khoa_hoc_id }))
                }}
                placeholder="Chọn khóa học"
            >
                {options}
            </Select>
        );
    };

    const renderModules = () => {
        let options = [];
        if (modules.status === 'success') {
            options = modules.data.map((module) => (
                <Option key={module.mo_dun_id} value={module.mo_dun_id} >{module.ten_mo_dun}</Option>
            ))
        }
        return (
            <Select
                showSearch={false}
                loading={loadingmodules}
                onChange={(mo_dun_id) => {
                    setState({...state, isChanged: true, mo_dun_id: mo_dun_id });
                    dispatch(thematicAction.getThematicsByIdModule({ idModule: mo_dun_id }))
                }}
                placeholder="Chọn mô đun"
            >
                {options}
            </Select>
        );
    };

    // const renderThematics = () => {
    //     let options = [];
    //     if (thematics.status === 'success') {
    //         options = thematics.data.thematics.map((thematic) => (
    //             <Option key={thematic.chuyen_de_id} value={thematic.chuyen_de_id} >{thematic.ten_chuyen_de}</Option>
    //         ))
    //     }
    //     return (
    //         <Select
    //             showSearch={false} value={state.courseId}
    //             loading={loadingthematics}
    //             onChange={(khoa_hoc_id) => setState({khoa_hoc_id, ...state, isChanged: true })}
    //             placeholder="Chọn chuyên đề"
    //         >
    //             {options}
    //         </Select>
    //     );
    // };
    
    const renderModal = () => {
        return(
            <Row>
                <Col xl={24} sm={24} xs={24} className="cate-form-block">
                    {(course && !require.isEdit) ? <h5>Thêm mới tiêu chí đề thi tổng hợp</h5> : (module && !require.isEdit) ? <h5>Thêm mới tiêu chí đề thi mô đun</h5> : (thematic && !require.isEdit) ?<h5>Thêm mới tiêu chí đề thi chuyên đề</h5> : ''}
                    {(course && require.isEdit) ? <h5>Sửa thông tin tiêu chí đề thi tổng hợp</h5> : (module && require.isEdit) ? <h5>Sửa thông tin tiêu chí đề thi mô đun</h5> : (thematic && require.isEdit) ? <h5>Sửa thông tin tiêu chí đề thi chuyên đề</h5> : ''}
                    <Form layout="vertical" className="category-form" form={form} autoComplete="off" onFinish={createCriteria}>
                        <Row gutter={25}>
                            <Col xl={12} sm={24} xs={24} className="left-content">
                                <Form.Item
                                    className="input-col"
                                    label="Số câu hỏi"
                                    name="so_cau_hoi"
                                    rules={[
                                        {
                                        required: true,
                                        message: 'Số câu hỏi là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    <InputNumber placeholder="" style={{width: "100%"}}/>
                                </Form.Item>
                                <Form.Item
                                    className="input-col"
                                    label="Thời gian"
                                    name="thoi_gian"
                                    rules={[
                                        {
                                        required: true,
                                        message: 'Thời gian là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    <InputNumber placeholder="" style={{width: "100%"}}/>
                                </Form.Item>
                                
                            </Col>
                            <Col xl={12} sm={24} xs={24} className="right-content">
                                <Form.Item
                                    className="input-col"
                                    label="Số lần thi"
                                    name="so_lan_thi"
                                    rules={[
                                        {
                                        required: true,
                                        message: 'Số lần thi là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    <InputNumber placeholder="" style={{width: "100%"}}/>
                                </Form.Item>
                                <Form.Item
                                    className="input-col"
                                    label="Yêu cầu"
                                    name="yeu_cau"
                                    rules={[
                                        {
                                        required: true,
                                        message: 'Yêu cầu là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    <InputNumber placeholder="" style={{width: "100%"}}/>
                                </Form.Item>
                                {/* <Form.Item style={{display: require.thematic ? '' : 'none'}}
                                    className="input-col"
                                    label="Chuyên đề"
                                    name="chuyen_de_id"
                                    rules={[
                                        {
                                            required: require.thematic,
                                            message: 'Chuyên đề là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    {renderThematics()}
                                </Form.Item> */}
                                
                            </Col>
                            <Col xl={24} sm={24} xs={24}>
                                <Form.Item
                                    className="input-col"
                                    label="Khóa học"
                                    name="khoa_hoc_id"
                                    rules={[
                                        {
                                            required: require.course,
                                            message: 'Khóa học là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    {renderCourses()}
                                </Form.Item>
                            </Col>
                            <Col xl={24} sm={24} xs={24}>
                                <Form.Item style={{display: require.module ? '' : 'none'}}
                                    className="input-col"
                                    label="Mô đun"
                                    name="mo_dun_id"
                                    rules={[
                                        {
                                            required: require.module,
                                            message: 'Mô đun là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    {renderModules()}
                                </Form.Item>
                            </Col>
                            <Form.Item className="button-col" style={{textAlign: 'right'}}>
                                {!require.isEdit ? <Button shape="round" type="primary" htmlType="submit" >Thêm mới</Button> : <Button shape="round" type="primary" htmlType="submit" >Cập nhật</Button>}                             
                            </Form.Item>
                            <span style={{color: 'red', display: require.thematic ? '' : 'none'}}>* Các chuyên đề cùng mô-đun có tiêu chí giống nhau</span>
                        </Row>                                     
                    </Form>
                </Col>
            </Row>
        )
    }

    const renderModalOnline = () => {
        return (
            <Row>
                <Col xl={24} sm={24} xs={24} className="cate-form-block">
                    {require.isEdit ? <h5>Sửa thông tin tiêu chí đề thi online</h5> : <h5>Thêm mới tiêu chí đề thi online</h5>}
                    <Form layout="vertical" className="category-form" form={formOnline} autoComplete="off" onFinish={createOrupdateCriteriaOnline}>
                        <Row gutter={25}>
                            <Col xl={24} sm={24} xs={24} className="left-content">
                                <Form.Item
                                    className="input-col"
                                    label="Số phần thi"
                                    name="so_phan"
                                    rules={[
                                        {
                                        required: true,
                                        message: 'Số phần thi là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    <InputNumber placeholder="" style={{width: "100%"}} max={4} min={1} onChange={handleNumberExamChange}/>
                                </Form.Item>
                            </Col>
                            
                            {Array.from({ length: numberExams }).map((_, index) => (
                                <>
                                <Col xl={8} sm={24} xs={24} >
                                    <Form.Item
                                        className="input-col"
                                        label={`Số câu hỏi phần ${index + 1}`}
                                        name={`so_cau_hoi_phan_${index + 1}`}
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Số câu hỏi là trường bắt buộc.',
                                            },
                                        ]}
                                    >
                                        <InputNumber placeholder="" style={{width: "100%"}}/>
                                    </Form.Item>
                                </Col>
                                <Col xl={8} sm={24} xs={24} >
                                    <Form.Item
                                        className="input-col"
                                        label={`Thời gian phần ${index + 1}`}
                                        name={`thoi_gian_phan_${index + 1}`}
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Thời gian là trường bắt buộc.',
                                            },
                                        ]}
                                    >
                                        <InputNumber placeholder="" style={{width: "100%"}}/>
                                    </Form.Item>   
                                </Col>
                                <Col xl={8} sm={24} xs={24} >
                                    <Form.Item
                                        className="input-col"
                                        label={`Yêu cầu phần ${index + 1}`}
                                        name={`yeu_cau_phan_${index + 1}`}
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Yêu cầu là trường bắt buộc.',
                                            },
                                        ]}
                                    >
                                        <InputNumber placeholder="" style={{width: "100%"}}/>
                                    </Form.Item>
                                </Col>
                                </>
                            ))}
                            
                            <Col xl={24} sm={24} xs={24}>
                                <Form.Item
                                    className="input-col"
                                    label="Khóa học"
                                    name="khoa_hoc_id"
                                    rules={[
                                        {
                                            required: require.course,
                                            message: 'Khóa học là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    {renderCourses()}
                                </Form.Item>
                            </Col>
                            <Form.Item className="button-col" style={{textAlign: 'right'}}>
                                {!require.isEdit ? <Button shape="round" type="primary" htmlType="submit" >Thêm mới</Button> : <Button shape="round" type="primary" htmlType="submit" >Cập nhật</Button>}                             
                            </Form.Item>
                        </Row>                                     
                    </Form>
                </Col>
            </Row>
        )
    }

    return (
        <>
        {(loadingCourse && loadingModule && loadingThematic && loadingOnline) && <LoadingCustom />}
        {(criteriaCourse.status === 'success' && criteriaModule.status === 'success' && criteriaThematic.status === 'success') &&
            <div className='content'>
                <Helmet>
                    <title>Quản lý tiêu chí đề thi</title>
                </Helmet>
                <Row className="app-main">
                    <Col xl={24} className="body-content">
                        <AppFilter
                            title="Tiêu chí đề thi tổng hợp"
                        />
                    </Col>
                </Row>
                <Row className="select-action-group" gutter={[8, 8]}>
                    <Col xl={12} sm={12} xs={24}></Col>
                    <Col xl={12} sm={12} xs={24} className="right-actions">
                        <Button shape="round" type="primary" icon={<PlusOutlined />} className=" btn-action" onClick={() => {
                                form.resetFields();
                                showModal();
                                setCourse(true);
                                setModule(false);
                                setThematic(false);
                                setRequire({...state, course: true, module: false, thematic: false, isEdit: false});
                        }}>
                            Thêm mới tiêu chí
                        </Button>
                    </Col>
                </Row>
                <Table className="table-striped-rows" columns={columns} dataSource={dataCriteriaCourse}></Table>

                <Row className="app-main">
                    <Col xl={24} className="body-content">
                        <Row>
                            <Col xl={24} sm={24} xs={24}>
                                <AppFilter
                                    title="Tiêu chí đề thi mô đun"
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="select-action-group" gutter={[8, 8]}>
                    <Col xl={12} sm={12} xs={24}></Col>
                    <Col xl={12} sm={12} xs={24} className="right-actions">
                        <Button shape="round" type="primary" icon={<PlusOutlined />} className=" btn-action" onClick={() => {
                            showModal();
                            form.resetFields();
                            setCourse(false);
                            setModule(true);
                            setThematic(false);
                            setRequire({...state, course: true, module: true, thematic: false, isEdit: false});

                        }}>
                            Thêm mới tiêu chí
                        </Button>
                    </Col>
                </Row>
                <Table className="table-striped-rows" columns={columns2} dataSource={dataCriteriaModule}></Table>

                <Row className="app-main">
                    <Col xl={24} className="body-content">
                        <Row>
                            <Col xl={24} sm={24} xs={24}>
                                <AppFilter
                                    title="Tiêu chí đề thi chuyên đề"
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="select-action-group" gutter={[8, 8]}>
                    <Col xl={12} sm={12} xs={24}></Col>
                    <Col xl={12} sm={12} xs={24} className="right-actions">
                        <Button shape="round" type="primary" icon={<PlusOutlined />} className=" btn-action" onClick={() => {
                            showModal();
                            form.resetFields();
                            setCourse(false);
                            setModule(false);
                            setThematic(true);
                            setRequire({...state, course: true, module: true, thematic: true, isEdit: false});
                        }}>
                            Thêm mới tiêu chí
                        </Button>
                    </Col>
                </Row>
                <Table className="table-striped-rows" columns={columns3} dataSource={dataCriteriaThematic}></Table>
                    
                <Row className="app-main">
                    <Col xl={24} className="body-content">
                        <Row>
                            <Col xl={24} sm={24} xs={24}>
                                <AppFilter
                                    title="Tiêu chí đề thi online"
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="select-action-group" gutter={[8, 8]}>
                    <Col xl={12} sm={12} xs={24}></Col>
                    <Col xl={12} sm={12} xs={24} className="right-actions">
                        <Button shape="round" type="primary" icon={<PlusOutlined />} className=" btn-action" onClick={() => {
                            showModalOnline();
                            formOnline.resetFields();
                            setRequire({...state, isEdit: false});
                        }}>
                            Thêm mới tiêu chí
                        </Button>
                    </Col>
                </Row>
                <Table className="table-striped-rows" columns={columns4} dataSource={dataCriteriaOnline}></Table>

                <Modal visible={isModalVisible}  mask={true} centered={true} className="cra-exam-modal" wrapClassName="cra-exam-modal-container"
                    onOk={handleOk} 
                    onCancel={handleCancel}
                    maskStyle={{ background: 'rgba(0, 0, 0, 0.8)' }}
                    maskClosable={false}
                    footer={null}>
                    {renderModal()}
                </Modal>

                <Modal visible={isModalVisibleOnline}  mask={true} centered={true} className="cra-exam-modal" wrapClassName="cra-exam-modal-container"
                    onOk={handleOkOnline} 
                    onCancel={handleCancelOnline}
                    maskStyle={{ background: 'rgba(0, 0, 0, 0.8)' }}
                    maskClosable={false}
                    width={600}
                    footer={null}>
                    {renderModalOnline()}
                </Modal>

            </div>
        }
        </>
    )
}

export default Criteria;