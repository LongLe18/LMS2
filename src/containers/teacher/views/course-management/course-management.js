import { useState } from "react"
import { Card, Row, Col, Input, Select, Button, Table, Tag, Space, Typography, Avatar, Tooltip } from "antd"
import {
    SearchOutlined,
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    SettingOutlined,
} from "@ant-design/icons"
import imageStudy from 'assets/img/image-study.png';
import imageBook from 'assets/img/image-book.png';
import imageNote from 'assets/img/image-note.png';
import imageUser from 'assets/img/image-user.png';
import { useHistory } from 'react-router-dom';

const { Title } = Typography
const { Option } = Select

// Mock data for the table
const courseData = Array.from({ length: 15 }, (_, index) => ({
    key: index + 1,
    stt: index + 1,
    khoa_hoc_id: 1,
    courseName: "Toán nền tảng lớp 6",
    courseType: "Ôn luyện nền tảng",
    chapters: 10,
    topics: 190,
    studyTime: "01/03/2025 - 30/04/2025",
    status: index === 4 || index === 6 || index === 12 ? "paused" : "active",
}))

const CourseManagement = () => {
    const [searchText, setSearchText] = useState("")
    const [courseType, setCourseType] = useState(null)
    const [status, setStatus] = useState(null)
    const history = useHistory();

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
            title: (
                <Space>
                    Tên khóa học
                <SearchOutlined style={{ color: "#bfbfbf" }} />
                </Space>
            ),
            dataIndex: "courseName",
            key: "courseName",
            width: 200,
        },
        {
            title: (
                <Space>
                    Loại khóa học
                    <SettingOutlined style={{ color: "#bfbfbf" }} />
                </Space>
            ),
            dataIndex: "courseType",
            key: "courseType",
            width: 180,
        },
        {
            title: (
                <Space>
                    Số mô-đun
                    <SettingOutlined style={{ color: "#bfbfbf" }} />
                </Space>
            ),
            dataIndex: "chapters",
            key: "chapters",
            width: 120,
            align: "center",
        },
        {
            title: (
                <Space>
                    Số chuyên đề
                    <SettingOutlined style={{ color: "#bfbfbf" }} />
                </Space>
            ),
            dataIndex: "topics",
            key: "topics",
            width: 120,
            align: "center",
        },
        {
            title: (
                <Space>
                    Thời gian học
                    <SettingOutlined style={{ color: "#bfbfbf" }} />
                </Space>
            ),
            dataIndex: "studyTime",
            key: "studyTime",
            width: 180,
        },
        {
            title: (
                <Space>
                Trạng thái
                <SettingOutlined style={{ color: "#bfbfbf" }} />
                </Space>
            ),
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status) => (
                <Tag color={status === "active" ? "green" : "red"}>{status === "active" ? "Hoạt động" : "Tạm dừng"}</Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 120,
            align: "center",
            render: (record) => (
                <Space>
                    <Tooltip title="Xem">
                        <Button type="text" icon={<EyeOutlined />} size="small" />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} 
                            size="small" 
                            onClick={() => history.push(`/teacher/detail-course/${record?.khoa_hoc_id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button type="text" icon={<DeleteOutlined />} size="small" danger />
                    </Tooltip>
                </Space>
            ),
        },
    ]

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
                            icon={<img src={imageStudy} alt="imageStudy"/>} 
                            />
                        <div>
                            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#262626" }}>28</div>
                            <div style={{ color: "#8c8c8c", fontSize: "14px" }}>Số lượng khóa học</div>
                        </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{ borderRadius: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Avatar size={48} style={{ background: "linear-gradient(180deg, rgba(41, 43, 142, 0.1) 0%, rgba(41, 43, 142, 0.3) 100%)", marginRight: "12px" }} 
                                icon={<img src={imageBook} alt="imageBook"/>} 
                            />
                            <div>
                                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#262626" }}>327</div>
                                <div style={{ color: "#8c8c8c", fontSize: "14px" }}>Số lượng mô đun</div>
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
                            icon={<img src={imageNote} alt="imageNote"/>}
                        />
                        <div>
                            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#262626" }}>6.293</div>
                            <div style={{ color: "#8c8c8c", fontSize: "14px" }}>Số lượng chuyên đề</div>
                        </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{ borderRadius: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Avatar size={48} style={{ background: "linear-gradient(180deg, rgba(41, 43, 142, 0.1) 0%, rgba(41, 43, 142, 0.3) 100%)", marginRight: "12px" }} 
                                icon={<img src={imageUser} alt="imageUser" />} 
                            />
                            <div>
                                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#262626" }}>1.293</div>
                                <div style={{ color: "#8c8c8c", fontSize: "14px" }}>Số lượng học viên</div>
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
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <Select
                            placeholder="Loại khóa học"
                            style={{ width: "100%" }}
                            value={courseType}
                            onChange={setCourseType}
                            allowClear
                        >
                            <Option value="foundation">Ôn luyện nền tảng</Option>
                            <Option value="advanced">Nâng cao</Option>
                            <Option value="exam">Luyện thi</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <Select placeholder="Trạng thái" style={{ width: "100%" }} 
                            value={status} onChange={setStatus} allowClear
                        >
                            <Option value="active">Hoạt động</Option>
                            <Option value="paused">Tạm dừng</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={6}>
                        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                            {/* <Button icon={<ExportOutlined />}>Export</Button> */}
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => history.push('/teacher/create-course')}>
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
                    dataSource={courseData}
                    pagination={{
                        current: 2,
                        pageSize: 15,
                        total: 85,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} hàng`,
                        pageSizeOptions: ["15", "30", "50", "100"],
                    }}
                    scroll={{ x: 1200 }}
                    size="middle"
                />
            </Card>
        </div>
    )
}

export default CourseManagement
