
import { useState, useEffect } from "react"
import { Card, Select, Button, Table, Space, Typography, 
    Form, Tooltip, Row, Col, InputNumber, Modal, Pagination,
    notification, } from "antd"
import {
  PlusOutlined, ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import axios from 'axios';
import config from '../../../../configs/index';

import * as criteriaAction from '../../../../redux/actions/criteria';
import * as courseAction from '../../../../redux/actions/course';
import * as moduleAction from '../../../../redux/actions/part';
import * as thematicAction from '../../../../redux/actions/thematic';
import { useSelector, useDispatch } from "react-redux"; 

const { Title } = Typography
const { Option } = Select
const { confirm } = Modal;

const CriteriaManagement = () => {
    const dispatch = useDispatch();
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [addCriteriaForm] = Form.useForm()

    const [state, setState] = useState({
        khoa_hoc_id: '',
        mo_dun_id: '',
        idCriteria: '',
        activeTab: 'comprehensive'
    });

    const [filter, setFilter] = useState({
        khoa_hoc_id: '',
    });
    const [course, setCourse] = useState(false);
    const [module, setModule] = useState(false);
    const [thematic, setThematic] = useState(false);
    const [isPublish, setIsPublish] = useState(false);
    const [require, setRequire] = useState({
        isEdit: false,
        course: true,
        module: false,
        thematic: false,
    });

    const courses = useSelector(state => state.course.list.result);
    const modules = useSelector(state => state.part.list.result);
    const criteriaExamCourse = useSelector(state => state.criteria.listCourse.result);
    const criteriaExamModule = useSelector(state => state.criteria.listModule.result);
    const criteriaExamThematic = useSelector(state => state.criteria.listThematic.result);

    useEffect(() => {
        dispatch(courseAction.getCoursesByTeacher({ status: '', search: '', 
                lkh_id: '', pageIndex: 1, pageSize: 999999999 }));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (state.activeTab === 'comprehensive') {
            dispatch(criteriaAction.getCriteriasCourse({ khoa_hoc_id: filter.khoa_hoc_id, pageSize: pageSize, pageIndex: pageIndex }));
            setRequire({ ...require, course: true, module: false, thematic: false });
            setCourse(true);
            setModule(false);
            setThematic(false);
        } else if (state.activeTab === 'chapter') {
            dispatch(criteriaAction.getCriteriasModule({ khoa_hoc_id: filter.khoa_hoc_id, pageSize: pageSize, pageIndex: pageIndex }));
            setRequire({ ...require, course: true, module: true, thematic: false });
            setCourse(false);
            setModule(true);
            setThematic(false);
        } else if (state.activeTab === 'topic') {
            dispatch(criteriaAction.getCriteriasThematic({ khoa_hoc_id: filter.khoa_hoc_id, pageSize: pageSize, pageIndex: pageIndex }));
            setRequire({ ...require, course: true, module: true, thematic: true });
            setCourse(false);
            setModule(false);
            setThematic(true);
        }
    }, [state.activeTab, pageIndex, pageSize, filter]); // eslint-disable-line react-hooks/exhaustive-deps

    // hàm gọi API kiểm tra tiêu chí đã có đề xuất bản hay chưa
    const checkCriteria = (type, id) => {
        let url = ''
        switch (type) {
            case '1': // tiêu chí đề tổng hợp
                url = `${config.API_URL}/synthetic_criteria/${id}/quantity-exam-publish`;
                break;
            case '2': // tiêu chí đề mô đun
                url = `${config.API_URL}/modun_criteria/${id}/quantity-exam-publish`
                break;
            case '3': // tiêu chí đề chuyên đề
                url = `${config.API_URL}/thematic_criteria/${id}/quantity-exam-publish`
                break;
            default:
                break;
        }
        axios({
            method: 'get',
            url,
            timeout: 1000 * 60 * 5,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('userToken')}`,
            },
        }).then(res => {
            if (res.status === 200 && res.statusText === 'OK') {
                if (res.data.data > 0) setIsPublish(true);
            } else {
                notification.error({
                    message: 'Lỗi',
                    description: 'Có lỗi xảy ra khi lấy dữ liệu',
                })
            }
        }).catch(error => notification.error({ message: error.message }));
    }

    const columns = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            width: 60,
            align: "center",
            render: (text, record, index) => index + 1,
        },
        {
            title: "Tên khóa học",
            dataIndex: "ten_khoa_hoc",
            key: "ten_khoa_hoc",
            width: 300,
            align: "left",
            render: (text, record) => (
                <span>{record?.khoa_hoc?.ten_khoa_hoc}</span>
            ),
        },
        {
            title: "Số câu hỏi",
            dataIndex: "so_cau_hoi",
            key: "so_cau_hoi",
            width: 120,
            align: "center",
        },
        {
            title: "Thời gian thi",
            dataIndex: "thoi_gian",
            key: "thoi_gian",
            width: 120,
            align: "center",
        },
        {
            title: "Yêu cầu",
            dataIndex: "yeu_cau",
            key: "yeu_cau",
            width: 100,
            align: "center",
        },
        {
            title: "Số lần thi",
            dataIndex: "so_lan_thi",
            key: "so_lan_thi",
            width: 120,
            align: "center",
        },
        {
            title: "Thao tác",
            key: "tcdth_khoa_hoc_id",
            dataIndex: 'tcdth_khoa_hoc_id',
            width: 120,
            align: "center",
            render: (tcdth_khoa_hoc_id) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} size="small" onClick={() => EditCriteria(tcdth_khoa_hoc_id, '1')} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button type="text" icon={<DeleteOutlined />} size="small" danger onClick={() => DeleteCriteria(tcdth_khoa_hoc_id)}/>
                    </Tooltip>
                </Space>
            ),
        },
    ]

    const columnsModun = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            width: 60,
            align: "center",
            render: (text, record, index) => index + 1,
        },
        {
            title: "Tên mô đun",
            dataIndex: "ten_mo_dun",
            key: "ten_mo_dun",
            width: 300,
            align: "left",
            render: (text, record) => (
                <span>{record?.mo_dun?.ten_mo_dun}</span>
            ),
        },
        {
            title: "Tên khóa học",
            dataIndex: "ten_khoa_hoc",
            key: "ten_khoa_hoc",
            width: 300,
            align: "left",
            render: (text, record) => (
                <span>{record?.mo_dun?.khoa_hoc?.ten_khoa_hoc}</span>
            ),
        },
        {
            title: "Số câu hỏi",
            dataIndex: "so_cau_hoi",
            key: "so_cau_hoi",
            width: 120,
            align: "center",
        },
        {
            title: "Thời gian thi",
            dataIndex: "thoi_gian",
            key: "thoi_gian",
            width: 120,
            align: "center",
        },
        {
            title: "Yêu cầu",
            dataIndex: "yeu_cau",
            key: "yeu_cau",
            width: 100,
            align: "center",
        },
        {
            title: "Số lần thi",
            dataIndex: "so_lan_thi",
            key: "so_lan_thi",
            width: 120,
            align: "center",
        },
        {
            title: "Thao tác",
            key: "tcdmd_khoa_hoc_id",
            dataIndex: 'tcdmd_khoa_hoc_id',
            width: 120,
            align: "center",
            render: (tcdmd_khoa_hoc_id) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} size="small" onClick={() => EditCriteria(tcdmd_khoa_hoc_id, '2')} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button type="text" icon={<DeleteOutlined />} size="small" danger onClick={() => DeleteCriteria(tcdmd_khoa_hoc_id)}/>
                    </Tooltip>
                </Space>
            ),
        },
    ]

    const columnsThematic = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            width: 60,
            align: "center",
            render: (text, record, index) => index + 1,
        },
        {
            title: "Tên mô đun",
            dataIndex: "ten_mo_dun",
            key: "ten_mo_dun",
            width: 300,
            align: "left",
            render: (text, record) => (
                <span>{record?.mo_dun?.ten_mo_dun}</span>
            ),
        },
        {
            title: "Tên khóa học",
            dataIndex: "ten_khoa_hoc",
            key: "ten_khoa_hoc",
            width: 300,
            align: "left",
            render: (text, record) => (
                <span>{record?.mo_dun?.khoa_hoc?.ten_khoa_hoc}</span>
            ),
        },
        {
            title: "Số câu hỏi",
            dataIndex: "so_cau_hoi",
            key: "so_cau_hoi",
            width: 120,
            align: "center",
        },
        {
            title: "Thời gian thi",
            dataIndex: "thoi_gian",
            key: "thoi_gian",
            width: 120,
            align: "center",
        },
        {
            title: "Yêu cầu",
            dataIndex: "yeu_cau",
            key: "yeu_cau",
            width: 100,
            align: "center",
        },
        {
            title: "Số lần thi",
            dataIndex: "so_lan_thi",
            key: "so_lan_thi",
            width: 120,
            align: "center",
        },
        {
            title: "Thao tác",
            key: "tcdcd_mo_dun_id",
            dataIndex: 'tcdcd_mo_dun_id',
            width: 120,
            align: "center",
            render: (tcdcd_mo_dun_id) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} size="small" onClick={() => EditCriteria(tcdcd_mo_dun_id, '3')} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button type="text" icon={<DeleteOutlined />} size="small" danger onClick={() => DeleteCriteria(tcdcd_mo_dun_id)}/>
                    </Tooltip>
                </Space>
            ),
        },
    ]

    const EditCriteria = (id, type) => {
        const callback = (res) => {
            if (res.status === 'success') {
                checkCriteria(type, id);  // check tiêu chí đã có đề xuất bản hay chưa
                addCriteriaForm.setFieldsValue(res.data);
                if (type === '2' || type === '3')
                    addCriteriaForm.setFieldValue('khoa_hoc_id', res.data.mo_dun?.khoa_hoc_id);
                showModal();
            }
        };
        setState({...state, idCriteria: id});
        if (type === '1') { // Tiêu chí đề thi tổng hợp
            dispatch(criteriaAction.getCriteriaCourse({ id: id }, callback))
            setCourse(true);
            setModule(false);
            setThematic(false);
            setRequire({...state, course: true, module: false, thematic: false, isEdit: true});
        } else if (type === '2') { // Tiêu chí đề thi chương học
            dispatch(criteriaAction.getCriteriaModule({ id: id }, callback))
            setCourse(false);
            setModule(true);
            setThematic(false);
            setRequire({...state, course: true, module: true, thematic: false, isEdit: true});
        } else if (type === '3') { // Tiêu chí đề thi chuyên đề
            dispatch(criteriaAction.getCriteriaThematicById({ id: id }, callback))
            setCourse(false);
            setModule(false);
            setThematic(true);
            setRequire({...state, course: true, module: true, thematic: true, isEdit: true});
        }
    };

    const renderCourses = () => {
        let options = [];
        options = courses?.data?.map((course) => (
            <Option key={course.khoa_hoc_id} value={course.khoa_hoc_id} >{course.ten_khoa_hoc}</Option>
        ));
        return (
            <Select style={{width: '100%'}}
                maxTagCount="responsive"
                showSearch={true}
                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                allowClear={true}
                onChange={(value) => {
                    setFilter({ ...filter, khoa_hoc_id: value });
                    dispatch(moduleAction.getModulesByIdCourse({ idCourse: value !== undefined ? value : '' }));
                }}
                placeholder="Danh mục khóa học"
            >
                <Option key={''} value={''}>Tất cả khóa học</Option>
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

    const tabItems = [
        {
            key: "comprehensive",
            label: "Tiêu chí đề thi tổng hợp",
            title: "Danh sách tiêu chí đề thi tổng hợp",
        },
        {
            key: "chapter",
            label: "Tiêu chí đề thi chương học",
            title: "Danh sách tiêu chí đề thi chương học",
        },
        {
            key: "topic",
            label: "Tiêu chí đề thi chuyên đề",
            title: "Danh sách tiêu chí đề thi chuyên đề",
        },
    ]

    const showModal = () => {
        setIsModalVisible(true)
    }

    const handleCancel = () => {
        setIsModalVisible(false)
        setIsPublish(false);
        setFilter({ ...filter, khoa_hoc_id: '' })
        addCriteriaForm.resetFields()
    }

    // Handle form submission
    const handleSubmit = () => {
        addCriteriaForm
        .validateFields()
        .then((values) => {
            
            if (state.activeTab === 'comprehensive') { // Tiêu chí đề thi tổng hợp
                if (require.isEdit) {
                    dispatch(criteriaAction.editCriteriaCourse({id: state.idCriteria, formData: values}, () => {
                        notification.success({
                            message: "Cập nhật tiêu chí thành công",
                        })
                        handleCancel()
                        dispatch(criteriaAction.getCriteriasCourse({ khoa_hoc_id: filter.khoa_hoc_id, pageSize: pageSize, pageIndex: pageIndex }));
                    }))
                } else {
                    dispatch(criteriaAction.createCriteriaCourse(values, () => {
                        notification.success({
                            message: "Thêm tiêu chí thành công",
                        })
                        handleCancel();
                        dispatch(criteriaAction.getCriteriasCourse({ khoa_hoc_id: filter.khoa_hoc_id, pageSize: pageSize, pageIndex: pageIndex }));
                    }))
                }
            } else if (state.activeTab === 'chapter') { // Tiêu chí đề thi chương học
                if (require.isEdit) {
                    dispatch(criteriaAction.editCriteriaModule({id: state.idCriteria, formData: values}, () => {
                        notification.success({
                            message: "Cập nhật tiêu chí thành công",
                        })
                        handleCancel()
                        dispatch(criteriaAction.getCriteriasModule({ khoa_hoc_id: filter.khoa_hoc_id, pageSize: pageSize, pageIndex: pageIndex }));
                    }))
                } else {
                    dispatch(criteriaAction.createCriteriaModule(values, () => {
                        notification.success({
                            message: "Thêm tiêu chí thành công",
                        })
                        handleCancel();
                        dispatch(criteriaAction.getCriteriasModule({ khoa_hoc_id: filter.khoa_hoc_id, pageSize: pageSize, pageIndex: pageIndex }));
                    }))
                }
            } else if (state.activeTab === 'topic') { // Tiêu chí đề thi chuyên đề
                if (require.isEdit) {
                    dispatch(criteriaAction.editCriteriaThematic({id: state.idCriteria, formData: values}, () => {
                        notification.success({
                            message: "Cập nhật tiêu chí thành công",
                        })
                        handleCancel()
                        dispatch(criteriaAction.getCriteriasThematic({ khoa_hoc_id: filter.khoa_hoc_id, pageSize: pageSize, pageIndex: pageIndex }));
                    }))
                } else {
                    dispatch(criteriaAction.createCriteriaThematic(values, () => {
                        notification.success({
                            message: "Thêm tiêu chí thành công",
                        })
                        handleCancel();
                        dispatch(criteriaAction.getCriteriasThematic({ khoa_hoc_id: filter.khoa_hoc_id, pageSize: pageSize, pageIndex: pageIndex }));
                    }))
                }
            }

          
        })
        .catch((info) => {
            console.log("Validate Failed:", info)
        })
    }

    // Xóa tiêu chí đề thi tổng hợp
    const DeleteCriteria = (id) => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn xóa tiêu chí này?',
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk() {
                const callback = (res) => {
                    if (res.statusText === 'OK' && res.status === 200) {
                        if (state.activeTab === 'comprehensive') // Tiêu chí đề thi tổng hợp
                        {
                            dispatch(criteriaAction.getCriteriasCourse({ khoa_hoc_id: filter.khoa_hoc_id, pageSize: pageSize, pageIndex: pageIndex }));
                        } else if (state.activeTab === 'chapter') // Tiêu chí đề thi chương học
                        {
                            dispatch(criteriaAction.getCriteriasModule({ khoa_hoc_id: filter.khoa_hoc_id, pageSize: pageSize, pageIndex: pageIndex })); 
                        } else if (state.activeTab === 'topic') // Tiêu chí đề thi chuyên đề
                        {
                            dispatch(criteriaAction.getCriteriasThematic({ khoa_hoc_id: filter.khoa_hoc_id, pageSize: pageSize, pageIndex: pageIndex }));
                        }
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
                if (state.activeTab === 'comprehensive') // Tiêu chí đề thi tổng hợp
                {
                    dispatch(criteriaAction.deleteCriteriaCourse({ id: id }, callback))
                } else if (state.activeTab === 'chapter') // Tiêu chí đề thi chương học
                {
                    dispatch(criteriaAction.deleteCriteriaModule({ id: id }, callback))
                } else if (state.activeTab === 'topic') // Tiêu chí đề thi chuyên đề
                {
                    dispatch(criteriaAction.deleteCriteriaThematic({ id: id }, callback))
                }
            },
        });
    };

    // Get current tab title
    const getCurrentTabTitle = () => {
        const currentTab = tabItems.find((tab) => tab.key === state.activeTab)
        return currentTab ? currentTab.title : "Danh sách tiêu chí đề thi"
    }

    // Handle tab change
    const handleTabChange = (tabKey) => {
        setState(() => ({ ...state, activeTab: tabKey }))
        setPageIndex(1) // Reset to first page when changing tabs
    }

    // event thay đổi trang
    const onChange = (page) => {
        setPageIndex(page);
    };

    // event đổi pageSize
    const onShowSizeChange = (current, pageSize) => {
        setPageSize(pageSize)
    };

    return (
        <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Card style={{ borderRadius: "8px", marginTop: 24 }}>
                {/* Custom Tabs */}
                <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                        {tabItems.map((item) => (
                            <Button
                                key={item.key}
                                type={state.activeTab === item.key ? "primary" : "default"}
                                style={{
                                    backgroundColor: state.activeTab === item.key ? "#ff4d4f" : "#f5f5f5",
                                    borderColor: state.activeTab === item.key ? "#ff4d4f" : "#d9d9d9",
                                    color: state.activeTab === item.key ? "#fff" : "#8c8c8c",
                                    borderRadius: "6px",
                                    height: "40px",
                                    fontWeight: "500",
                                }}
                                onClick={() => handleTabChange(item.key)}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>

                    {/* Dynamic Title */}
                    <Title level={4} style={{ marginBottom: "24px", color: "#262626" }}>
                        {getCurrentTabTitle()}
                    </Title>

                    {/* Filters and Actions */}
                    <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "24px" }}>
                        <Col xs={24} sm={12} md={12}>
                            {renderCourses()}
                        </Col>
                        <Col xs={24} sm={12} md={12}>
                            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    style={{
                                        backgroundColor: "#4c6ef5",
                                        borderColor: "#4c6ef5",
                                        height: "40px",
                                        borderRadius: "6px",
                                    }}
                                    onClick={showModal}
                                >
                                    Thêm tiêu chí
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </div>

                {/* Data Table */}
                {(() => {
                    let tableColumns;
                    let tableDataSource;
                    if (state.activeTab === 'comprehensive') {
                        tableColumns = columns;
                        tableDataSource = criteriaExamCourse?.data;
                    } else if (state.activeTab === 'chapter') {
                        tableColumns = columnsModun;
                        tableDataSource = criteriaExamModule?.data;
                    } else {
                        tableColumns = columnsThematic;
                        tableDataSource = criteriaExamThematic?.data;
                    }
                    return (
                        <Table
                            columns={tableColumns}
                            dataSource={tableDataSource}
                            pagination={false}
                            scroll={{ x: 1000 }}
                            size="middle"
                            style={{
                                "& .ant-table-thead > tr > th": {
                                    backgroundColor: "#fafafa",
                                    fontWeight: 600,
                                    color: "#262626",
                                    borderBottom: "1px solid #f0f0f0",
                                },
                                "& .ant-table-tbody > tr:hover > td": {
                                    backgroundColor: "#f5f5f5",
                                },
                            }}
                        />
                    );
                })()}
                {(() => {
                    let totalCount;
                    if (state.activeTab === 'comprehensive') {
                        totalCount = criteriaExamCourse?.totalCount;
                    } else if (state.activeTab === 'chapter') {
                        totalCount = criteriaExamModule?.totalCount;
                    } else {
                        totalCount = criteriaExamThematic?.totalCount;
                    }
                    return (
                        <Pagination showSizeChanger style={{marginTop: 8}}
                            onShowSizeChange={onShowSizeChange} 
                            current={pageIndex} 
                            pageSize={pageSize} 
                            onChange={onChange} 
                            total={totalCount}
                        />
                    );
                })()}
            </Card>

            {/* modal exam modun */}
            <Modal
                title={(!require.isEdit && course) ? "Thêm mới tiêu chí đề thi tổng hợp" : (!require.isEdit && module) ? "Thêm mới tiêu chí đề thi chương học" : (!require.isEdit && thematic) ? "Thêm mới tiêu chí đề thi chuyên đề" 
                    : (require.isEdit && course) ? "Cập nhật tiêu chí đề thi tổng hợp" : (require.isEdit && module) ? "Cập nhật tiêu chí đề thi chương học" : (require.isEdit && thematic) ? "Cập nhật tiêu chí đề thi chuyên đề" : ""}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
                maskClosable={false}
                destroyOnClose
                closeIcon={<span style={{ fontSize: "16px" }}>×</span>}
            >
                <Form form={addCriteriaForm} layout="vertical" style={{ marginTop: "20px" }}>
                    <Form.Item
                        name="khoa_hoc_id"
                        label={"Khóa học"}
                        rules={[{ required: require.course, message: "Vui lòng chọn khóa học" }]}
                    >
                        {renderCourses()}
                    </Form.Item>

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

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="so_cau_hoi"
                                label={"Số câu hỏi"}
                                rules={[{ required: true, message: "Vui lòng nhập số câu hỏi" }]}
                            >
                                <InputNumber disabled={isPublish} style={{ width: "100%" }} min={0} placeholder="Nhập số câu hỏi" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                        <Form.Item
                            name="so_lan_thi"
                            label={"Số lần thi"}
                            rules={[{ required: true, message: "Vui lòng nhập số lần thi" }]}
                        >
                            <InputNumber disabled={isPublish} style={{ width: "100%" }} min={0} placeholder="Nhập số lần thi tối đa được phép thi" />
                        </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="thoi_gian"
                                label={"Thời gian"}
                                rules={[{ required: true, message: "Vui lòng nhập thời gian" }]}
                            >
                                <InputNumber disabled={isPublish} style={{ width: "100%" }} min={0} placeholder="Nhập thời gian" addonAfter="Phút" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                        <Form.Item
                            name="yeu_cau"
                            label={"Yêu cầu"}
                            rules={[{ required: true, message: "Vui lòng nhập yêu cầu" }]}
                        >
                            <InputNumber disabled={isPublish} style={{ width: "100%" }} min={0} placeholder="Nhập yêu cầu đạt đề thi" />
                        </Form.Item>
                        </Col>
                    </Row>

                    <span style={{color: 'red', display: thematic ? 'block' : 'none'}}>* Các chuyên đề cùng mô-đun có tiêu chí giống nhau</span>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Button
                                block
                                size="large"
                                onClick={handleCancel}
                                className="btn-cancel"
                            >
                                Huỷ bỏ
                            </Button>
                        </Col>
                        <Col span={12}>
                            <Button
                                block
                                type="primary"
                                size="large"
                                onClick={handleSubmit}
                                className="btn-add"
                            >
                                Xác nhận
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    )
}

export default CriteriaManagement
