import { useState } from "react"
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Space,
  Tabs,
  List,
  Avatar,
  Image,
  Dropdown,
  Menu,
  Modal,
  Form,
  Upload,
  message,
  Select,
  Input,
} from "antd"
import {
  EyeInvisibleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MoreOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  InboxOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons"
import './chapter-detail.css';

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { Option } = Select
const { Dragger } = Upload

// Chapter topics data
const chapterTopics = [
  {
    id: 1,
    title: "Chuyên đề 1: Ôn tập đạo hàm và các quy tắc tính đạo hàm",
    documents: 12,
    videos: 24,
  },
  {
    id: 2,
    title: "Chuyên đề 2: Ứng dụng đạo hàm để tìm cực trị, tính đơn điệu",
    documents: 12,
    videos: 24,
  },
  {
    id: 3,
    title: "Chuyên đề 3: Khảo sát và vẽ đồ thị bằng bảng biến thiên",
    documents: 12,
    videos: 24,
  },
  {
    id: 4,
    title: "Chuyên đề 4: Nhận dạng đồ thị và bài toán liên quan trong đề thi",
    documents: 12,
    videos: 24,
  },
]

// Chapter exams data
const chapterExams = [
  {
    id: 1,
    title: "Đề thi chương 1 - Phần 1",
    duration: "45 phút",
    questions: "20 câu",
  },
  {
    id: 2,
    title: "Đề thi chương 1 - Phần 2",
    duration: "45 phút",
    questions: "20 câu",
  },
]

const ChapterDetail = () => {
  const [activeTab, setActiveTab] = useState("topics")
  const [isAddTopicModalVisible, setIsAddTopicModalVisible] = useState(false)
  const [addTopicForm] = Form.useForm()

  const handleAddTopic = () => {
    addTopicForm
      .validateFields()
      .then((values) => {
        console.log("Form values:", values)
        message.success("Thêm chuyên đề thành công!")
        setIsAddTopicModalVisible(false)
        addTopicForm.resetFields()
      })
      .catch((error) => {
        console.log("Validation failed:", error)
      })
  }

  return (
    <div className="chapter-detail">
      {/* Back Button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        // onClick={onBack}
        style={{ marginBottom: "16px", padding: "4px 8px" }}
      >
        Quay lại
      </Button>

      <Row gutter={24}>
        {/* Left Content */}
        <Col xs={24} lg={12}>
          <Card style={{ borderRadius: "8px", height: "fit-content" }}>
            {/* Chapter Image */}
            <div style={{ marginBottom: "24px" }}>
              <Image
                src="/placeholder.svg?height=300&width=400"
                alt="Calculator and documents"
                style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: "8px" }}
                preview={false}
              />
            </div>

            {/* Chapter Title */}
            <Title level={3} style={{ marginBottom: "24px", color: "#262626", lineHeight: "1.4" }}>
              Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số
            </Title>

            {/* Chapter Description */}
            <Paragraph style={{ color: "#595959", lineHeight: "1.8", fontSize: "16px", textAlign: "justify" }}>
              Chuyên đề này tập trung vào việc vận dụng đạo hàm để phân tích và khảo sát các đặc điểm quan trọng của hàm
              số như tính đơn điệu, cực trị, điểm uốn và tính lõi/lồm. Học sinh sẽ được hướng dẫn cách sử dụng bảng biến
              thiên để vẽ đồ thị chính xác, nhận diện hình dáng hàm số và xác định các yếu tố then chốt phục vụ cho bài
              toán khảo sát hàm. Đây là phần kiến thức nền tảng và chiếm tỉ trọng lớn trong các đề thi THPT Quốc gia.
            </Paragraph>

            {/* Action Buttons */}
            <Space style={{ marginTop: "32px" }}>
              <Button icon={<EyeInvisibleOutlined />} style={{ borderRadius: "6px" }}>
                Ẩn chương
              </Button>
              <Button icon={<EditOutlined />} style={{ borderRadius: "6px" }}>
                Sửa chương
              </Button>
              <Button icon={<DeleteOutlined />} danger style={{ borderRadius: "6px" }} />
            </Space>
          </Card>
        </Col>

        {/* Right Content */}
        <Col xs={24} lg={12}>
          <Card style={{ borderRadius: "8px" }}>
            <Title level={4} style={{ marginBottom: "16px", color: "#262626" }}>
              Nội dung chương học
            </Title>

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane
                tab={
                  <span
                    style={{
                      backgroundColor: activeTab === "topics" ? "#dc4c64" : "#f0f0f0",
                      color: activeTab === "topics" ? "#fff" : "#8c8c8c",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontWeight: "500",
                    }}
                  >
                    Danh sách chuyên đề ({chapterTopics.length})
                  </span>
                }
                key="topics"
              >
                <List
                  dataSource={chapterTopics}
                  renderItem={(topic, index) => {
                    const menu = (
                      <Menu>
                        <Menu.Item key="edit" icon={<EditOutlined />}>
                          Sửa chuyên đề
                        </Menu.Item>
                        <Menu.Item key="hide" icon={<EyeInvisibleOutlined />}>
                          Ẩn chuyên đề
                        </Menu.Item>
                        <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                          Xóa chuyên đề
                        </Menu.Item>
                      </Menu>
                    )

                    return (
                      <List.Item style={{ padding: "16px 12px", border: "none" }}>
                        <div style={{ display: "flex", width: "100%", alignItems: "flex-start" }}>
                          <Avatar
                            size={48}
                            style={{
                              backgroundColor: "#fff3cd",
                              color: "#856404",
                              marginRight: "16px",
                              flexShrink: 0,
                            }}
                            icon={<FileTextOutlined />}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  lineHeight: "1.4",
                                  marginBottom: "8px",
                                  display: "block",
                                  color: "#262626",
                                }}
                              >
                                {topic.title}
                              </Text>
                              <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                                <Button type="text" size="small" icon={<MoreOutlined />} />
                              </Dropdown>
                            </div>
                            <Space size="large" style={{ color: "#8c8c8c", fontSize: "14px" }}>
                              <Space size={6}>
                                <FileTextOutlined />
                                <span>{topic.documents} tài liệu</span>
                              </Space>
                              <Space size={6}>
                                <PlayCircleOutlined />
                                <span>{topic.videos} videos bài giảng</span>
                              </Space>
                            </Space>
                          </div>
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
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: "500",
                    borderRadius: "6px",
                  }}
                  onClick={() => setIsAddTopicModalVisible(true)}
                >
                  Thêm chuyên đề
                </Button>
              </TabPane>
              <TabPane
                tab={
                  <span
                    style={{
                      backgroundColor: activeTab === "exams" ? "#dc4c64" : "#f0f0f0",
                      color: activeTab === "exams" ? "#fff" : "#8c8c8c",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontWeight: "500",
                    }}
                  >
                    Đề thi chương học ({chapterExams.length})
                  </span>
                }
                key="exams"
              >
                <List
                  dataSource={chapterExams}
                  renderItem={(exam, index) => {
                    const menu = (
                      <Menu>
                        <Menu.Item key="edit" icon={<EditOutlined />}>
                          Sửa đề thi
                        </Menu.Item>
                        <Menu.Item key="hide" icon={<EyeInvisibleOutlined />}>
                          Ẩn đề thi
                        </Menu.Item>
                        <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                          Xóa đề thi
                        </Menu.Item>
                      </Menu>
                    )

                    return (
                      <List.Item style={{ padding: "16px 0", border: "none" }}>
                        <div style={{ display: "flex", width: "100%", alignItems: "flex-start" }}>
                          <Avatar
                            size={48}
                            style={{
                              backgroundColor: "#4c6ef5",
                              marginRight: "16px",
                              flexShrink: 0,
                            }}
                            icon={<FileTextOutlined />}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Text
                                strong
                                style={{
                                  fontSize: "16px",
                                  lineHeight: "1.4",
                                  marginBottom: "8px",
                                  display: "block",
                                  color: "#262626",
                                }}
                              >
                                {exam.title}
                              </Text>
                              <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                                <Button type="text" size="small" icon={<MoreOutlined />} />
                              </Dropdown>
                            </div>
                            <Space size="large" style={{ color: "#8c8c8c", fontSize: "14px" }}>
                              <Space size={6}>
                                <PlayCircleOutlined />
                                <span>{exam.duration}</span>
                              </Space>
                              <Space size={6}>
                                <FileTextOutlined />
                                <span>{exam.questions}</span>
                              </Space>
                            </Space>
                          </div>
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
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: "500",
                    borderRadius: "6px",
                  }}
                  onClick={() => message.info("Thêm đề thi chương học")}
                >
                  Thêm đề thi
                </Button>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Add Topic Modal */}
      <Modal
        title="Thêm chuyên đề mới"
        open={isAddTopicModalVisible}
        onCancel={() => {
          setIsAddTopicModalVisible(false)
          addTopicForm.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsAddTopicModalVisible(false)}>
            Hủy bỏ
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleAddTopic}
            style={{ backgroundColor: "#4c6ef5", borderColor: "#4c6ef5" }}
          >
            Xác nhận
          </Button>,
        ]}
        width={600}
        destroyOnClose
      >
        <Form form={addTopicForm} layout="vertical" style={{ marginTop: "16px" }}>
          <Form.Item
            label={
              <span>
                <span style={{ color: "#ff4d4f" }}>*</span> Tên chuyên đề
              </span>
            }
            name="topicName"
            rules={[{ required: true, message: "Vui lòng nhập tên chuyên đề" }]}
          >
            <Input placeholder="Nhập tên chuyên đề" />
          </Form.Item>

          <Form.Item
            label={
              <span>
                <span style={{ color: "#ff4d4f" }}>*</span> Mô tả chuyên đề
              </span>
            }
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả chuyên đề" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập mô tả chuyên đề"
              maxLength={500}
              showCount
              style={{ resize: "none" }}
            />
          </Form.Item>

          <Form.Item label="Tài liệu đính kèm" name="documents">
            <Dragger name="documents" multiple beforeUpload={() => false} style={{ padding: "20px" }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: "24px", color: "#d9d9d9" }} />
              </p>
              <p className="ant-upload-text">Click hoặc kéo file vào đây</p>
              <p className="ant-upload-hint" style={{ color: "#8c8c8c" }}>
                Hỗ trợ định dạng: PDF, DOC, DOCX, PPT, PPTX
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item label="Video bài giảng" name="videos">
            <Dragger name="videos" multiple beforeUpload={() => false} style={{ padding: "20px" }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: "24px", color: "#d9d9d9" }} />
              </p>
              <p className="ant-upload-text">Click hoặc kéo file vào đây</p>
              <p className="ant-upload-hint" style={{ color: "#8c8c8c" }}>
                Hỗ trợ định dạng: MP4, AVI, MOV (tối đa 500MB)
              </p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ChapterDetail
