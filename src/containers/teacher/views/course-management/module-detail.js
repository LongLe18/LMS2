import { useState } from "react"
import { Menu, Typography, Button, Space, Tabs, List,
  Avatar, Dropdown, Row, Col, Card, } from "antd"
import { FileTextOutlined, MoreOutlined, PlayCircleOutlined, PlusOutlined,
} from "@ant-design/icons"
import './module-detail.css' // Import custom CSS for styling

// ==================================================================== 
{/* Giao diện chuyên đề (chi tiết mô đun) */}
// ==================================================================== 

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

// Topic materials data
const topicMaterials = [
  {
    id: 1,
    title: "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số",
    type: "document",
    icon: <FileTextOutlined style={{ color: "#ff4d4f" }} />,
  },
  {
    id: 2,
    title: "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số",
    type: "video",
    icon: <PlayCircleOutlined style={{ color: "#262626" }} />,
  },
  {
    id: 3,
    title: "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số",
    type: "video",
    icon: <PlayCircleOutlined style={{ color: "#262626" }} />,
  },
  {
    id: 4,
    title: "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số",
    type: "video",
    icon: <PlayCircleOutlined style={{ color: "#262626" }} />,
  },
  {
    id: 5,
    title: "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số",
    type: "document",
    icon: <FileTextOutlined style={{ color: "#262626" }} />,
  },
  {
    id: 6,
    title: "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số",
    type: "document",
    icon: <FileTextOutlined style={{ color: "#262626" }} />,
  },
  {
    id: 7,
    title: "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số",
    type: "video",
    icon: <PlayCircleOutlined style={{ color: "#262626" }} />,
  },
]

// Topic exams data
const topicExams = [
  {
    id: 1,
    title: "Đề thi chuyên đề 1 - Phần 1",
    duration: "45 phút",
    questions: "20 câu",
  },
  {
    id: 2,
    title: "Đề thi chuyên đề 1 - Phần 2",
    duration: "45 phút",
    questions: "20 câu",
  },
  {
    id: 3,
    title: "Đề thi chuyên đề 1 - Tổng hợp",
    duration: "90 phút",
    questions: "40 câu",
  },
]

