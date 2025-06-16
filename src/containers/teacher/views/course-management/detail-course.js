
import { useState, useEffect } from "react"
import { useHistory, useParams } from "react-router-dom"
import { Row, Col, Card, Typography, Button, Space, Tabs, List, Avatar, 
  Tag, Image, Divider, Dropdown, Menu, Modal, Form, message, Select, Input,
  Upload, Alert, notification, Radio } from "antd"
import {
  EyeInvisibleOutlined, EditOutlined, PlayCircleOutlined,
  ClockCircleOutlined, DeleteOutlined, PlusOutlined,
  EyeOutlined, MoreOutlined, FileTextOutlined,
  UploadOutlined, ExclamationCircleOutlined, CopyOutlined,
  ExclamationCircleFilled, InboxOutlined,
} from "@ant-design/icons"
import config from '../../../../configs/index';
import moment from "moment"
import * as CurrencyFormat from 'react-currency-format';

// redux
import * as courseAction from '../../../../redux/actions/course';
import * as partActions from '../../../../redux/actions/part';
import * as descriptionAction from '../../../../redux/actions/descriptionCourse';
import * as programmeAction from '../../../../redux/actions/programme';
import * as majorActions from '../../../../redux/actions/major';
import { useSelector, useDispatch } from "react-redux";

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
    trang_thai: false, // Initially visible 
  },
  {
    id: 2,
    title: "Chương 2: Mũ – Logarit",
    lessons: 6,
    duration: "1 đề thi",
    thumbnail: "/placeholder.svg?height=60&width=80",
    bgColor: "#f6ffed",
    trang_thai: true, // Initially visible
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
  const dispatch = useDispatch();
  const idCourse = useParams().idCourse;
  const [activeTab, setActiveTab] = useState("chapters");
  const [isAddChapterModalVisible, setIsAddChapterModalVisible] = useState(false)
  const [isAddExamModalVisible, setIsAddExamModalVisible] = useState(false)
  const [addChapterForm] = Form.useForm()
  const [addExamForm] = Form.useForm()
  const [examsData, setExamsData] = useState(comprehensiveExams)
  const [examToDelete, setExamToDelete] = useState(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  const course = useSelector(state => state.course.item.result);
  const courses = useSelector(state => state.course.list.result);
  const programmes = useSelector(state => state.programme.list.result);
  const description = useSelector(state => state.descriptionCourse.item.result);
  const majors = useSelector(state => state.major.list.result);

  const [state, setState] = useState({
    // courseId: 1,
    // checkedList: [],
    // checkAll: false,
    // isEdit: false,
    // isChanged: false,
    // openMediaLibrary: false,
    // form: defaultForm,
    // upload image and video
    fileImg: '',
    fileVid: '',
  });

  // props for upload image
  const propsImage = {
    name: 'file',
    action: '#',

    beforeUpload: file => {
      const isPNG = file.type === 'image/png' || file.type === 'image/jpeg';
      if (!isPNG) {
        message.error(`${file.name} có định dạng không phải là png/jpg`);
      }
      return isPNG || Upload.LIST_IGNORE;
    },

    onChange(info) {
      setState({ ...state, fileImg: info.file.originFileObj });
    },

    async customRequest(options) {
      const { onSuccess } = options;

      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },

    onRemove(e) {
      setState({ ...state, fileImg: '' });
    },
  };

  // props for upload image
  const propsVideo = {
    name: 'file',
    action: '#',

    beforeUpload: file => {
      const isPNG = file.type === 'video/mp4';
      if (!isPNG) {
        message.error(`${file.name} có định dạng không phải là video/mp4`);
      }
      return isPNG || Upload.LIST_IGNORE;
    },

    onChange(info) {
      setState({ ...state, fileVid: info.file.originFileObj });
    },

    async customRequest(options) {
      const { onSuccess } = options;

      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },
    
    onRemove(e) {
      setState({ ...state, fileVid: '' });
    },
  };

  useEffect(() => {
    dispatch(courseAction.getCourse({ id: idCourse }));
    dispatch(descriptionAction.getDescriptionCourse({ id: idCourse }));
    dispatch(programmeAction.getProgrammes({ status: '' }));
    dispatch(majorActions.getMajors());
  }, []);

  const handleDeleteExam = () => {
    if (examToDelete) {
      const updatedExams = examsData.filter((exam) => exam.id !== examToDelete.id)
      setExamsData(updatedExams)
      message.success("Đã xóa đề thi thành công!")
      setDeleteModalVisible(false)
      setExamToDelete(null)
    }
  }
  
  const renderProgramme = () => {
    let options = [];
      if (programmes.status === 'success') {
        // lấy ra các khung chương trình luyện thi, học
        options = programmes.data
        .filter((programme) => programme.loai_kct === 2 || programme.loai_kct === 4 || programme.loai_kct === 5)
        .map((programme) => (
            <Option key={programme.kct_id} value={programme.kct_id} >{programme.ten_khung_ct}</Option>
        ))
      }
      return (
          <Select
            showSearch={true}
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            placeholder="Chọn khung chương trình"
            onChange={(kct_id) => dispatch(courseAction.getCourses({ idkct: kct_id, status: '', search: '', pageSize: 99999999, pageIndex: 1 }))}
          >
          {options}
          </Select>
    );
  };

  const renderCourses = () => {
    let options = [];
    if (courses.status === 'success') {
      options = courses?.data
      ?.filter((course) => course?.khung_chuong_trinh?.loai_kct === 2 || course?.khung_chuong_trinh?.loai_kct === 4 || course?.khung_chuong_trinh?.loai_kct === 5)
      ?.map((course) => (
        <Option key={course.khoa_hoc_id} value={course.khoa_hoc_id} >{course.ten_khoa_hoc}</Option>
      ))
    }
    return (
      <Select
        showSearch={true} 
        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
        placeholder="Chọn khóa học"
      >
        {options}
      </Select>
    );
  }

  const renderMajor = () => {
        let options = [];
        if (majors.status === 'success') {
          options = majors.data.map((major) => (
            <Option key={major.chuyen_nganh_id} value={major.chuyen_nganh_id} >{major.ten_chuyen_nganh}</Option>
          ))
        }
        return (
          <Select
            showSearch={false}
            placeholder="Chọn chuyên ngành"
          >
            {options}
          </Select>
        );
      };

  // Event ẩn khoá học
  const handleHideCourse = () => {
    const callback = (res) => {
      if (res.statusText === 'OK' && res.status === 200) {
        notification.success({
          message: 'Thành công',
          description: course?.data?.trang_thai ? 'Ẩn khóa học thành công' : 'Hiện khóa học thành công',
        })
      } else {
        notification.error({
          message: 'Thông báo',
          description: course?.data?.trang_thai ? 'Ẩn khóa học thất bại' : 'Hiện khóa học thất bại',
        })
      }
    };

    const formData = new FormData();
    formData.append('trang_thai', !course?.data?.trang_thai );
    dispatch(courseAction.EditCourse({ formData: formData, idCourse: idCourse }, callback))
  }

  // event ẩn chương học
  const handleHideModule = (chapter) => {

    const formData = new FormData();
    formData.append('trang_thai', chapter.trang_thai);

    const callback = (res) => {
        if (res.statusText === 'OK' && res.status === 200) {
            notification.success({
                message: 'Thành công',
                description: chapter.trang_thai ? 'Hiện chương học thành công' : 'Ẩn chương học thành công',
            });
        } else {
            notification.error({
                message: 'Thông báo',
                description: chapter.trang_thai ? 'Hiện chương học thất bại' : 'Ẩn chương học thất bại',
            })
        }
    };
    dispatch(partActions.EditModule({ formData: formData, idModule: chapter.id }, callback));
  }

  // Event xoá khoá học
  const handleDeleteCourse = () => {
    Modal.confirm({
        icon: <ExclamationCircleOutlined />,
        content: 'Bạn có chắc chán muốn xóa khóa học này?',
        okText: 'Đồng ý',
        cancelText: 'Hủy',
        onOk() {
            const callback = (res) => {
                if (res.statusText === 'OK' && res.status === 200) {
                    notification.success({
                        message: 'Thành công',
                        description: 'Xóa khóa học thành công',
                    })
                    history.push('/teacher/course-management')
                } else {
                    notification.error({
                        message: 'Thông báo',
                        description: 'Xóa khóa học mới thất bại',
                    })
                };
            }
        dispatch(courseAction.DeleteCourse({ idLesson: idCourse }, callback))
        },
    });
  }

  const handleChapterClick = (chapter) => {
    history.push(`/teacher/detail-chapter/${chapter.id}`)
  }

  // Event tạo chương học 
  const createModule = (values) => {
    if (values.khoa_hoc_id === undefined) { // check null
      notification.warning({
        message: 'Cảnh báo',
        description: 'Thông tin chương học chưa đủ',
      })
      return;
    }
    const formData = new FormData();
    formData.append('ten_mo_dun', values.ten_mo_dun);
    formData.append('linh_vuc', values.linh_vuc);
    formData.append('mo_ta', values.mo_ta !== undefined ? values.mo_ta : '' );
    formData.append('khoa_hoc_id', values.khoa_hoc_id);
    formData.append('loai_tong_hop', values.loai_tong_hop);
    formData.append('giao_vien_id', JSON.parse(localStorage.getItem('userInfo'))?.giao_vien_id );

    // video , image
    if (state.fileImg !== '')
      formData.append('anh_dai_dien', state.fileImg !== undefined ? state.fileImg : '');
    if (state.fileVid !== '')
      formData.append('video_gioi_thieu', state.fileVid);

    const callback = (res) => {
      if (res.data.status === 'success' && res.status === 200) {
        addChapterForm.resetFields();
        setIsAddChapterModalVisible(false);
        // request api lấy danh sách chương học mới
        dispatch(partActions.filterModule({ idCourse: idCourse, status: '', search: '', start: '', end: ''}));
        notification.success({
          message: 'Thành công',
          description: 'Thêm chương học mới thành công',
        })
      } else {
        notification.error({
          message: 'Thông báo',
          description: 'Thêm chương học mới thất bại. Chú ý 1 chương học chỉ có 1 phần tổng hợp',
        })
      }
    };
    dispatch(partActions.CreateModule(formData, callback));
  };

  /// event xoá chương học
  const handleDeleteModun = (id) => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chán muốn xóa mô đun này?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk() {
        const callback = (res) => {
          if (res.statusText === 'OK' && res.status === 200) {
            dispatch(partActions.filterModule({ idCourse: idCourse, status: '', search: '', start: '', end: ''}));
            notification.success({
              message: 'Thành công',
              description: 'Xóa module mới thành công',
            })
          } else {
            notification.error({
              message: 'Thông báo',
              description: 'Xóa module mới thất bại',
            })
          };
        }
        dispatch(partActions.DeleteModule({ idModule: id }, callback))
      },
    });
  };
  
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
    <div className="detail-course">
      <Row gutter={24}>
        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Card style={{ marginBottom: "24px", borderRadius: "8px", overflow: "hidden" }}>
            {/* Course Hero Image */}
            <div style={{ marginBottom: "24px" }}>
              <Image
                src={course?.data?.anh_dai_dien ? config.API_URL + `${course?.data?.anh_dai_dien}` : require('assets/img/default.jpg').default}
                alt="Classroom"
                style={{ width: "100%", objectFit: "cover", borderRadius: "8px" }}
                preview={false}
              />
            </div>

            {/* Course Title */}
            <Title level={2} style={{ marginBottom: "24px", color: "#262626" }}>
              {course?.data?.ten_khoa_hoc}
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
                    <Text>{JSON.parse(localStorage.getItem('userInfo'))?.ho_ten}</Text>
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
                    <Text>Từ {moment(course?.data?.ngay_bat_dau).utc(7).format(config.DATE_FORMAT_SHORT)} đến {moment(course?.data?.ngay_ket_thuc).utc(7).format(config.DATE_FORMAT_SHORT)}.</Text>
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
                    <Text>Học online</Text>
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
                    <CurrencyFormat style={{ fontSize: "16px", color: "#262626" }}
                        value={description?.data?.gia_goc !== null ? description?.data?.gia_goc : 0} 
                        displayType={'text'} thousandSeparator={true} suffix={' VNĐ'}
                      />
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* Action Buttons */}
            <Space >
              <Button onClick={() => handleHideCourse()} 
                icon={course?.data?.trang_thai ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              >
                {course?.data?.trang_thai ? 'Ẩn khóa học' : 'Hiện khóa học'}
              </Button>
              <Button icon={<EditOutlined />}>Chỉnh sửa</Button>
              <Button icon={<DeleteOutlined />} onClick={() => handleDeleteCourse()}/>
            </Space>

            <Divider />

            {/* Course Description */}
            <div>
              <Title level={4} style={{ marginBottom: "16px" }}>
                Mô tả chung
              </Title>
              <p style={{ color: "#242424", fontWeight: 400, lineHeight: "1.6", fontSize: 16 }}  
                dangerouslySetInnerHTML={{ __html: description?.data?.mo_ta_chung }}
              >
              </p> 
            </div>

            <Divider />

            {/* Course Introduction */}
            <div >
              <Title level={4} style={{ marginBottom: "16px" }}>
                Giới thiệu khóa học
              </Title>
              <p style={{ color: "#242424", fontWeight: 400, lineHeight: "1.6", fontSize: 16 }}  
                dangerouslySetInnerHTML={{ __html: description?.data?.gioi_thieu }}
              >
              </p> 
            </div>

            <Divider />

            {/* Hình thức đào tạo */}
            <div >
              <Title level={4} style={{ marginBottom: "16px" }}>
                Hình thức đào tạo
              </Title>
              <p style={{ color: "#242424", fontWeight: 400, lineHeight: "1.6", fontSize: 16 }}  
                dangerouslySetInnerHTML={{ __html: description?.data?.hinh_thuc_dao_tao }}
              >
              </p> 
            </div>

            <Divider />
            {/* Mục tiêu cam kết */}
            <div >
              <Title level={4} style={{ marginBottom: "16px" }}>
                Mục tiêu cam kết
              </Title>
              <p style={{ color: "#242424", fontWeight: 400, lineHeight: "1.6", fontSize: 16 }}  
                dangerouslySetInnerHTML={{ __html: description?.data?.muc_tieu_cam_ket }}
              >
              </p>
            </div>

            {/* Đối tượng đào tạo */}
            <Divider />
            <div >
              <Title level={4} style={{ marginBottom: "16px" }}>
                Đối tượng đào tạo
              </Title>
              <p style={{ color: "#242424", fontWeight: 400, lineHeight: "1.6", fontSize: 16 }}
                dangerouslySetInnerHTML={{ __html: description?.data?.doi_tuong_dao_tao }}
              >
              </p>
            </div>

            {/* Nội dung chi tiết khóa học */}
            <Divider />
            <div >
              <Title level={4} style={{ marginBottom: "16px" }}>
                Nội dung chi tiết khóa học
              </Title>
              <p style={{ color: "#242424", fontWeight: 400, lineHeight: "1.6", fontSize: 16 }}
                dangerouslySetInnerHTML={{ __html: description?.data?.noi_dung_chi_tiet }}
              >
              </p>
            </div>

            {/* Xếp lớp và thời gian đào tạo */}
            <Divider />
            <div >
              <Title level={4} style={{ marginBottom: "16px" }}>
                Xếp lớp và thời gian đào tạo
              </Title>
              <p style={{ color: "#242424", fontWeight: 400, lineHeight: "1.6", fontSize: 16 }}
                dangerouslySetInnerHTML={{ __html: description?.data?.xep_lop_va_thoi_gian_dao_tao }}
              >
              </p>
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
                        <Menu.Item key="hide" icon={<EyeOutlined />} onClick={() => handleHideModule(chapter)}>
                          {chapter.trang_thai ? "Hiện chương" : "Ẩn chương"}
                        </Menu.Item>
                        <Menu.Item key="edit" icon={<EditOutlined />}>
                          Sửa chương
                        </Menu.Item>
                        <Menu.Item key="delete" icon={<DeleteOutlined />} danger
                          onClick={() => {
                            handleDeleteModun(chapter.id);
                          }}
                        >
                          Xóa chương
                        </Menu.Item>
                      </Menu>
                    )
                    return (
                      <List.Item style={{ padding: "12px 0", border: "none" }}>
                        <div style={{ display: "flex", width: "100%", alignItems: "flex-start", cursor: "pointer" }}
                        >
                          <Avatar
                            shape="square"
                            size={60}
                            src={chapter.thumbnail}
                            style={{ backgroundColor: chapter.bgColor, marginRight: "12px", flexShrink: 0 }}
                            onClick={() => handleChapterClick(chapter)}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Text strong style={{ fontSize: "16px", lineHeight: "1.4", marginBottom: "8px" }}
                                onClick={() => handleChapterClick(chapter)}
                              >
                                {chapter.title}
                              </Text>
                              <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                                <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()}/>
                              </Dropdown>
                            </div>
                            <Space size="large" style={{ color: "#8c8c8c", fontSize: "14px" }} onClick={() => handleChapterClick(chapter)}>
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
                  createModule(values)
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
                label="Tên chương học"
                name="ten_mo_dun"
                rules={[{ required: true, message: "Vui lòng nhập tên chương học" }]}
              >
                <Input placeholder="Nhập tên chương học" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                className="input-col"
                label="Lĩnh vực"
                name="linh_vuc"
                rules={[
                    {
                      required: true,
                      message: 'Tên lĩnh vực là trường bắt buộc.',
                    },
                ]}
              >
                <Input placeholder="Nhập tên lĩnh vực"/>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Khung chương trình"
                name="khung_ct_id"
                rules={[{ required: true, message: "Vui lòng chọn khung chương trình" }]}
              >
                {renderProgramme()}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item className="input-col" label="Khóa học" name="khoa_hoc_id" 
                  rules={[{
                    required: true,
                    message: 'Khóa học là bắt buộc',
                  },]}
                >
                    {renderCourses()}
                </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Chuyên ngành"
                className="input-col"
                name="chuyen_nganh"
                rules={[]} 
              >
                {renderMajor()}
              </Form.Item>     
            </Col>

            <Col span={12}>
              <Form.Item
                  name="loai_tong_hop"
                label="Loại mô đun"
                initialValue={1}
                rules={[
                  {
                    required: true,
                    message: 'Loại mô đun là trường bắt buộc.',
                  },
                ]}
              >
                  <Radio.Group>
                    <Radio className="option-payment" value={1}>
                      Phần thi tổng hợp
                    </Radio>
                    {/* <Radio className="option-payment" value={2}>
                      Phần thi mô đun
                    </Radio> */}
                    <Radio className="option-payment" value={0}>
                      Phần bài học
                    </Radio>
                  </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả chương học" name="mo_ta">
            <Input.TextArea
              rows={4}
              placeholder="Mô tả về chương học"
              maxLength={1000}
              showCount
              style={{ resize: "none" }}
            />
          </Form.Item>

          <Form.Item className="input-col" label="Ảnh đại diện" name="anh_dai_dien" rules={[]}>
            <Dragger {...propsImage} maxCount={1}
              listType="picture"
              className="upload-list-inline"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text bold">Click hoặc kéo thả ảnh vào đây</p>
            </Dragger>
          </Form.Item>

          <Form.Item className="input-col" label="Video đại diện" name="video_gioi_thieu" rules={[]}>
            <Dragger {...propsVideo} maxCount={1}
              listType="picture"
              className="upload-list-inline"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text bold">Click hoặc kéo thả video đại diện vào đây</p>
            </Dragger>
          </Form.Item> 
        </Form>
      </Modal>
      
      {/* Delete Exam Confirmation Modal */}
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
