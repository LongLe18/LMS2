
import { useState } from "react"
import { useHistory } from "react-router-dom"
import { Row, Col, Card, Typography, Button, Space, Tabs, List, Avatar, 
  Tag, Image, Divider, Dropdown, Menu, Modal, Form, message, Select, Input,
  Upload, Alert, } from "antd"
import {
  EyeInvisibleOutlined,
  EditOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  MoreOutlined,
  FileTextOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
  ExclamationCircleFilled,
  InboxOutlined,
} from "@ant-design/icons"

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { Option } = Select
const { Dragger } = Upload

// Course chapters data
const courseChapters = [
  {
    id: 1,
    title: "Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số",
    lessons: 6,
    duration: "1 đề thi",
    thumbnail: "/placeholder.svg?height=60&width=80",
    bgColor: "#e6f7ff",
  },
  {
    id: 2,
    title: "Chương 2: Mũ – Logarit",
    lessons: 6,
    duration: "1 đề thi",
    thumbnail: "/placeholder.svg?height=60&width=80",
    bgColor: "#f6ffed",
  },
  {
    id: 3,
    title: "Chương 3: Nguyên hàm – Tích phân – Ứng dụng",
    lessons: 6,
    duration: "1 đề thi",
    thumbnail: "/placeholder.svg?height=60&width=80",
    bgColor: "#fff7e6",
  },
  {
    id: 4,
    title: "Chương 4: Số phức",
    lessons: 6,
    duration: "1 đề thi",
    thumbnail: "/placeholder.svg?height=60&width=80",
    bgColor: "#f9f0ff",
  },
  {
    id: 5,
    title: "Chương 5: Hình học không gian cơ điển",
    lessons: 6,
    duration: "1 đề thi",
    thumbnail: "/placeholder.svg?height=60&width=80",
    bgColor: "#e6f7ff",
  },
  {
    id: 6,
    title: "Chương 6: Hình học không gian tọa độ (Oxyz)",
    lessons: 6,
    duration: "1 đề thi",
    thumbnail: "/placeholder.svg?height=60&width=80",
    bgColor: "#fff2e8",
  },
  {
    id: 7,
    title: "Chương 7: Xác suất – Tổ hợp",
    lessons: 6,
    duration: "1 đề thi",
    thumbnail: "/placeholder.svg?height=60&width=80",
    bgColor: "#f0f5ff",
  },
]

// Comprehensive exams data - toggle this to test empty/populated states
const comprehensiveExams = [
  {
    id: 1,
    title: "Đề thi toán nền tảng lớp 12",
    duration: "90 phút",
    questions: "30 câu",
    hidden: true, // First exam is hidden
  },
  {
    id: 2,
    title: "Đề thi toán nền tảng lớp 12",
    duration: "90 phút",
    questions: "30 câu",
    hidden: false,
  },
  {
    id: 3,
    title: "Đề thi toán nền tảng lớp 12",
    duration: "90 phút",
    questions: "30 câu",
    hidden: false,
  },
]

