
import { useState, useEffect } from "react"
import { useHistory, useParams } from "react-router-dom"
import { Row, Col, Card, Typography, Button, Space, Tabs, List, Avatar, 
  Tag, Image, Divider, Dropdown, Menu, Modal, Form, message, Select, Input,
  Upload, Alert, notification, Radio, Spin, } from "antd"
import {
  EyeInvisibleOutlined, EditOutlined, PlayCircleOutlined,
  ClockCircleOutlined, DeleteOutlined, PlusOutlined,
  EyeOutlined, MoreOutlined, FileTextOutlined,
  UploadOutlined, ExclamationCircleOutlined, CopyOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons"
import config from '../../../../configs/index';
import moment from "moment"
import axios from "axios";
import * as CurrencyFormat from 'react-currency-format';
import './detail-course.css'
import ViewExam from "./view-exam";

// redux
import * as courseAction from '../../../../redux/actions/course';
import * as partActions from '../../../../redux/actions/part';
import * as descriptionAction from '../../../../redux/actions/descriptionCourse';
import * as programmeAction from '../../../../redux/actions/programme';
import * as majorActions from '../../../../redux/actions/major';
import * as examActions from '../../../../redux/actions/exam';
import { useSelector, useDispatch } from "react-redux";

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { Option } = Select
const { Dragger } = Upload

const CourseDetail = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const idCourse = useParams().idCourse;
  const [activeTab, setActiveTab] = useState("chapters");
  const [isAddChapterModalVisible, setIsAddChapterModalVisible] = useState(false)
  const [isAddExamModalVisible, setIsAddExamModalVisible] = useState(false)
  const [addChapterForm] = Form.useForm()
  const [addExamForm] = Form.useForm()
  const [examToDelete, setExamToDelete] = useState(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [spinning, setSpinning] = useState(false);
  const [isExamViewModalVisible, setIsExamViewModalVisible] = useState(false);
  
  const course = useSelector(state => state.course.item.result);
  const courses = useSelector(state => state.course.list.result);
  const programmes = useSelector(state => state.programme.list.result);
  const description = useSelector(state => state.descriptionCourse.item.result);
  const majors = useSelector(state => state.major.list.result);
  const modules = useSelector(state => state.part.list.result);
  const exams = useSelector(state => state.exam.list.result);
  const exam = useSelector(state => state.exam.item.result);

  const [state, setState] = useState({
    isEdit: false,
    idModule: '',
    idExam: '',
    fileImg: '',
    fileExam: '',
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

  const propsFile = {
    name: 'file',
    action: '#',

    beforeUpload: file => {
      // check loại file => chỉ cho upload file word
      const isDocx = file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      if (!isDocx) {
        message.error(`${file.name} có định dạng không phải là file docx`);
      }
      return isDocx || Upload.LIST_IGNORE;
    },

    onChange(info) {
      setState({ ...state, fileExam: info.file.originFileObj });
    },

    async customRequest(options) {
      const { onSuccess } = options;

      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },

    onRemove(e) {
      setState({ ...state, fileExam: '' });
    },
  };

  useEffect(() => {
    dispatch(courseAction.getCourse({ id: idCourse }, (res) => {
      if (res.status === 'success') {
        dispatch(courseAction.getCourses({ idkct: res?.data?.kct_id, status: '', search: '', pageSize: 99999999, pageIndex: 1 }))
      }
    }));
    dispatch(descriptionAction.getDescriptionCourse({ id: idCourse }));
    dispatch(programmeAction.getProgrammes({ status: '' }));
    dispatch(majorActions.getMajors());
    dispatch(partActions.getModulesTeacher({ idCourse: idCourse, lkh: '', status: '', search: '', pageSize: 99999999, pageIndex: 1 }));
    dispatch(examActions.getSyntheticExam({ idCourse: idCourse, pageSize: 999999, pageIndex: 1 }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Event xoá đề thi tổng hợp
  const handleDeleteExam = () => {
    const callback = (res) => {
      if (res.statusText === 'OK' && res.status === 200) {
        dispatch(examActions.getSyntheticExam({ idCourse: idCourse, pageSize: 999999, pageIndex: 1 }));
        notification.success({
            message: 'Thành công',
            description: 'Xóa đề thi thành công',
        })
        setDeleteModalVisible(false)
        setExamToDelete(null);
        setSpinning(false);
        setIsExamViewModalVisible(false);
      } else {
        notification.error({
            message: 'Thông báo',
            description: 'Xóa đề thi thất bại',
        })
        setSpinning(false);
      };
    }
    setSpinning(true);
    dispatch(examActions.deleteExam({ idExam: examToDelete.de_thi_id }, callback))
  }
  
  const renderProgrammes = () => {
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

  const handleViewExam = (exam) => {
    setSpinning(true);
    dispatch(examActions.getExam({ id: exam.de_thi_id }, (res) => {
      if (res.status === 'success') {
        setSpinning(false);
        setIsExamViewModalVisible(true)
      }
    }));
  }

  // event ẩn chương học
  const handleHideModule = (chapter) => {
    const formData = new FormData();
    formData.append('trang_thai', !chapter.trang_thai);

    const callback = (res) => {
        if (res.statusText === 'OK' && res.status === 200) {
            notification.success({
                message: 'Thành công',
                description: chapter.trang_thai ? 'Ẩn chương học thành công' : 'Hiện chương học thành công',
            });
            // request api lấy danh sách chương học mới
            dispatch(partActions.getModulesTeacher({ idCourse: idCourse, lkh: '', status: '', search: '', pageSize: 99999999, pageIndex: 1 }));
        } else {
            notification.error({
                message: 'Thông báo',
                description: chapter.trang_thai ? 'Ẩn chương học thất bại' : 'Hiện chương học thất bại',
            })
        }
    };
    dispatch(partActions.EditModule({ formData: formData, idModule: chapter.mo_dun_id }, callback));
  }

  // event xuất bản thi tổng hợp
  const handlePublishExam = (exam) => {

    const handlePusblish = () => {
      const callback = (res) => {
        if (res.status === 'success') {
          if (!exam.xuat_ban) dispatch(examActions.getUsing({ id: exam.de_thi_id }, (response) => {
            if (response.status === 'success') {
              dispatch(examActions.getSyntheticExam({ idCourse: idCourse, pageSize: 999999, pageIndex: 1 }));
            }
          }))
          else dispatch(examActions.getSyntheticExam({ idCourse: idCourse, pageSize: 999999, pageIndex: 1 }));
          notification.success({
              message: 'Thành công',
              description: !exam.xuat_ban ? 'Xuất bản đề thi thành công' : !exam.trang_thai ? 'Sử dụng đề thi thành công' : 'Ngưng sử dụng đề thi thành công',
          })
        } else {
          notification.error({
              message: 'Thông báo',
              description: !exam.xuat_ban ? 'Xuất bản đề thi thành công' : !exam.trang_thai ? 'Sử dụng đề thi thành công' : 'Ngưng sử dụng đề thi thành công',
          })
        };
      }
      if (!exam.xuat_ban)
        dispatch(examActions.publishExam({ id: exam.de_thi_id }, callback))
      else // cập nhật trạng thái
        dispatch(examActions.getUsing({ id: exam.de_thi_id }, callback))
    }

   return ( 
      Modal.confirm({
        width: 500,
        title: 'Xuất bản đề thi',
        content: !exam.xuat_ban ? 'Bạn có chắc chắn muốn xuất bản đề thi này không?' : !exam.trang_thai ? 'Bạn có chắc chắn muốn sử dụng đề thi này không?' : 'Bạn có chắc chắn muốn ngừng sử dụng đề thi này không?',
        okText: 'Có',
        cancelText: 'Không',
        onOk: () => {
          handlePusblish();
        },
      })
    )
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
    history.push(`/teacher/detail-chapter/${chapter.mo_dun_id}`)
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
    formData.append('chuyen_nganh_id', values.chuyen_nganh_id);
    formData.append('loai_tong_hop', values.loai_tong_hop); // 0 là phần bài học
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
        dispatch(partActions.getModulesTeacher({ idCourse: idCourse, lkh: '', status: '', search: '', pageSize: 99999999, pageIndex: 1 }));
        notification.success({
          message: 'Thành công',
          description: state.isEdit ? 'Cập nhật chương học thành công' : 'Thêm chương học mới thành công',
        })
      } else {
        notification.error({
          message: 'Thông báo',
          description: state.isEdit ? 'Cập nhật chương học thất bại' : 'Thêm chương học mới thất bại. Chú ý 1 chương học chỉ có 1 phần tổng hợp',
        })
      }
    };
    if (state.isEdit) {
      dispatch(partActions.EditModule({ formData: formData, idModule: state.idModule }, callback));
    } else {
      dispatch(partActions.CreateModule(formData, callback));
    }
  };

  /// event xoá chương học
  const handleDeleteModun = (id) => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chán muốn xóa chương học này?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk() {
        const callback = (res) => {
          if (res.statusText === 'OK' && res.status === 200) {
            // request api lấy danh sách chương học mới
            dispatch(partActions.getModulesTeacher({ idCourse: idCourse, lkh: '', status: '', search: '', pageSize: 99999999, pageIndex: 1 }));
            notification.success({
              message: 'Thành công',
              description: 'Xóa chương học thành công',
            })
          } else {
            notification.error({
              message: 'Thông báo',
              description: 'Xóa chương học thất bại',
            })
          };
        }
        dispatch(partActions.DeleteModule({ idModule: id }, callback))
      },
    });
  };
  
  // event submit form exam
  const handleFormExam = () => {
    addExamForm
      .validateFields()
      .then((values) => {
        
        const callback = async (res) => {
          if (res.statusText === 'OK' && res.status === 200) {
            if (!state.isEdit) {
              const formData = new FormData();
              formData.append('file', state.fileExam); 
              setSpinning(true);
              await axios.post(
                config.API_LATEX + `/${res?.data?.data?.de_thi_id}/uploadfile`,
                formData, 
                {
                  timeout: 1800000,
                  headers: { "content-type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem('userToken')}`, },
                }
              ).then(
                res => {
                  if (res.statusText === 'OK' && res.status === 200) {
                    addExamForm.resetFields();
                    dispatch(examActions.getSyntheticExam({ idCourse: idCourse, pageSize: 999999, pageIndex: 1 }));
                    notification.success({
                        message: 'Thành công',
                        description: 'Thêm đề thi mới thành công',
                    });
                    setIsAddExamModalVisible(false);
                    setSpinning(false);
                  } else {
                      notification.error({
                          message: 'Thông báo',
                          description: 'Thêm đề thi mới thất bại. Xin vui lòng kiểm tra lại tiêu chí đề',
                      })
                  }
                }
              )
              .catch(error => {
                notification.error({ message: error.message })
                setSpinning(false);
              });
            } else {
              notification.success({
                  message: 'Thông báo',
                  description: state.isEdit ? 'Cập nhật đề thi thành công' : 'Thêm đề thi mới thành công',
              })
              setIsAddExamModalVisible(false);
              addExamForm.resetFields();
              dispatch(examActions.getSyntheticExam({ idCourse: idCourse, pageSize: 999999, pageIndex: 1 }));
            }
        } else {
            notification.error({
                message: 'Thông báo',
                description: state.isEdit ? 'Cập nhật đề thi thất bại' : 'Thêm đề thi mới thất bại',
            })
            setIsAddExamModalVisible(false);
            addExamForm.resetFields();
          }
        };
        const formData = new FormData();
        formData.append('ten_de_thi', values.ten_de_thi);
        formData.append('loai_de_thi_id', 3); // 2 là đề thi tổng hợp
        formData.append('kct_id', values.kct_id);
          formData.append('khoa_hoc_id', values.khoa_hoc_id);
        if (values.de_thi_ma !== undefined) {
          formData.append('de_thi_ma', values.de_thi_ma !== undefined ? values.de_thi_ma : '');
        }

        if (state.fileImg !== '')
          formData.append('anh_dai_dien', state.fileImg !== undefined ? state.fileImg : '');
        
        if (!state.isEdit)
          dispatch(examActions.createExam(formData, callback));
        else dispatch(examActions.editExam({ formData: formData, idExam: state.idExam }, callback));
        
      })
      .catch((error) => {
        console.log("Validation failed:", error)
      })
  }
  
  // event nhân bản đề thi
  const reuseExam = (id) => {
    const callback = (res) => {
      if (res.status === 200 && res.statusText === 'OK') {
        dispatch(examActions.getSyntheticExam({ idCourse: idCourse, pageSize: 999999, pageIndex: 1 }));
        notification.success({
          message: 'Thành công',
          description: 'Sử dụng đề thi thành công',
        })
      }
    };

    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn chắc chắn muốn sử dụng lại đề này ?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk() {
        dispatch(examActions.reuseExam({ idExam: id }, callback))
      },
    });
  }
    
  const PopulatedExamsState = () => (
    <>
      <List
        dataSource={exams?.data}
        renderItem={(exam, index) => {

          const menu = (
            <Menu>
              <Menu.Item key="hide" icon={(!exam.trang_thai || !exam.xuat_ban) ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                onClick={() => handlePublishExam(exam)} // done
              >
                {!exam.xuat_ban ? "Xuất bản đề thi" : !exam.trang_thai ? "Sử dụng đề thi" : "Ngừng sử dụng đề thi"}
              </Menu.Item>
              <Menu.Item key="hide" icon={<CopyOutlined />}
                onClick={() => {
                  if (exam.xuat_ban) reuseExam(exam.de_thi_id)
                  else 
                    notification.warning({
                      message: 'Cảnh báo',
                      description: 'Đề thi chưa được xuất bản, không thể nhân bản đề thi này',
                    })
                }}
              >
                Nhân bản đề thi
              </Menu.Item>
              <Menu.Item key="edit" icon={<EditOutlined />}
                onClick={() => {
                  if (!exam.xuat_ban) {
                    dispatch(examActions.getExam({ id: exam.de_thi_id }, (res) => {
                      if (res.status === 'success') {
                        setState({ ...state, isEdit: true, idExam: exam.de_thi_id });
                        setIsAddExamModalVisible(true);
                        addExamForm.setFieldsValue(res.data)
                      }
                    }));
                  } else 
                    notification.warning({
                      message: 'Cảnh báo',
                      description: 'Đề thi đã được xuất bản, không thể chỉnh sửa đề thi này',
                    })
                }}
              >
                Cập nhật đề thi
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
              <div style={{ display: "flex", width: "100%", alignItems: "center", opacity: (!exam.trang_thai || !exam.xuat_ban) ? 0.5 : 1,
                  transition: "opacity 0.3s ease", cursor: "pointer"}}
                >
                <Avatar onClick={() => handleViewExam(exam)}
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
                    <Text strong style={{ fontSize: "16px", lineHeight: "1.4", marginBottom: "8px", display: "block" }}
                      onClick={() => handleViewExam(exam)}
                    >
                      {exam?.ten_de_thi}
                    </Text>
                    <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                      <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()}/>
                    </Dropdown>
                  </div>
                  <Space size="large" style={{ color: "#8c8c8c", fontSize: "14px" }} onClick={() => handleViewExam(exam)}>
                    <Space size={4}>
                      <PlayCircleOutlined />
                      <span>{exam?.so_cau_hoi} câu hỏi</span>
                    </Space>
                    <Space size={4}>
                      <ClockCircleOutlined />
                      <span>{exam?.thoi_gian} phút</span>
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
        block
        icon={<PlusOutlined />}
        style={{
          marginBottom: "16px",
          backgroundColor: "#292B8E",
          borderColor: "#292B8E",
          height: "48px",
          fontSize: "16px",
          fontWeight: "500",
        }}
        onClick={() => setIsAddExamModalVisible(true)}
      >
        Thêm đề thi
      </Button>
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
          history.push(`/teacher/criteria`);
        }}
      >
        Tạo tiêu chí
      </Button>
    </div>
  )

  // event button 'Cập nhật chương
  const handleUpdateChapter = (chapter) => {
    dispatch(partActions.getModule({ id: chapter.mo_dun_id }, (res) => {
      if (res.status === 'success') {
        setState({ ...state, isEdit: true, idModule: chapter.mo_dun_id });
        setIsAddChapterModalVisible(true);
        addChapterForm.setFieldsValue(res.data);
      }
    }))
  }

  return (
    <Spin spinning={spinning} tip="Đang tải dữ liệu...">
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
                <Button icon={<EditOutlined />} onClick={() => history.push(`/teacher/form-course/${course?.data?.khoa_hoc_id}`)}>Chỉnh sửa</Button>
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
                  dangerouslySetInnerHTML={{ __html: description?.data?.doi_tuong }}
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
                  dangerouslySetInnerHTML={{ __html: description?.data?.xep_lop_thoi_gian }}
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
                        {modules?.totalCount}
                      </Tag>
                    </span>
                  }
                  key="chapters"
                >
                  <List
                    dataSource={modules?.data}
                    renderItem={(chapter, index) => {
                      const menu = (
                        <Menu>
                          <Menu.Item key="hide" icon={<EyeOutlined />} 
                            onClick={() => handleHideModule(chapter)} // done
                          >
                            {chapter.trang_thai ? "Ẩn chương" : "Hiện chương"}
                          </Menu.Item>
                          <Menu.Item key="edit" icon={<EditOutlined />}
                            onClick={() => {
                              handleUpdateChapter(chapter) // done
                            }}
                          >
                            Cập nhật chương
                          </Menu.Item>
                          <Menu.Item key="delete" icon={<DeleteOutlined />} danger // done
                            onClick={() => {
                              handleDeleteModun(chapter.mo_dun_id);
                            }}
                          >
                            Xóa chương
                          </Menu.Item>
                        </Menu>
                      )
                      return (
                        <List.Item style={{ padding: "12px 0", border: "none" }}>
                          <div style={{ display: "flex", width: "100%", alignItems: "flex-start", 
                            cursor: chapter.trang_thai ? "pointer" : 'default', opacity: !chapter.trang_thai ? 0.5 : 1 }}
                          >
                            <Avatar 
                              shape="square"
                              size={60}
                              src={chapter.anh_dai_dien ? config.API_URL + chapter.anh_dai_dien : require('assets/img/default.jpg').default}
                              style={{ backgroundColor: chapter.bgColor, marginRight: "12px", flexShrink: 0 }}
                              onClick={() => {if (chapter.trang_thai) handleChapterClick(chapter)}}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Text strong style={{ fontSize: "16px", lineHeight: "1.4", marginBottom: "8px"}}
                                  onClick={() => {if (chapter.trang_thai) handleChapterClick(chapter)}}
                                >
                                  {chapter?.ten_mo_dun}
                                </Text>
                                <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                                  <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()}/>
                                </Dropdown>
                              </div>
                              {!chapter.loai_tong_hop ? 
                                <Space size="large" style={{ color: "#8c8c8c", fontSize: "14px" }} onClick={() => {if (chapter.trang_thai) handleChapterClick(chapter)}}>
                                  <Space size={4}>
                                    <PlayCircleOutlined />
                                    <span>{chapter?.so_luong_chuyen_de} chuyên đề</span>
                                  </Space>
                                  <Space size={4}>
                                    <ClockCircleOutlined />
                                    <span>{chapter?.so_luong_de_thi} đề thi</span>
                                  </Space>
                                </Space> :
                                <Space size="large" style={{ color: "#8c8c8c", fontSize: "14px" }}>
                                  <Space size={4}>
                                    <FileTextOutlined />
                                    <span>Phần tổng hợp</span>
                                  </Space>
                                </Space>
                              }
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
                        {exams?.totalCount}
                      </Tag>
                    </span>
                  }
                  key="exams"
                >
                  {exams?.totalCount === 0 ? <EmptyExamsState /> : <PopulatedExamsState />}
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>

        {/* Add Chapter Modal */}
        <Modal
          title={state.isEdit ? 'Cập nhật chương học' : "Thêm chương học mới"}
          open={isAddChapterModalVisible}
          onCancel={() => {
            setIsAddChapterModalVisible(false)
              addChapterForm.resetFields()
              setState({ ...state, fileImg: '', fileVid: '', isEdit: false, idModule: ''})
          }}
          footer={[
            <Button key="cancel" onClick={() => {
              setIsAddChapterModalVisible(false)
              addChapterForm.resetFields()
              setState({ ...state, fileImg: '', fileVid: '', isEdit: false, idModule: ''})
            }}>
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
                  initialValue={course?.data?.kct_id}
                  rules={[{ required: true, message: "Vui lòng chọn khung chương trình" }]}
                >
                  {renderProgrammes()}
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item className="input-col" label="Khóa học" name="khoa_hoc_id" 
                  initialValue={course?.data?.khoa_hoc_id}
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
                  name="chuyen_nganh_id"
                  rules={[]} 
                >
                  {renderMajor()}
                </Form.Item>     
              </Col>

              <Col span={12}>
                <Form.Item
                    name="loai_tong_hop"
                  label="Loại chương học"
                  initialValue={1}
                  rules={[
                    {
                      required: true,
                      message: 'Loại chương học là trường bắt buộc.',
                    },
                  ]}
                >
                    <Radio.Group>
                      <Radio className="option-payment" value={1}>
                        Phần thi tổng hợp
                      </Radio>
                      {/* <Radio className="option-payment" value={2}>
                        Phần thi chương học
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
          <Spin spinning={spinning} tip="Đang xoá đề thi...">
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
                  "{examToDelete?.ten_de_thi}"
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
          </Spin>
        </Modal>
        
        <Modal
          title={state.isEdit ? 'Cập nhật đề thi tổng hợp' : "Tạo đề thi tổng hợp"}
          open={isAddExamModalVisible}
          onCancel={() => {
            setIsAddExamModalVisible(false)
            setState({ ...state, isEdit: false, idExam: '' })
            addExamForm.resetFields()
          }}
          footer={null}
          width={500}
          destroyOnClose
          className="add-exam-modal"
        >
          <Spin spinning={spinning} tip="Đang tải dữ liệu...">

            <Form form={addExamForm} layout="vertical" >
              <Form.Item label='Mã đề thi' name="de_thi_ma" rules={[{ required: true, message: 'Mã đề thi là bắt buộc'}]}>
                <Input size="normal" placeholder="Mã đề thi" />
              </Form.Item>
              <Form.Item label='Tên đề thi' name="ten_de_thi" rules={[{ required: true, message: 'Tên đề thi là bắt buộc'}]}>
                <Input size="normal" placeholder="Tên đề thi" />
              </Form.Item>
              <Form.Item label="Khung chương trình" name="kct_id" 
                rules={[{ required: true, message: 'Loại đề thi là bắt buộc'}]}
                initialValue={course?.data?.kct_id}
              >
                  {renderProgrammes()}
              </Form.Item>
              <Form.Item
                label="Khóa học"
                name="khoa_hoc_id"
                rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
                initialValue={course?.data?.khoa_hoc_id}
              >
                {renderCourses()}
              </Form.Item>

              <Form.Item className="input-col" label="Hình đại diện" name="anh_dai_dien" rules={[]}>
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

              <Form.Item
                label="File đề thi"
                name="file_de_thi"
                rules={[{ required: state.isEdit, message: "Vui lòng tải lên file đề thi" }]}
              >
                <Dragger {...propsFile} maxCount={1}
                    listType="picture"
                    className="upload-list-inline"
                >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined />
                    </p>
                    <p className="ant-upload-text bold">Click hoặc kéo file đề thi vào đây</p>
                    <p className="ant-upload-hint">
                      Định dạng file Docx
                    </p>
                </Dragger>
              </Form.Item>

              <Row gutter={16} style={{ marginTop: "24px" }}>
                <Col span={12}>
                  <Button block size="large" 
                    onClick={() => {
                      setIsAddExamModalVisible(false)
                      setState({ ...state, isEdit: false, idExam: '' })
                      addExamForm.resetFields()
                    }} 
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
                    onClick={handleFormExam}
                    style={{ height: "48px", backgroundColor: "#292B8E", borderColor: "#292B8E", borderRadius: 8 }}
                  >
                    Xác nhận
                  </Button>
                </Col>
              </Row>
            </Form>
          </Spin>
        </Modal>
        
        {/* Modal Exam view */}
        {/* View exam modal */}
        <ViewExam exam={exam?.data} isExamViewModalVisible={isExamViewModalVisible} setIsExamViewModalVisible={setIsExamViewModalVisible}
          handlePublishExam={handlePublishExam} 
        />
      </div>
    </Spin>
  )
}

export default CourseDetail
