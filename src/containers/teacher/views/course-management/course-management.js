import { useState, useEffect } from "react"
import axios from 'axios';
import moment from "moment";
import config from '../../../../configs/index';
import { Card, Row, Col, Input, Select, Button, Table, Tag, Space, 
    Typography, Avatar, Tooltip, Pagination, notification, Modal } from "antd"
import {
    SearchOutlined,
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    BookOutlined,
} from "@ant-design/icons"
import imageStudy from 'assets/img/image-study.png';
import imageBook from 'assets/img/image-book.png';
import imageNote from 'assets/img/image-note.png';
import imageUser from 'assets/img/image-user.png';
import { useHistory } from 'react-router-dom';

import * as courseAction from '../../../../redux/actions/course';
import { useSelector, useDispatch } from "react-redux";
import constants from '../../../../helpers/constants';

const { Title } = Typography
const { Option } = Select

const CourseManagement = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filter, setFilter] = useState({
        trang_thai: '',
        search: '',
        lkh_id: ''
    });
    const [dashboardData, setDashboardData] = useState();

    const courses = useSelector(state => state.course.list.result);
    
    const getDashboardData = async () => {
        axios.get(config.API_URL + '/course/dashboard-by-teacher', {headers: {Authorization: `Bearer ${localStorage.getItem('userToken')}`}})
        .then(
            res => {
                if (res.status === 200 && res.statusText === 'OK') {
                    setDashboardData(res?.data?.data[0])
                } else {
                    notification.error({
                        message: 'Lỗi',
                        description: 'Có lỗi xảy ra khi lấy dữ liệu thống kê',
                    })
                }
            }
        )
        .catch(error => notification.error({ message: error.message }));
    };

    useEffect(() => {
        getDashboardData();
    }, []);
    
    // Event xoá khoá học
    const handleDeleteCourse = (courseId) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chán muốn xóa khóa học này?',
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk() {
                const callback = (res) => {
                    if (res.statusText === 'OK' && res.status === 200) {
                        dispatch(courseAction.getCoursesByTeacher({ status: filter.trang_thai, search: filter.search, 
                            lkh_id: filter.lkh_id, pageIndex: pageIndex, pageSize: pageSize }));
                        notification.success({
                            message: 'Thành công',
                            description: 'Xóa khóa học thành công',
                        })
                    } else {
                        notification.error({
                            message: 'Thông báo',
                            description: 'Xóa khóa học mới thất bại',
                        })
                    };
                }
            dispatch(courseAction.DeleteCourse({ idLesson: courseId }, callback))
            },
        });
    }

    useEffect(() => {
        dispatch(courseAction.getCoursesByTeacher({ status: filter.trang_thai, search: filter.search, 
        lkh_id: filter.lkh_id, pageIndex: pageIndex, pageSize: pageSize }));
    }, [pageIndex, pageSize, filter]); // eslint-disable-line react-hooks/exhaustive-deps

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
            width: 200,
        },
        {
            title: "Loại khóa học",
            dataIndex: "loai_khoa_hoc",
            key: "loai_khoa_hoc",
            width: 180,
            render: (text, record) => (
                record?.loai_khoa_hoc?.ten
            )
        },
        {
            title: "Số Chương học",
            dataIndex: "so_luong_modun",
            key: "so_luong_modun",
            width: 120,
            align: "center",
        },
        {
            title: "Số chuyên đề",
            dataIndex: "so_luong_chuyen_de",
            key: "so_luong_chuyen_de",
            width: 120,
            align: "center",
        },
        {
            title: "Số học viên",
            dataIndex: "so_luong_hoc_vien",
            key: "so_luong_hoc_vien",
            width: 120,
            align: "center",
        },
        {
            title: "Thời gian học",
            dataIndex: "ngay_bat_dau",
            key: "ngay_bat_dau",
            width: 180,
            render: (text, record) => (
                <span>
                    {moment(record.ngay_bat_dau).utc(7).format(config.DATE_FORMAT_SHORT)} - {moment(record.ngay_ket_thuc).utc(7).format(config.DATE_FORMAT_SHORT)}
                </span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            key: "trang_thai",
            width: 120,
            render: (status) => (
                <Tag color={status === true ? "green" : "red"}>{status === true ? "Hoạt động" : "Tạm dừng"}</Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 120,
            align: "center",
            render: (record) => (
                <Space>
                    <Tooltip title="Quản lý lớp học">
                        <Button type="text" icon={<BookOutlined />}
                            size="small"
                            onClick={() => {
                                const dataPath = JSON.parse(localStorage.getItem('dataPath')) || [];
                                dataPath.push({
                                    title: record.ten_khoa_hoc,
                                    path: `/teacher/class-management/${record?.khoa_hoc_id}`
                                });
                                localStorage.setItem('dataPath', JSON.stringify(dataPath));
                                history.push(`/teacher/class-management/${record?.khoa_hoc_id}`)
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EyeOutlined />}
                            size="small"
                            onClick={() => {
                                const dataPath = JSON.parse(localStorage.getItem('dataPath')) || [];
                                dataPath.push({
                                    title: record.ten_khoa_hoc,
                                    path: `/teacher/detail-course/${record?.khoa_hoc_id}`
                                });
                                localStorage.setItem('dataPath', JSON.stringify(dataPath));
                                history.push(`/teacher/detail-course/${record?.khoa_hoc_id}`)
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} 
                            size="small" 
                            onClick={() => history.push(`/teacher/form-course/${record?.khoa_hoc_id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button type="text" icon={<DeleteOutlined />} size="small" danger onClick={() => handleDeleteCourse(record?.khoa_hoc_id)}/>
                    </Tooltip>
                </Space>
            ),
        },
    ]

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
            <Title level={3} style={{ marginBottom: "24px", marginTop: '24px', color: "#262626" }}>
                Danh sách khóa học
            </Title>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{ borderRadius: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Avatar size={48} style={{ background: "linear-gradient(180deg, rgba(41, 43, 142, 0.1) 0%, rgba(41, 43, 142, 0.3) 100%)", marginRight: "12px" }} 
                                icon={<img src={imageStudy} alt="imageStudy" style={{width: '100%'}}/>} 
                                />
                            <div>
                                <div style={{ fontSize: "24px", fontWeight: 500, color: "#242424" }}>{dashboardData?.so_khoa_hoc}</div>
                                <div style={{ color: "#242424", fontSize: "14px", fontWeight: 400 }}>Số lượng khóa học</div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{ borderRadius: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Avatar size={48} style={{ background: "linear-gradient(180deg, rgba(41, 43, 142, 0.1) 0%, rgba(41, 43, 142, 0.3) 100%)", marginRight: "12px" }} 
                                icon={<img src={imageBook} alt="imageBook" style={{width: '100%'}}/>} 
                            />
                            <div>
                                <div style={{ fontSize: "24px", fontWeight: 500, color: "#242424" }}>{dashboardData?.so_modun}</div>
                                <div style={{ color: "#242424", fontSize: "14px", fontWeight: 400 }}>Số lượng Chương học</div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{ borderRadius: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                                size={48}
                                style={{ background: "linear-gradient(180deg, rgba(41, 43, 142, 0.1) 0%, rgba(41, 43, 142, 0.3) 100%)", marginRight: "12px" }}
                                icon={<img src={imageNote} alt="imageNote" style={{width: '100%'}}/>}
                            />
                            <div>
                                <div style={{ fontSize: "24px", fontWeight: 500, color: "#242424" }}>{dashboardData?.so_chuyen_de}</div>
                                <div style={{ color: "#242424", fontSize: "14px", fontWeight: 400 }}>Số lượng chuyên đề</div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{ borderRadius: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Avatar size={48} style={{ background: "linear-gradient(180deg, rgba(41, 43, 142, 0.1) 0%, rgba(41, 43, 142, 0.3) 100%)", marginRight: "12px" }} 
                                icon={<img src={imageUser} alt="imageUser" style={{width: '100%'}}/>} 
                            />
                            <div>
                                <div style={{ fontSize: "24px", fontWeight: 500, color: "#242424" }}>{dashboardData?.so_hoc_vien}</div>
                                <div style={{ color: "#242424", fontSize: "14px", fontWeight: 400 }}>Số lượng học viên</div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Filters and Actions */}
            <Card style={{ marginBottom: "16px", borderRadius: "8px" }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <Input
                            placeholder="Tìm kiếm"
                            allowClear
                            prefix={<SearchOutlined />}
                            onChange={(e) => {
                                setFilter((state) => ({ ...state, search: e.target.value }));  
                            }}
                        />
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <Select
                            placeholder="Loại khóa học"
                            style={{ width: "100%" }}
                            onChange={(value) => {
                                setFilter((state) => ({ ...state, lkh_id: value }));
                            }}
                            allowClear
                        >
                            {constants.TYPE_COURSES.map((item) => (
                                <Option key={item.value} value={item.value}>
                                    {item.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <Select placeholder="Trạng thái" style={{ width: "100%" }} 
                            onChange={(value) => setFilter((state) => ({ ...state, trang_thai: value }))  } allowClear
                        >
                            <Option value="1">Hoạt động</Option>
                            <Option value="0">Tạm dừng</Option>
                            <Option value="">Tất cả trạng thái</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={6}>
                        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                            {/* <Button icon={<ExportOutlined />}>Export</Button> */}
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => history.push('/teacher/form-course/create')}>
                                Thêm khóa học
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Data Table */}
            <Card style={{ borderRadius: "8px" }}>
                <Table
                    columns={columns}
                    dataSource={courses?.data}
                    pagination={false}
                    scroll={{ x: 1200 }}
                    size="middle"
                />
                <Pagination showSizeChanger style={{marginTop: 8}}
                    onShowSizeChange={onShowSizeChange} 
                    current={pageIndex} 
                    pageSize={pageSize} 
                    onChange={onChange} 
                    total={courses?.totalCount}
                />
            </Card>
        </div>
    )
}

export default CourseManagement