const CourseDetail = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState("chapters");
  const [isAddChapterModalVisible, setIsAddChapterModalVisible] = useState(false)
  const [isAddExamModalVisible, setIsAddExamModalVisible] = useState(false)
  const [addChapterForm] = Form.useForm()
  const [addExamForm] = Form.useForm()
  const [examsData, setExamsData] = useState(comprehensiveExams)
  const [examToDelete, setExamToDelete] = useState(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  const handleDeleteExam = () => {
    if (examToDelete) {
      const updatedExams = examsData.filter((exam) => exam.id !== examToDelete.id)
      setExamsData(updatedExams)
      message.success("Đã xóa đề thi thành công!")
      setDeleteModalVisible(false)
      setExamToDelete(null)
    }
  }

  const handleChapterClick = (chapter) => {
    history.push(`/teacher/detail-chapter/${chapter.id}`)
  }


  const handleAddExam = () => {
    addExamForm
      .validateFields()
      .then((values) => {
        console.log("Form values:", values)

        // Create a new exam object
        const newExam = {
          id: examsData.length + 1,
          title: "Đề thi toán nền tảng lớp 12", // Using the selected course as the title
          duration: "90 phút", // Default values
          questions: "30 câu", // Default values
          hidden: false,
        }

        // Add the new exam to the list
        setExamsData([...examsData, newExam])

        message.success("Thêm đề thi thành công!")
        setIsAddExamModalVisible(false)
        addExamForm.resetFields()
      })
      .catch((error) => {
        console.log("Validation failed:", error)
      })
  }
  
  const PopulatedExamsState = () => (
    <>
      <List
        dataSource={examsData}
        renderItem={(exam, index) => {
          const handleToggleHidden = () => {
            const updatedExams = examsData.map((item) =>
              item.id === exam.id ? { ...item, hidden: !item.hidden } : item,
            )
            setExamsData(updatedExams)
            message.success(exam.hidden ? "Đã hiển thị đề thi" : "Đã ẩn đề thi")
          }

          const menu = (
            <Menu>
              <Menu.Item key="hide" icon={exam.hidden ? <EyeOutlined /> : <EyeInvisibleOutlined />} onClick={handleToggleHidden}>
                {exam.hidden ? "Xuất bản đề thi" : "Ngừng bản đề thi"}
              </Menu.Item>
              <Menu.Item key="hide" icon={<CopyOutlined />}>
                Nhân bản đề thi
              </Menu.Item>
              <Menu.Item key="edit" icon={<EditOutlined />}>
                Sửa đề thi
              </Menu.Item>
              <Menu.Item key="delete" icon={<DeleteOutlined />} danger
                onClick={() => {
                  setExamToDelete(exam)
                  setDeleteModalVisible(true)
                }}
              >
                Xóa đề thi
              </Menu.Item>
            </Menu>
          )

          return (
            <List.Item style={{ padding: "16px 0", border: "none" }}>
              <div style={{ display: "flex", width: "100%", alignItems: "center", opacity: exam.hidden ? 0.5 : 1,
                  transition: "opacity 0.3s ease", }}
                >
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
                    <Text strong style={{ fontSize: "16px", lineHeight: "1.4", marginBottom: "8px", display: "block" }}>
                      {exam.title}
                    </Text>
                    <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                      <Button type="text" size="small" icon={<MoreOutlined />} />
                    </Dropdown>
                  </div>
                  <Space size="large" style={{ color: "#8c8c8c", fontSize: "14px" }}>
                    <Space size={6}>
                      <ClockCircleOutlined />
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
        }}
        onClick={() => setIsAddExamModalVisible(true)}
      >
        Thêm đề thi
      </Button>
    </>
  )

  const EmptyExamsState = () => (
    <div style={{ textAlign: "center", }}>
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            width: "120px",
            height: "120px",
            margin: "0 auto 16px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <FileTextOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
          <div
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              width: "32px",
              height: "32px",
              backgroundColor: "#f0f0f0",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "16px", color: "#bfbfbf" }}>...</span>
          </div>
        </div>
      </div>
      <Text style={{ fontSize: "16px", color: "#595959", display: "block", marginBottom: "24px" }}>
        Chưa có đề thi tổng hợp
      </Text>
      <Alert
        message="Bạn chưa tạo tiêu chí cho đề thi tổng hợp của khóa học này!"
        type="warning"
        showIcon
        icon={<ExclamationCircleOutlined />}
        style={{
          marginBottom: "24px",
          backgroundColor: "#fffbe6",
          border: "1px solid #ffe58f",
          borderRadius: "6px",
        }}
      />
      <Button
        type="primary"
        size="large"
        icon={<PlusOutlined />}
        style={{
          backgroundColor: "#4c6ef5",
          borderColor: "#4c6ef5",
          height: "48px",
          fontSize: "16px",
          fontWeight: "500",
          borderRadius: "6px",
          width: "100%",
        }}
        onClick={() => {
          // Add logic to create criteria
          message.info("Tạo tiêu chí đề thi")
        }}
      >
        Tạo tiêu chí
      </Button>
    </div>
  )

  return (
    <div className="detail-course" style={{ marginTop: 24, padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Row gutter={24}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Card style={{ marginBottom: "24px", borderRadius: "8px", overflow: "hidden" }}>
            {/* Course Hero Image */}
            <div style={{ marginBottom: "24px" }}>
              <Image
                src={require("assets/img/lich_khoa_hoc.jpg").default}
                alt="Classroom"
                style={{ width: "100%", objectFit: "cover", borderRadius: "8px" }}
                preview={false}
              />
            </div>

            {/* Course Title */}
            <Title level={2} style={{ marginBottom: "24px", color: "#262626" }}>
              Khóa học Toán nền tảng lớp 12
            </Title>

            {/* Course Info */}
            <Row gutter={[0, 16]} style={{ marginBottom: "24px" }}>
              <Col span={24}>
                <Row>
                  <Col span={4}>
                    <Text strong style={{ color: "#8c8c8c" }}>
                      Giảng viên:
                    </Text>
                  </Col>
                  <Col span={20}>
                    <Text>Nguyễn văn A</Text>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={4}>
                    <Text strong style={{ color: "#8c8c8c" }}>
                      Thời gian học:
                    </Text>
                  </Col>
                  <Col span={20}>
                    <Text>Từ 01/06/2025 đến 31/08/2025.</Text>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={4}>
                    <Text strong style={{ color: "#8c8c8c" }}>
                      Loại khóa học:
                    </Text>
                  </Col>
                  <Col span={20}>
                    <Text>Ôn luyện nền tảng</Text>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={4}>
                    <Text strong style={{ color: "#8c8c8c" }}>
                      Hình thức học:
                    </Text>
                  </Col>
                  <Col span={20}>
                    <Text>Học online, Học offline</Text>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={4}>
                    <Text strong style={{ color: "#8c8c8c" }}>
                      Học phí:
                    </Text>
                  </Col>
                  <Col span={20}>
                    <Text strong style={{ fontSize: "16px", color: "#262626" }}>
                      1.200.000 VND
                    </Text>
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* Action Buttons */}
            <Space >
              <Button icon={<EyeInvisibleOutlined />}>Ẩn khóa học</Button>
              <Button icon={<EditOutlined />}>Chỉnh sửa</Button>
              <Button icon={<DeleteOutlined />} />
            </Space>

            <Divider />

            {/* Course Description */}
            <div>
              <Title level={4} style={{ marginBottom: "16px" }}>
                Mô tả
              </Title>
              <Paragraph style={{ color: "#242424", fontWeight: 400, lineHeight: "1.6", fontSize: 16 }}>
                Khóa học Toán nền tảng lớp 12 được thiết kế nhằm giúp học sinh nắm vững kiến thức cốt lõi của chương
                trình Toán lớp 12, tạo nền tảng vững chắc cho kỳ thi tốt nghiệp THPT và xét tuyển đại học. Nội dung học
                tập đề hiệu, bài giảng sức tích, phù hợp với mọi trình độ học sinh.
              </Paragraph>
            </div>

            <Divider />

            {/* Course Introduction */}
            <div >
              <Title level={4} style={{ marginBottom: "16px" }}>
                Giới thiệu khóa học
              </Title>
              <Paragraph style={{ color: "#242424", fontWeight: 400, lineHeight: "1.6", fontSize: 16 }}>
                Khóa học cung cấp hệ thống kiến thức tổng hợp và chuẩn hóa theo chương trình của Bộ Giáo dục, tập trung
                vào các chuyên đề trong tâm như: hàm số, mũ – logarit, nguyên hàm – tích phân, số phức, hình học không
                gian Oxyz, và xác suất.
              </Paragraph>
              <Paragraph style={{ color: "#242424", fontWeight: 400, lineHeight: "1.6", fontSize: 16 }}>
                Học viên sẽ được tiếp cận phương pháp giải nhanh, tư duy logic, và cách phân tích đề thi hiệu quả qua
                các video bài giảng, bài tập minh họa và đề kiểm tra định kỳ.
              </Paragraph>
            </div>

          </Card>
        </Col>

        {/* Sidebar - Course Content */}
        <Col xs={24} lg={8}>
          <Card style={{ borderRadius: "8px" }}>
            <Title level={4} style={{ marginBottom: "16px" }}>
              Nội dung khóa học
            </Title>

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane
                tab={
                  <span>
                    Chương học{" "}
                    <Tag color="red" style={{ marginLeft: "4px" }}>
                      7
                    </Tag>
                  </span>
                }
                key="chapters"
              >
                <List
                  dataSource={courseChapters}
                  renderItem={(chapter, index) => {
                    const menu = (
                      <Menu>
                        <Menu.Item key="hide" icon={<EyeOutlined />}>
                          Ẩn chương
                        </Menu.Item>
                        <Menu.Item key="edit" icon={<EditOutlined />}>
                          Sửa chương
                        </Menu.Item>
                        <Menu.Item key="delete" icon={<DeleteOutlined />} danger
                          onClick={() => {
                            setExamToDelete(chapter)
                            setDeleteModalVisible(true)
                          }}
                        >
                          Xóa chương
                        </Menu.Item>
                      </Menu>
                    )
                    return (
                      <List.Item style={{ padding: "12px 0", border: "none" }}>
                        <div style={{ display: "flex", width: "100%", alignItems: "flex-start", cursor: "pointer" }}
                          onClick={() => handleChapterClick(chapter)}
                        >
                          <Avatar
                            shape="square"
                            size={60}
                            src={chapter.thumbnail}
                            style={{ backgroundColor: chapter.bgColor, marginRight: "12px", flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Text strong style={{ fontSize: "16px", lineHeight: "1.4", marginBottom: "8px" }}>
                                {chapter.title}
                              </Text>
                              <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                                <Button type="text" size="small" icon={<MoreOutlined />} />
                              </Dropdown>
                            </div>
                            <Space size="large" style={{ color: "#8c8c8c", fontSize: "14px" }}>
                              <Space size={4}>
                                <PlayCircleOutlined />
                                <span>{chapter.lessons} chuyên đề</span>
                              </Space>
                              <Space size={4}>
                                <ClockCircleOutlined />
                                <span>{chapter.duration}</span>
                              </Space>
                            </Space>
                          </div>
                        </div>
                      </List.Item>
                    )}}
                />
                <Button
                  type="primary"
                  block
                  icon={<PlusOutlined />}
                  style={{ marginTop: "16px", backgroundColor: "#4c6ef5", borderColor: "#4c6ef5" }}
                  onClick={() => setIsAddChapterModalVisible(true)}
                >
                  Thêm chương học
                </Button>
              </TabPane>
              
              <TabPane
                tab={
                  <span>
                    Đề thi tổng hợp{" "}
                    <Tag style={{ marginLeft: "4px", backgroundColor: "#f0f0f0", color: "#8c8c8c", border: "none" }}>
                      3
                    </Tag>
                  </span>
                }
                key="exams"
              >
                {examsData.length === 0 ? <EmptyExamsState /> : <PopulatedExamsState />}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Add Chapter Modal */}
      <Modal
        title="Thêm chương học mới"
        open={isAddChapterModalVisible}
        onCancel={() => {
          setIsAddChapterModalVisible(false)
          addChapterForm.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsAddChapterModalVisible(false)}>
            Hủy bỏ
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              addChapterForm
                .validateFields()
                .then((values) => {
                  console.log("Form values:", values)
                  message.success("Thêm chương học thành công!")
                  setIsAddChapterModalVisible(false)
                  addChapterForm.resetFields()
                })
                .catch((error) => {
                  console.log("Validation failed:", error)
                })
            }}
            style={{ backgroundColor: "#4c6ef5", borderColor: "#4c6ef5" }}
          >
            Xác nhận
          </Button>,
        ]}
        width={800}
        destroyOnClose
      >
        <Form form={addChapterForm} layout="vertical" style={{ marginTop: "16px" }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span>Tên chương học</span>
                }
                name="chapterName"
                rules={[{ required: true, message: "Vui lòng nhập tên chương học" }]}
              >
                <Input placeholder="Nhập" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span>Lĩnh vực</span>
                }
                name="field"
                rules={[{ required: true, message: "Vui lòng chọn lĩnh vực" }]}
              >
                <Select placeholder="Chọn">
                  <Option value="math">Toán học</Option>
                  <Option value="physics">Vật lý</Option>
                  <Option value="chemistry">Hóa học</Option>
                  <Option value="literature">Văn học</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span>Khung chương trình</span>
                }
                name="curriculum"
                rules={[{ required: true, message: "Vui lòng chọn khung chương trình" }]}
              >
                <Select placeholder="Chọn" defaultValue="math-foundation-12">
                  <Option value="math-foundation-12">Khóa học Toán nền tảng lớp 12</Option>
                  <Option value="math-advanced-12">Khóa học Toán nâng cao lớp 12</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span>Khóa học</span>
                }
                name="course"
                rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
              >
                <Select placeholder="Chọn">
                  <Option value="course1">Khóa học 1</Option>
                  <Option value="course2">Khóa học 2</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Chuyên ngành" name="major">
                <Select placeholder="Chọn" defaultValue="math">
                  <Option value="math">Toán</Option>
                  <Option value="physics">Vật lý</Option>
                  <Option value="chemistry">Hóa học</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giáo viên" name="teacher">
                <Select placeholder="Chọn" defaultValue="nguyen">
                  <Option value="nguyen">
                    <Space>
                      <Avatar size="small" style={{ backgroundColor: "#ff4d4f" }}>
                        LG
                      </Avatar>
                      Nguyễn
                    </Space>
                  </Option>
                  <Option value="tran">
                    <Space>
                      <Avatar size="small" style={{ backgroundColor: "#52c41a" }}>
                        TH
                      </Avatar>
                      Trần
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả chương học" name="description">
            <Input.TextArea
              rows={4}
              placeholder="Mô tả về chương học"
              maxLength={300}
              showCount
              style={{ resize: "none" }}
            />
          </Form.Item>

          <Form.Item label="Ảnh đại diện" name="image">
            <Upload.Dragger name="image" multiple={false} beforeUpload={() => false} style={{ padding: "20px" }}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: "24px", color: "#d9d9d9" }} />
              </p>
              <p className="ant-upload-text">Click hoặc kéo file vào đây</p>
              <p className="ant-upload-hint" style={{ color: "#8c8c8c" }}>
                Dung lượng không quá 5 mb
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item label="Video đại diện" name="video">
            <Upload.Dragger name="video" multiple={false} beforeUpload={() => false} style={{ padding: "20px" }}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ fontSize: "24px", color: "#d9d9d9" }} />
              </p>
              <p className="ant-upload-text">Click hoặc kéo file vào đây</p>
              <p className="ant-upload-hint" style={{ color: "#8c8c8c" }}>
                Dung lượng không quá 100 mb
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title={null}
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false)
          setExamToDelete(null)
        }}
        footer={null}
        width={420}
        centered
        closable={false}
        className="delete-confirmation-modal"
      >
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 16px",
              backgroundColor: "#fff2f0",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ExclamationCircleFilled style={{ fontSize: "32px", color: "#ff4d4f" }} />
          </div>
          <Title level={4} style={{ marginBottom: "16px" }}>
            Xoá đề thi tổng hợp
          </Title>
          <Paragraph style={{ fontSize: "16px", color: "#595959", marginBottom: "24px" }}>
            Bạn có chắc chắn muốn xoá đề thi tổng hợp{" "}
            <Text strong style={{ color: "#262626" }}>
              "{examToDelete?.title}"
            </Text>{" "}
            không?
          </Paragraph>
          <Row gutter={16}>
            <Col span={12}>
              <Button
                block
                size="large"
                onClick={() => {
                  setDeleteModalVisible(false)
                  setExamToDelete(null)
                }}
                style={{ height: "48px", borderRadius: "6px" }}
              >
                Huỷ bỏ
              </Button>
            </Col>
            <Col span={12}>
              <Button
                block
                size="large"
                danger
                type="primary"
                onClick={handleDeleteExam}
                style={{ height: "48px", borderRadius: "6px" }}
              >
                Xác nhận
              </Button>
            </Col>
          </Row>
        </div>
      </Modal>
      
      <Modal
        title="Tạo đề thi tổng hợp"
        open={isAddExamModalVisible}
        onCancel={() => {
          setIsAddExamModalVisible(false)
          addExamForm.resetFields()
        }}
        footer={null}
        width={500}
        destroyOnClose
        className="add-exam-modal"
      >
        <Form form={addExamForm} layout="vertical" >
          <Form.Item
            label={
              <span>Khóa học</span>
            }
            name="course"
            rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
            initialValue="math-foundation-12"
          >
            <Select>
              <Option value="math-foundation-12">Khóa học toán nền tảng lớp 12</Option>
              <Option value="math-advanced-12">Khóa học toán nâng cao lớp 12</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span>File đề thi</span>
            }
            name="examFile"
            rules={[{ required: true, message: "Vui lòng tải lên file đề thi" }]}
          >
            <Dragger
              name="file"
              multiple={false}
              beforeUpload={() => false}
              style={{ padding: "30px 20px" }}
              accept=".doc,.docx,.pdf"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: "28px", color: "#d9d9d9" }} />
              </p>
              <p className="ant-upload-text" style={{ fontSize: "16px", color: "#262626", margin: "8px 0" }}>
                CLick hoặc kéo file vào đây
              </p>
              <p className="ant-upload-hint" style={{ color: "#8c8c8c", fontSize: "14px" }}>
                Định dạng file docs
              </p>
            </Dragger>
          </Form.Item>

          <Row gutter={16} style={{ marginTop: "24px" }}>
            <Col span={12}>
              <Button block size="large" onClick={() => setIsAddExamModalVisible(false)} 
                style={{ height: "48px", border: 'none', background: '#F2F4F5', borderRadius: 8 }}
              >
                Huỷ bỏ
              </Button>
            </Col>
            <Col span={12}>
              <Button
                block
                type="primary"
                size="large"
                onClick={handleAddExam}
                style={{ height: "48px", backgroundColor: "#292B8E", borderColor: "#292B8E", borderRadius: 8 }}
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

export default CourseDetail
