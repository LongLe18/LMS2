import { useState } from "react"
import {
  Layout,
  Form,
  Input,
  Upload,
  Button,
  Card,
  Collapse,
  Radio,
  Select,
  DatePicker,
  Tabs,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  InputNumber,
} from "antd"
import {
  PlusOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
} from "@ant-design/icons"
import moment from "moment"
import './course-management.css'

const { Header } = Layout
const { Panel } = Collapse
const { TabPane } = Tabs
const { Text } = Typography
const { TextArea } = Input
const { Option } = Select

// Rich Text Editor Component (simplified)
const RichTextEditor = ({
  placeholder,
  value,
  onChange,
}) => {
    return (
        <div style={{ border: "1px solid #d9d9d9", borderRadius: "6px" }}>
            <div style={{ padding: "8px", borderBottom: "1px solid #f0f0f0", backgroundColor: "#fafafa" }}>
                <Space>
                    <Text strong>Heading 1</Text>
                    <Text>14px</Text>
                    <Divider type="vertical" />
                    <Button type="text" size="small" icon={<BoldOutlined />} />
                    <Button type="text" size="small" icon={<ItalicOutlined />} />
                    <Button type="text" size="small" icon={<UnderlineOutlined />} />
                    <Divider type="vertical" />
                    <Button type="text" size="small" icon={<AlignLeftOutlined />} />
                    <Button type="text" size="small" icon={<AlignCenterOutlined />} />
                    <Button type="text" size="small" icon={<AlignRightOutlined />} />
                    <Divider type="vertical" />
                    <Button type="text" size="small" icon={<UnorderedListOutlined />} />
                    <Button type="text" size="small" icon={<OrderedListOutlined />} />
                    <Button type="text" size="small" icon={<LinkOutlined />} />
                </Space>
            </div>
            <TextArea
                placeholder={placeholder || "Nhập mô tả sản phẩm"}
                bordered={false}
                rows={4}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                style={{ resize: "none" }}
            />
        </div>
    )
}

