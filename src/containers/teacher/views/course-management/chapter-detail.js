
import { useState, useEffect } from "react"
import { useHistory, useParams } from "react-router-dom"
import { Row, Col, Card, Typography, Button, Space, Tabs, List, Avatar, Image,
  Dropdown, Menu, Modal, Form, Upload, message, Select, Input, Alert
} from "antd"
import {
  EyeInvisibleOutlined, EditOutlined, DeleteOutlined, PlusOutlined,
  MoreOutlined, FileTextOutlined, PlayCircleOutlined,
  UploadOutlined, ExclamationCircleFilled, ExclamationCircleOutlined,
  EyeOutlined, CopyOutlined, InboxOutlined,
} from "@ant-design/icons"
import './chapter-detail.css';

import * as courseAction from '../../../../redux/actions/course';
import * as programmeAction from '../../../../redux/actions/programme';
import * as descriptionAction from '../../../../redux/actions/descriptionCourse';
import { useSelector, useDispatch } from "react-redux";

// ==================================================================== 
{/* Giao diện mô đun (chi  tiết khoá học) */}
// ==================================================================== 

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
    hidden: false,
  },
  {
    id: 2,
    title: "Đề thi chương 1 - Phần 2",
    duration: "45 phút",
    questions: "20 câu",
    hidden: false,
  },
]