const ModunDetail = () => {
    const [activeTab, setActiveTab] = useState("materials")
    const [selectedMaterial, setSelectedMaterial] = useState(topicMaterials[0])


    const handleMaterialClick = (material) => {
        setSelectedMaterial(material)
    }

    return (
        <div className="module-detail" >
            <Row gutter={24}>
                {/* Left Content */}
                <Col xs={24} lg={10}>
                    <Card style={{ borderRadius: "8px", marginBottom: "24px" }}>
                        {/* Topic Title */}
                        <Title level={3} style={{ marginBottom: "16px", color: "#262626", lineHeight: "1.4" }}>
                            Chuyên đề 1: Ôn tập đạo hàm và các quy tắc tính đạo hàm
                        </Title>

                        {/* Topic Description */}
                        <Paragraph style={{ color: "#595959", lineHeight: "1.6", marginBottom: "24px" }}>
                            Chuyên đề này tập trung vào việc vận dụng đạo hàm để phân tích và khảo sát các đặc điểm quan trọng
                            của hàm số.
                        </Paragraph>

                        {/* Tabs */}
                        <Tabs activeKey={activeTab} onChange={setActiveTab}>
                            <TabPane
                                tab={
                                    <span
                                    style={{
                                        backgroundColor: activeTab === "materials" ? "#ff4d4f" : "#f0f0f0",
                                        color: activeTab === "materials" ? "#fff" : "#8c8c8c",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        fontWeight: "500",
                                        width: '50%'
                                    }}
                                    >
                                    Tài liệu ({topicMaterials.length})
                                    </span>
                                }
                                key="materials"
                            >
                            <List
                                dataSource={topicMaterials}
                                renderItem={(material, index) => {
                                const menu = (
                                    <Dropdown
                                        overlay={
                                            <Menu>
                                            <Menu.Item key="edit">Sửa tài liệu</Menu.Item>
                                            <Menu.Item key="hide">Ẩn tài liệu</Menu.Item>
                                            <Menu.Item key="delete" danger>
                                                Xóa tài liệu
                                            </Menu.Item>
                                            </Menu>
                                        }
                                        trigger={["click"]}
                                        placement="bottomRight"
                                    >
                                        <Button type="text" size="small" icon={<MoreOutlined />} />
                                    </Dropdown>
                                )

                                return (
                                    <List.Item
                                        style={{
                                            padding: "12px 0",
                                            border: "none",
                                            cursor: "pointer",
                                            backgroundColor: selectedMaterial.id === material.id ? "#f0f2ff" : "transparent",
                                            borderRadius: "6px",
                                            marginBottom: "4px",
                                            paddingLeft: selectedMaterial.id === material.id ? "12px" : "0",
                                            paddingRight: selectedMaterial.id === material.id ? "12px" : "0",
                                        }}
                                    onClick={() => handleMaterialClick(material)}
                                    >
                                        <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                                            <div style={{ marginRight: "12px", fontSize: "18px" }}>{material.icon}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <Text
                                                    style={{
                                                        fontSize: "14px",
                                                        lineHeight: "1.4",
                                                        color: "#262626",
                                                        display: "block",
                                                    }}
                                                >
                                                    {material.title}
                                                </Text>
                                            </div>
                                            {menu}
                                        </div>
                                    </List.Item>
                                )
                                }}
                            />
                            <Button
                                type="primary"
                                block
                                icon={<PlusOutlined />}
                                style={{
                                    marginTop: "16px",
                                    backgroundColor: "#4c6ef5",
                                    borderColor: "#4c6ef5",
                                    height: "40px",
                                    borderRadius: "6px",
                                }}
                            >
                                Thêm bài giảng
                            </Button>
                            </TabPane>
                            <TabPane
                                tab={
                                    <span
                                        style={{
                                            backgroundColor: activeTab === "exams" ? "#ff4d4f" : "#f0f0f0",
                                            color: activeTab === "exams" ? "#fff" : "#8c8c8c",
                                            padding: "8px 16px",
                                            borderRadius: "6px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        Đề thi chuyên đề ({topicExams.length})
                                    </span>
                                }
                                key="exams"
                            >
                            <List
                                dataSource={topicExams}
                                renderItem={(exam, index) => {
                                const menu = (
                                    <Dropdown
                                    overlay={
                                        <Menu>
                                        <Menu.Item key="edit">Sửa đề thi</Menu.Item>
                                        <Menu.Item key="hide">Ẩn đề thi</Menu.Item>
                                        <Menu.Item key="delete" danger>
                                            Xóa đề thi
                                        </Menu.Item>
                                        </Menu>
                                    }
                                    trigger={["click"]}
                                    placement="bottomRight"
                                    >
                                    <Button type="text" size="small" icon={<MoreOutlined />} />
                                    </Dropdown>
                                )

                                return (
                                    <List.Item style={{ padding: "12px 0", border: "none" }}>
                                    <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                                        <Avatar
                                        size={40}
                                        style={{
                                            backgroundColor: "#4c6ef5",
                                            marginRight: "12px",
                                            flexShrink: 0,
                                        }}
                                        icon={<FileTextOutlined />}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                        <Text
                                            strong
                                            style={{
                                            fontSize: "14px",
                                            lineHeight: "1.4",
                                            marginBottom: "4px",
                                            display: "block",
                                            color: "#262626",
                                            }}
                                        >
                                            {exam.title}
                                        </Text>
                                        <Space size="large" style={{ color: "#8c8c8c", fontSize: "12px" }}>
                                            <span>{exam.duration}</span>
                                            <span>{exam.questions}</span>
                                        </Space>
                                        </div>
                                        {menu}
                                    </div>
                                    </List.Item>
                                )
                                }}
                            />
                            <Button
                                type="primary"
                                block
                                icon={<PlusOutlined />}
                                style={{
                                marginTop: "16px",
                                backgroundColor: "#4c6ef5",
                                borderColor: "#4c6ef5",
                                height: "40px",
                                borderRadius: "6px",
                                }}
                            >
                                Thêm đề thi
                            </Button>
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>

                {/* Right Content - Document Viewer */}
                <Col xs={24} lg={14}>
                    <Card style={{ borderRadius: "8px", height: "calc(100vh - 140px)" }}>
                    
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default ModunDetail