const FormCourse = () => {
    const [form] = Form.useForm()
    const [activeKey, setActiveKey] = useState(["1", "2", "3", "4", "5", "6", "7", "8", "9"])

    const uploadProps = {
        name: "file",
        multiple: false,
        showUploadList: false,
        beforeUpload: () => false,
    }

    return (
        <div className="content" style={{marginTop: 30}}>
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
                <Row gutter={24}>
                    {/* Main Content */}
                    <Col xs={24} lg={16} style={{background: '#fff'}}>
                        <Form form={form} layout="vertical">
                            <Collapse activeKey={activeKey} onChange={setActiveKey} ghost>
                            {/* Course Name */}
                                <Panel header="Tên khóa học" key="1">
                                    <Form.Item name="courseName">
                                    <Input placeholder="Nhập tên khoá học" />
                                    </Form.Item>
                                </Panel>

                                {/* Course Image */}
                                <Panel header="Hình ảnh khóa học" key="2">
                                    <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>
                                        Tối đa 5.4MB, định dạng ảnh: jpeg, jpg, png, gif, webp, tối đa 5MB
                                    </Text>
                                    <Upload {...uploadProps}>
                                    <div
                                        style={{
                                        width: "120px",
                                        height: "80px",
                                        border: "2px dashed #d9d9d9",
                                        borderRadius: "6px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        }}
                                    >
                                        <PlusOutlined style={{ fontSize: "24px", color: "#d9d9d9" }} />
                                    </div>
                                    </Upload>
                                </Panel>

                                {/* General Description */}
                                <Panel header="Mô tả chung" key="3">
                                    <RichTextEditor placeholder="Nhập mô tả sản phẩm" />
                                </Panel>

                                {/* Course Introduction */}
                                <Panel header="Giới thiệu khóa học" key="4">
                                    <RichTextEditor placeholder="Nhập mô tả sản phẩm" />
                                </Panel>

                                {/* Training Format */}
                                <Panel header="Hình thức đào tạo" key="5">
                                    <Tabs defaultActiveKey="online" style={{ marginBottom: "16px" }}>
                                    <TabPane tab="Đào tạo Online" key="online" />
                                    <TabPane tab="Đào tạo Offline" key="offline" />
                                    </Tabs>
                                    <RichTextEditor placeholder="Nhập mô tả sản phẩm" />
                                </Panel>

                                {/* Commitment Goals */}
                                <Panel header="Mục tiêu cam kết" key="6">
                                    <RichTextEditor placeholder="Nhập mô tả sản phẩm" />
                                </Panel>

                                {/* Target Audience */}
                                <Panel header="Đối tượng" key="7">
                                    <Tabs defaultActiveKey="students" style={{ marginBottom: "16px" }}>
                                    <TabPane tab="Học sinh" key="students" />
                                    <TabPane tab="Luyện thi" key="exam" />
                                    <TabPane tab="Ôn luyện" key="review" />
                                    </Tabs>
                                    <RichTextEditor placeholder="Nhập mô tả sản phẩm" />
                                </Panel>

                                {/* Detailed Content */}
                                <Panel header="Nội dung chi tiết" key="8">
                                    <RichTextEditor placeholder="Nhập mô tả sản phẩm" />
                                </Panel>

                                {/* Class Scheduling */}
                                <Panel header="Xếp lớp thời gian" key="9">
                                    <RichTextEditor placeholder="Nhập mô tả sản phẩm" />
                                </Panel>

                                {/* Course Price */}
                                <Panel header="Giá khóa học" key="10">
                                    <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Giá gốc khóa học" name="originalPrice">
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            placeholder="0"
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            addonAfter="VNĐ"
                                        />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Giá khuyến mại" name="discountPrice">
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            placeholder="0"
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            addonAfter="VNĐ"
                                        />
                                        </Form.Item>
                                    </Col>
                                    </Row>
                                </Panel>
                            </Collapse>
                        </Form>
                    </Col>

                    {/* Right Sidebar */}
                    <Col xs={24} lg={8}>
                        <Card title="Khung chương trình" style={{ marginBottom: "16px" }}>
                            <Form.Item label="Chương trình" required={true}>
                                <Select placeholder="Chọn" style={{ width: "100%" }}>
                                    <Option value="program1">Chương trình 1</Option>
                                    <Option value="program2">Chương trình 2</Option>
                                </Select>
                            </Form.Item>
                        </Card>

                        <Card title="Loại khóa học" style={{ marginBottom: "16px" }}>
                            <Form.Item name="courseType">
                                <Radio.Group>
                                    <Radio value="skills" style={{ display: "block", marginBottom: "8px" }}>
                                        Ôn luyện kỹ năng
                                    </Radio>
                                    <Radio value="topics" style={{ display: "block", marginBottom: "8px" }}>Ôn luyện chuyên đề</Radio>
                                    <Radio value="secondary" style={{ display: "block", marginBottom: "8px" }}>Luyện đề thi thực chiến</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Card>

                        <Card title="Thời gian" style={{ marginBottom: "16px" }}>
                            <Form.Item label="Ngày bắt đầu" style={{ marginBottom: "12px" }}>
                            <DatePicker
                                style={{ width: "100%" }}
                                placeholder="26/11/2024"
                                format="DD/MM/YYYY"
                                defaultValue={moment("26/11/2024", "DD/MM/YYYY")}
                            />
                            </Form.Item>
                            <Form.Item label="Ngày kết thúc">
                            <DatePicker
                                style={{ width: "100%" }}
                                placeholder="26/11/2025"
                                format="DD/MM/YYYY"
                                defaultValue={moment("26/11/2025", "DD/MM/YYYY")}
                            />
                            </Form.Item>
                        </Card>

                        <Card title="Trạng thái khóa học" style={{ marginBottom: "16px" }}>
                            <Form.Item>
                            <Select defaultValue="active" style={{ width: "100%" }}>
                                <Option value="active">Hoạt động</Option>
                                <Option value="inactive">Không hoạt động</Option>
                            </Select>
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                {/* Bottom Actions */}
                <Row justify="space-between" style={{ borderRadius: 6, background: '#fff', marginTop: "24px", padding: "16px 0", borderTop: "1px solid #f0f0f0" }}>
                    <Col>
                    </Col>
                    <Col>
                        <Space>
                            <Button>Huỷ bỏ</Button>
                            <Button style={{marginRight: 12}} type="primary">Xác nhận</Button>
                        </Space>
                    </Col>
                </Row>
            </Layout>
        </div>
    )
}

export default FormCourse