const ChapterDetail = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const idChapter = useParams().idChapter; // id of the Chapter from URL params
  const [activeTab, setActiveTab] = useState("topics")
  const [isAddTopicModalVisible, setIsAddTopicModalVisible] = useState(false)
  const [isAddChapterModalVisible, setIsAddChapterModalVisible] = useState(false);
  const [isAddModunExamModalVisible, setIsAddModunExamModalVisible] = useState(false)
  const [TopicForm] = Form.useForm();
  const [chapterForm] = Form.useForm();
  const [addModunExamForm] = Form.useForm();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [examsData, setExamsData] = useState(chapterExams)
  const [examToDelete, setExamToDelete] = useState(null);
  const [modunToDelete, setModunToDelete] = useState(null);


  const handleAddTopic = () => {
    TopicForm
      .validateFields()
      .then((values) => {
        console.log("Form values:", values)
        message.success("Thêm chuyên đề thành công!")
        setIsAddTopicModalVisible(false)
        TopicForm.resetFields()
      })
      .catch((error) => {
        console.log("Validation failed:", error)
      })
  }

  const onViewExam = () => {
    message.info("Xem đề thi chương học")
  }

  // event xoá chương học / đề thị modun
  const handleDelete = () => {
    if (!examToDelete) { // Delete chapter
      // call api

      message.success("Đã xóa chương học thành công!")
      history.push(`/teacher/course-management`)
      setDeleteModalVisible(false)
      return
    }
    if (!modunToDelete) { // Delete topic
      // call api
      
      message.success("Đã xóa chuyên đề thành công!")
      setDeleteModalVisible(false)
      setModunToDelete(null)
      return
    }
    if (!examToDelete) {
      message.error("Không có đề thi nào được chọn để xóa!")
      return
    }

    // xoá đề thi
    const updatedExams = examsData.filter((exam) => exam.id !== examToDelete.id)
    setExamsData(updatedExams)
    setExamToDelete(null)
    setDeleteModalVisible(false)
    message.success("Đã xóa đề thi thành công!")
  }

  // UI for empty exams state
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
        Chưa có đề thi chương học
      </Text>
      <Alert
        message="Bạn chưa tạo tiêu chí cho đề thi chương học này!"
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
          message.info("Tạo tiêu chí đề thi chương học")
        }}
      >
        Tạo tiêu chí đề thi chương học
      </Button>
    </div>
  )

  // Render UI for chapter detail
  const RightContentChapterDetail = () => (
      <>
        <List
          dataSource={chapterExams}
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
                  {exam.hidden ? "Xuất bản đề thi" : "Ngừng xuất bản đề thi"}
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
              <List.Item className="exam-item">
                <div className="exam-item-detail" >
                  <Avatar className="avatar" onClick={onViewExam}
                    size={48}
                    icon={<FileTextOutlined />}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Text className="exam-title" strong onClick={onViewExam}>
                        {exam.title}
                      </Text>
                      <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button type="text" size="small" icon={<MoreOutlined />} />
                      </Dropdown>
                    </div>
                    <Space size="large" style={{ color: "#8c8c8c", fontSize: "14px" }} onClick={onViewExam}>
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
          className="btn-add"
          onClick={() => setIsAddModunExamModalVisible(true)}
        >
          Thêm đề thi
        </Button>
      </>
  )
  
  return (
    <div className="chapter-detail">
      
      <Row gutter={24}>
        {/* Left Content */}
        <Col xs={24} lg={12}>
          <Card style={{ borderRadius: "8px", height: "fit-content" }}>
            {/* Chapter Image */}
            <div style={{ marginBottom: "24px" }}>
              <Image
                src={require("assets/img/lich_khoa_hoc.jpg").default}
                alt="Calculator and documents"
                style={{ objectFit: "cover", borderRadius: "8px" }}
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
              <Button icon={<EditOutlined />} style={{ borderRadius: "6px" }}
                onClick={() => setIsAddChapterModalVisible(true)}
              >
                Sửa chương
              </Button>
              <Button icon={<DeleteOutlined />} danger style={{ borderRadius: "6px" }} 
                onClick={() => {
                  setDeleteModalVisible(true)
                }}
              />
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
                        <Menu.Item key="delete" icon={<DeleteOutlined />} danger
                          onClick={() => {
                            setModunToDelete(topic);
                            setDeleteModalVisible(true);
                          }}
                        >
                          Xóa chuyên đề
                        </Menu.Item>
                      </Menu>
                    )

                    return (
                      <List.Item className="modun-item">
                        <div className="modun-item-detail">
                          <Avatar className="avatar"
                            size={48}
                            icon={<FileTextOutlined />}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Text strong className="modun-title" onClick={() => history.push(`/teacher/module-detail/${topic.id}`)}>
                                {topic.title}
                              </Text>
                              <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight" onClick={(e) => e.stopPropagation()}>
                                <Button type="text" size="small" icon={<MoreOutlined />} />
                              </Dropdown>
                            </div>
                            <Space size="large" style={{ color: "#8c8c8c", fontSize: "14px" }} 
                              onClick={() => history.push(`/teacher/module-detail/${topic.id}`)}
                            >
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
                  className="btn-add"
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
                {examsData.length === 0 ? <EmptyExamsState /> : <RightContentChapterDetail />}
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
          TopicForm.resetFields()
        }}
        footer={null}
        width={900}
        destroyOnClose
        className="add-topic-modal"
      >
        <Form form={TopicForm} layout="vertical" style={{ marginTop: "24px" }}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label={
                  <span>Tên chuyên đề</span>
                }
                name="topicName"
                rules={[{ required: true, message: "Vui lòng nhập tên chuyên đề" }]}
              >
                <Input placeholder="Nhập tên chuyên đề"/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span>Khung chương trình</span>
                }
                name="curriculum"
                rules={[{ required: true, message: "Vui lòng chọn khung chương trình" }]}
                initialValue="math-foundation-12"
              >
                <Select style={{ height: "48px" }}>
                  <Option value="math-foundation-12">
                      Khóa học Toán nền tảng lớp 12
                  </Option>
                  <Option value="math-advanced-12">
                      Khóa học Toán nâng cao lớp 12
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label={
                  <span>Khóa học</span>
                }
                name="course"
                rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
                initialValue="math-foundation-12"
              >
                <Select style={{ height: "48px" }}>
                  <Option value="math-foundation-12">Khóa học Toán nền tảng lớp 12</Option>
                  <Option value="math-advanced-12">Khóa học Toán nâng cao lớp 12</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span>Chương học</span>
                }
                name="chapter"
                rules={[{ required: true, message: "Vui lòng chọn chương học" }]}
                initialValue="chapter-1"
              >
                <Select style={{ height: "48px" }}>
                  <Option value="chapter-1">Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số</Option>
                  <Option value="chapter-2">Chương 2: Mũ – Logarit</Option>
                  <Option value="chapter-3">Chương 3: Nguyên hàm – Tích phân – Ứng dụng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Lĩnh vực" name="field" initialValue="math">
                <Select style={{ height: "48px" }}>
                  <Option value="math">Toán</Option>
                  <Option value="physics">Vật lý</Option>
                  <Option value="chemistry">Hóa học</Option>
                  <Option value="literature">Văn học</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái" name="status" initialValue="active">
                <Select style={{ height: "48px" }}>
                  <Option value="active">Hoạt động</Option>
                  <Option value="inactive">Không hoạt động</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <Input.TextArea
              rows={6}
              placeholder="Nhập mô tả chuyên đề"
              maxLength={300}
              showCount
              style={{
                resize: "none",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            />
          </Form.Item>

          <Row gutter={16} style={{ marginTop: "32px" }}>
            <Col span={12}>
              <Button
                block
                size="large"
                onClick={() => {
                  setIsAddTopicModalVisible(false)
                  TopicForm.resetFields()
                }}
                className="btn-cancel"
              >
                Huỷ bỏ
              </Button>
            </Col>
            <Col span={12}>
              <Button className="btn-add"
                block
                type="primary"
                size="large"
                onClick={handleAddTopic}
              >
                Xác nhận
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* edit Chapter Modal */}
      <Modal
        title="Sửa chương học"
        open={isAddChapterModalVisible}
        onCancel={() => {
          setIsAddChapterModalVisible(false)
          chapterForm.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsAddChapterModalVisible(false)}>
            Hủy bỏ
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              chapterForm
                .validateFields()
                .then((values) => {
                  message.success("Cập nhật chương học thành công!")
                  setIsAddChapterModalVisible(false)
                  chapterForm.resetFields()
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
        <Form form={chapterForm} layout="vertical" style={{ marginTop: "16px" }}>
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

      {/* Delete Exam Confirmation Modal */}
      <Modal
        title={null}
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setExamToDelete(null);
          setModunToDelete(null);
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
            Xoá {examToDelete ? 'đề thi' : modunToDelete ? "Chuyên đề" : "Chương học"}
          </Title>
          <Paragraph style={{ fontSize: "16px", color: "#595959", marginBottom: "24px" }}>
            Bạn có chắc chắn muốn xoá {" "} {examToDelete ? 'đề thi' : modunToDelete ? "Chuyên đề" : "Chương học"} này?
          </Paragraph>
          <Row gutter={16}>
            <Col span={12}>
              <Button
                block
                size="large"
                onClick={() => {
                  setDeleteModalVisible(false);
                  setExamToDelete(null);
                  setModunToDelete(null);
                }}
                style={{
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: "500",
                  borderRadius: "6px",
                  border: 'none',
                  background: '#F2F4F5'
                }}
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
                onClick={handleDelete}
                style={{ height: "48px", borderRadius: "6px" }}
              >
                Xác nhận
              </Button>
            </Col>
          </Row>
        </div>
      </Modal>
      
      {/* add exam modun*/}
      <Modal
        title="Tạo đề thi Chuyên đề"
        open={isAddModunExamModalVisible}
        onCancel={() => {
          setIsAddModunExamModalVisible(false)
          addModunExamForm.resetFields()
        }}
        footer={null}
        width={600}
        destroyOnClose
        className="add-modun-exam-modal"
      >
        <Form form={addModunExamForm} layout="vertical" style={{ marginTop: "24px" }}>
          <Form.Item
            label={
              <span>Khóa học</span>
            }
            name="course"
            rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
            initialValue="math-foundation-12"
          >
            <Select >
              <Option value="math-foundation-12">Khóa học toán nền tảng lớp 12</Option>
              <Option value="math-advanced-12">Khóa học toán nâng cao lớp 12</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <span>Chương học</span>
            }
            name="chapter"
            rules={[{ required: true, message: "Vui lòng chọn chương học" }]}
            initialValue="chapter-1"
          >
            <Select >
              <Option value="chapter-1">Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số</Option>
              <Option value="chapter-2">Chương 2: Mũ – Logarit</Option>
              <Option value="chapter-3">Chương 3: Nguyên hàm – Tích phân – Ứng dụng</Option>
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
              style={{ padding: "40px 20px", borderRadius: "8px" }}
              accept=".doc,.docx,.pdf"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: "32px", color: "#d9d9d9" }} />
              </p>
              <p className="ant-upload-text" style={{ fontSize: "16px", color: "#262626", margin: "12px 0 8px" }}>
                Click hoặc kéo file vào đây
              </p>
              <p className="ant-upload-hint" style={{ color: "#8c8c8c", fontSize: "14px" }}>
                Định dạng file docs
              </p>
            </Dragger>
          </Form.Item>

          <Row gutter={16} style={{ marginTop: "32px" }}>
            <Col span={12}>
              <Button
                block
                size="large"
                onClick={() => {
                  setIsAddModunExamModalVisible(false)
                  addModunExamForm.resetFields()
                }}
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
                // onClick={handleAddChapterExam}
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

export default ChapterDetail
