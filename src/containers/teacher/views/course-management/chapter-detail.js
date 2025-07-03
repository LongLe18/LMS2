import { useState, useEffect } from "react"
import { useHistory, useParams } from "react-router-dom"
import { Row, Col, Card, Typography, Button, Space, Tabs, List, Avatar, Image,
  Dropdown, Menu, Modal, Form, Upload, message, Select, Input, Alert, notification,
  Radio, Spin } from "antd"
import {
  EyeInvisibleOutlined, EditOutlined, DeleteOutlined, PlusOutlined,
  MoreOutlined, FileTextOutlined, PlayCircleOutlined,
  UploadOutlined, ExclamationCircleFilled, ExclamationCircleOutlined,
  EyeOutlined, CopyOutlined,
} from "@ant-design/icons"
import './chapter-detail.css';
import config from '../../../../configs/index';
import axios from 'axios';
import ViewExam from "./view-exam";
import ModalCriteria from './modal-criteria';

import * as courseAction from '../../../../redux/actions/course';
import * as programmeAction from '../../../../redux/actions/programme';
import * as partActions from '../../../../redux/actions/part';
import * as majorActions from '../../../../redux/actions/major';
import * as thematicActions from '../../../../redux/actions/thematic';
import * as examActions from '../../../../redux/actions/exam';
import * as criteriaActions from '../../../../redux/actions/criteria';
import { useSelector, useDispatch } from "react-redux";

// ==================================================================== 
// Giao diện Chương học (chi  tiết khoá học) 
// ==================================================================== 

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { Option } = Select
const { Dragger } = Upload


const ChapterDetail = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const idChapter = useParams().idChapter; // id of the Chapter from URL params
  const [activeTab, setActiveTab] = useState("topics")
  const [isAddTopicModalVisible, setIsAddTopicModalVisible] = useState(false)
  const [isAddChapterModalVisible, setIsAddChapterModalVisible] = useState(false);
  const [isModunExamModalVisible, setIsModunExamModalVisible] = useState(false)
  const [TopicForm] = Form.useForm();
  const [chapterForm] = Form.useForm();
  const [addModunExamForm] = Form.useForm();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [examToDelete, setExamToDelete] = useState(null);
  const [modunToDelete, setModunToDelete] = useState(null);
  const [thematicToDelete, setThematicToDelete] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [isExamViewModalVisible, setIsExamViewModalVisible] = useState(false);
  const [isModalCriteriaVisible, setIsModalCriteriaVisible] = useState(false);

  const module = useSelector(state => state.part.item.result);
  const modules = useSelector(state => state.part.list.result);
  const programmes = useSelector(state => state.programme.list.result);
  const courses = useSelector(state => state.course.list.result);
  const majors = useSelector(state => state.major.list.result);
  const thematics = useSelector(state => state.thematic.list.result);
  const exams = useSelector(state => state.exam.list.result);
  const exam = useSelector(state => state.exam.item.result);
  const checkCriteria = useSelector(state => state.criteria.check.result);

  const [state, setState] = useState({
    isEdit: false,
    idModule: '',
    idExam: '',
    idThematic: '',
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
    dispatch(partActions.getModule({ id: idChapter }, (res) => {
      if (res.status === 'success'){
        dispatch(partActions.getModulesTeacher({ idCourse: res?.data?.khoa_hoc_id, lkh: '', status: '', search: '', pageSize: 99999999, pageIndex: 1 }));
        dispatch(courseAction.getCourses({ idkct: res?.data?.kct_id, status: '', search: '', pageSize: 99999999, pageIndex: 1 }))
        dispatch(examActions.getSyntheticExamModule({ idCourse: res?.data?.khoa_hoc_id, idModule: idChapter, pageSize: 999999, pageIndex: 1 }));
      }
    }));
    dispatch(programmeAction.getProgrammes({ status: '' }));
    dispatch(majorActions.getMajors());
    dispatch(majorActions.getClass());
    dispatch(thematicActions.getThematicsByTeacher({ idCourse: '', idModule: idChapter, status: '', search: '', start: '', end: '', pageIndex: 1, pageSize: 99999999 }));
    dispatch(criteriaActions.checkCriteria({ type: 'modun', id: idChapter }));
  }, [])

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
        onChange={(khoa_hoc_id) => {
          dispatch(partActions.getModulesByIdCourse({ idCourse: khoa_hoc_id }));
        }}
      >
        {options}
      </Select>
    );
  }

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
        onChange={(mo_dun_id) => setState({mo_dun_id, ...state, isChanged: true })}
        placeholder="Chọn phần học"
      >
        {options}
      </Select>
    );
  };

  // const renderClasses = () => {
  //   let options = [];
  //   if (classes.status === 'success') {
  //     options = classes.data
  //     .map((course) => (
  //       <Option key={course.lop_id} value={course.lop_id} >{course.ten_lop}</Option>
  //     ))
  //   }
  //   return (
  //     <Select
  //       showSearch={false}
  //       placeholder="Chọn lớp học"
  //     >
  //       {options}
  //     </Select>
  //   );
  // };

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

  // Xử lý form chuyên đề
  const handleFormTopic = () => {
    TopicForm
      .validateFields()
      .then((values) => {
        let data = {
          "ten_chuyen_de": values.ten_chuyen_de,
          "mo_ta": values.mo_ta,
          "mo_dun_id": values.mo_dun_id,
        }
        if (values.lop_id !== undefined)  data.lop_id = values.lop_id;
        if (state.isEdit) data.trang_thai = values.trang_thai; // thêm trường trạng thái khi cập nhật

        const callback = (res) => {
          if (res.statusText === 'OK' && res.status === 200) {
            setState({ ...state, isEdit: false, idThematic: '', fileImg: '', fileVid: '' });
            TopicForm.resetFields();
            dispatch(thematicActions.getThematicsByTeacher({ idCourse: '', idModule: idChapter, status: '', search: '', start: '', end: '', pageIndex: 1, pageSize: 99999999 }));
            notification.success({
              message: 'Thành công',
              description: state.isEdit ? 'Sửa thông tin chuyên đề thành công' : 'Thêm chuyên đề mới thành công',
            });
            setIsAddTopicModalVisible(false);
          } else {
            notification.error({
              message: 'Thông báo',
              description: state.isEdit ? 'Sửa thông tin chuyên đề thất bại' : 'Thêm chuyên đề mới thất bại',
            })
            setIsAddTopicModalVisible(false);
          }
        };
        
        if (!state.isEdit) {
          dispatch(thematicActions.CreateThematic(data, callback));
        } else {
          dispatch(thematicActions.EditThematic({ formData: data, idThematic: state.idThematic }, callback));
        }
      })
      .catch((error) => {
        console.log("Validation failed:", error)
      })
  }

  // event xuất bản thi tổng hợp
  const handlePublishExam = (exam) => {

    const handlePusblish = () => {
      const callback = (res) => {
        if (res.status === 'success') {
          if (!exam.xuat_ban) dispatch(examActions.getUsing({ id: exam.de_thi_id }, (response) => {
            if (response.status === 'success') {
              dispatch(examActions.getSyntheticExamModule({ idCourse: module?.data?.khoa_hoc_id, idModule: idChapter, pageSize: 999999, pageIndex: 1 }));
            }
          }))
          else dispatch(examActions.getSyntheticExamModule({ idCourse: module?.data?.khoa_hoc_id, idModule: idChapter, pageSize: 999999, pageIndex: 1 }));
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

  const handleViewExam = (exam) => {
    setSpinning(true);
    dispatch(examActions.getExam({ id: exam.de_thi_id }, (res) => {
      if (res.status === 'success') {
        setSpinning(false);
        setIsExamViewModalVisible(true)
      }
    }));
  }

  // event xoá Chương học / đề thi modun
  const handleDelete = () => {
    setSpinning(true);
    if (examToDelete) { // Delete exam
      // call api
      const callback = (res) => {
        if (res.statusText === 'OK' && res.status === 200) {
          dispatch(examActions.getSyntheticExamModule({ idCourse: module?.data?.khoa_hoc_id, idModule: idChapter, pageSize: 999999, pageIndex: 1 }));
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

      return
    }

    if (modunToDelete) { // Delete Chương học
      const callback = (res) => {
        if (res.statusText === 'OK' && res.status === 200) {
          notification.success({
            message: 'Thành công',
            description: 'Xóa Chương học thành công',
          })
          setDeleteModalVisible(false)
          setModunToDelete(null)
          setSpinning(false);
          history.goBack()
          return;
        } else {
          notification.error({
            message: 'Thông báo',
            description: 'Xóa Chương học thất bại',
          })
          setSpinning(false);
          setDeleteModalVisible(false)
          setModunToDelete(null)
          return;
        };
      }
      dispatch(partActions.DeleteModule({ idModule: idChapter }, callback))
    }

    if (thematicToDelete) { // Delete chuyên đề
      dispatch(thematicActions.DeleteThematic({ idThematic: thematicToDelete.chuyen_de_id }, (res) => {
        if (res.statusText === 'OK' && res?.data?.status === 'success') {
          notification.success({
            message: 'Thành công',
            description: 'Xóa chuyên đề thành công',
          })
          setSpinning(false);
          setDeleteModalVisible(false)
          setThematicToDelete(null)
          dispatch(thematicActions.getThematicsByTeacher({ idCourse: '', idModule: idChapter, status: '', search: '', start: '', end: '', pageIndex: 1, pageSize: 99999999 }));
        } else {
          notification.error({
            message: 'Thông báo',
            description: 'Xóa chuyên đề thất bại',
          })
          setSpinning(false);
        }
      }))
    }
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
        Chưa có đề thi Chương học
      </Text>
      {(checkCriteria?.status === 'success' && checkCriteria?.data?.mo_dun_id === Number(idChapter)) ? '' :
        <Alert
          message="Bạn chưa tạo tiêu chí cho đề thi Chương học này!"
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
      }
      {(checkCriteria?.status === 'success' && checkCriteria?.data?.mo_dun_id === Number(idChapter)) &&
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
            marginBottom: 12
          }}
          onClick={() => setIsModunExamModalVisible(true)}
        >
          Thêm đề thi
        </Button>
      }
      {(checkCriteria?.status === 'success' && checkCriteria?.data?.mo_dun_id === Number(idChapter)) ? '' :
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
            setIsModalCriteriaVisible(true);
          }}
        >
          Tạo tiêu chí đề thi Chương học
        </Button>
      }
    </div>
  )

  // event submit form exam
  const handleChapterExamForm = () => {
    addModunExamForm
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
                    addModunExamForm.resetFields();
                    dispatch(examActions.getSyntheticExamModule({ idCourse: module?.data?.khoa_hoc_id, idModule: idChapter, pageSize: 999999, pageIndex: 1 }));
                    notification.success({
                        message: 'Thành công',
                        description: 'Thêm đề thi mới thành công',
                    });
                    setIsModunExamModalVisible(false);
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
              setIsModunExamModalVisible(false);
              addModunExamForm.resetFields();
              dispatch(examActions.getSyntheticExamModule({ idCourse: module?.data?.khoa_hoc_id, idModule: idChapter, pageSize: 999999, pageIndex: 1 }));
            }
          } else {
            notification.error({
                message: 'Thông báo',
                description: state.isEdit ? 'Cập nhật đề thi thất bại' : 'Thêm đề thi mới thất bại',
            })
            setIsModunExamModalVisible(false);
            addModunExamForm.resetFields();
          }
        };

        const formData = new FormData();
        formData.append('ten_de_thi', values.ten_de_thi);
        formData.append('loai_de_thi_id', 2); // 2 là đề thi Chương học
        formData.append('kct_id', values.kct_id);
        formData.append('khoa_hoc_id', values.khoa_hoc_id);
        formData.append('mo_dun_id', values.mo_dun_id);
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
        dispatch(examActions.getSyntheticExamModule({ idCourse: module?.data?.khoa_hoc_id, idModule: idChapter, pageSize: 999999, pageIndex: 1 }));
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

  // Render UI for chapter detail
  const RightContentChapterDetail = () => (
      <>
        <List
          dataSource={exams?.data}
          renderItem={(exam, index) => {
            const menu = (
              <Menu>
                <Menu.Item key="hide" icon={(!exam.trang_thai || !exam.xuat_ban) ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  onClick={(e) => {
                    e.domEvent.stopPropagation();
                    handlePublishExam(exam)} // done
                  }
                >
                  {!exam.xuat_ban ? "Xuất bản đề thi" : !exam.trang_thai ? "Sử dụng đề thi" : "Ngừng sử dụng đề thi"}
                </Menu.Item>
                <Menu.Item key="hide" icon={<CopyOutlined />}
                  onClick={(e) => {
                    e.domEvent.stopPropagation();
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
                  onClick={(e) => {
                    e.domEvent.stopPropagation();
                    if (!exam.xuat_ban) {
                      window.open(`/teacher/exam/detail/${exam?.de_thi_id}?loai_de_thi=DGNL`, '_blank');
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
                  onClick={(e) => {
                    e.domEvent.stopPropagation();
                    setExamToDelete(exam)
                    setDeleteModalVisible(true)
                  }}
                >
                  Xóa đề thi
                </Menu.Item>
              </Menu>
            )

            return (
              <List.Item className="exam-item" onClick={() => handleViewExam(exam)}>
                <div className="exam-item-detail" style={{ opacity: (!exam.trang_thai || !exam.xuat_ban) ? 0.5 : 1, }}>
                  <Avatar className="avatar" 
                    size={48}
                    icon={<FileTextOutlined />}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Text className="exam-title" strong >
                        {exam?.ten_de_thi}
                      </Text>
                      <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button type="text" size="small" icon={<MoreOutlined />} />
                      </Dropdown>
                    </div>
                    <Space size="large" style={{ color: "#8c8c8c", fontSize: "14px" }} >
                      <Space size={6}>
                        <PlayCircleOutlined />
                        <span>{exam?.thoi_gian} phút</span>
                      </Space>
                      <Space size={6}>
                        <FileTextOutlined />
                        <span>{exam?.so_cau_hoi} câu hỏi</span>
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
          onClick={() => setIsModunExamModalVisible(true)}
        >
          Thêm đề thi
        </Button>
      </>
  )
  
  // event đổi trạng thái Chương học
  const ChangeStatusModule = (module) => {
    Modal.confirm({
      width: 500,
      icon: <ExclamationCircleOutlined />,
      content: module?.trang_thai === 1 ? 'Bạn có chắc chán muốn dừng hoạt động Chương học này?' : 'Bạn có chắc chán muốn kích hoạt Chương học này?',
      okText: 'Đồng ý',
      cancelText: 'Hủy',
      onOk() {
        const callback = (res) => {
          if (res.statusText === 'OK' && res.status === 200) {
            dispatch(partActions.getModule({ id: idChapter }));
            notification.success({
              message: 'Thành công',
              description: 'Chuyển trạng thái module thành công',
            })
          } else {
            notification.error({
              message: 'Thông báo',
              description: 'Chuyển trạng thái module thất bại',
            })
          };
        }

        const formData = new FormData();
        formData.append('trang_thai', !module.trang_thai);
        dispatch(partActions.EditModule({ formData: formData, idModule: module?.mo_dun_id }, callback));
      },
    });
  }

  // Event cập nhật Chương học 
  const updateChapter = (values) => {
    if (values.khoa_hoc_id === undefined) { // check null
      notification.warning({
        message: 'Cảnh báo',
        description: 'Thông tin Chương học chưa đủ',
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
        chapterForm.resetFields();
        setIsAddChapterModalVisible(false);
        // request api lấy  Chương học mới
        dispatch(partActions.getModule({ id: idChapter }));
        notification.success({
          message: 'Thành công',
          description: 'Cập nhật Chương học thành công'
        })
      } else {
        notification.error({
          message: 'Thông báo',
          description: 'Cập nhật Chương học thất bại',
        })
      }
    };
    dispatch(partActions.EditModule({ formData: formData, idModule: module?.data.mo_dun_id }, callback));
    
  };

  const handleCancelCriteriaModal = () => {
    setIsModalCriteriaVisible(false)
  }

  return (
    <Spin spinning={spinning} tip="Đang xử lý...">
      <div className="chapter-detail">
        
        <Row gutter={24}>
          {/* Left Content */}
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: "8px", height: "fit-content" }}>
              {/* Chapter Image */}
              <div style={{ marginBottom: "24px" }}>
                <Image
                  src={module?.data?.anh_dai_dien === null ? require("assets/img/lich_khoa_hoc.jpg").default : config.API_URL + `${module?.data?.anh_dai_dien}`}
                  alt="Calculator and documents"
                  style={{ objectFit: "cover", borderRadius: "8px" }}
                  preview={true}
                />
              </div>

              {/* Chapter Title */}
              <Title level={3} style={{ marginBottom: "24px", color: "#262626", lineHeight: "1.4" }}>
                {module?.data?.ten_mo_dun}
              </Title>

              {/* Chapter Description */}
              <Paragraph style={{ color: "#595959", lineHeight: "1.8", fontSize: "16px", textAlign: "justify" }}>
                {module?.data?.mo_ta}
              </Paragraph>

              {/* Action Buttons */}
              <Space style={{ marginTop: "32px" }}>
                <Button icon={module?.data?.trang_thai === 1 ? <EyeInvisibleOutlined /> : <EyeOutlined /> } style={{ borderRadius: "6px" }}
                  onClick={() => ChangeStatusModule(module?.data)}
                >
                  {module?.data?.trang_thai === 1 ? 'Ẩn chương' : 'Hiện chương'}
                </Button>
                <Button icon={<EditOutlined />} style={{ borderRadius: "6px" }}
                  onClick={() => {
                    chapterForm.setFieldsValue(module?.data)
                    setIsAddChapterModalVisible(true)
                  }}
                >
                  Cập nhật chương
                </Button>
                <Button icon={<DeleteOutlined />} danger style={{ borderRadius: "6px" }} 
                  onClick={() => {
                    setDeleteModalVisible(true)
                    setModunToDelete(module?.data)
                  }}
                />
              </Space>
            </Card>
          </Col>

          {/* Right Content */}
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: "8px" }}>
              <Title level={4} style={{ marginBottom: "16px", color: "#262626" }}>
                Nội dung Chương học
              </Title>

              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane
                  tab={
                    <span
                      style={{
                        color: activeTab === "topics" ? "#fff" : "#8c8c8c",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontWeight: "500",
                      }}
                    >
                      Danh sách chuyên đề ({thematics?.totalCount})
                    </span>
                  }
                  key="topics"
                >
                  <List
                    dataSource={thematics?.data}
                    renderItem={(topic, index) => {
                      const menu = (
                        <Menu>
                          <Menu.Item key="edit" icon={<EditOutlined />}
                            onClick={(e) => {
                              e.domEvent.stopPropagation();
                              dispatch(thematicActions.getThematic({ id: topic?.chuyen_de_id }, (res) => {
                                if (res.status === 'success') {
                                  setState({ ...state, isEdit: true, idThematic: topic?.chuyen_de_id });
                                  setIsAddTopicModalVisible(true);
                                  TopicForm.setFieldsValue(res.data);
                                }
                              }))
                            }}
                          >
                            Cập nhật chuyên đề
                          </Menu.Item>
                          <Menu.Item key="hide" icon={<EyeInvisibleOutlined />}
                            onClick={(e) => {
                              e.domEvent.stopPropagation();
                              let data = {
                                "trang_thai": !topic.trang_thai,
                              }
                              dispatch(thematicActions.EditThematic({ formData: data, idThematic: topic?.chuyen_de_id }, (res) => {
                                if (res.statusText === 'OK' && res.status === 200) {
                                  notification.success({
                                    message: 'Thành công',
                                    description: topic.trang_thai ? 'Ẩn chuyên đề thành công' : 'Hiện chuyên đề thành công',
                                  })
                                  dispatch(thematicActions.getThematicsByTeacher({ idCourse: '', idModule: idChapter, status: '', search: '', start: '', end: '', pageIndex: 1, pageSize: 99999999 }));
                                } else {
                                  notification.error({
                                    message: 'Thông báo',
                                    description: topic.trang_thai ? 'Ẩn chuyên đề thất bại' : 'Hiện chuyên đề thất bại',
                                  })
                                }
                              }))
                            }}
                          >
                            {topic.trang_thai ? 'Ẩn chuyên đề' : 'Hiện chuyên đề'}
                          </Menu.Item>
                          <Menu.Item key="delete" icon={<DeleteOutlined />} danger
                            onClick={(e) => {
                              e.domEvent.stopPropagation();
                              setThematicToDelete(topic);
                              setDeleteModalVisible(true);
                            }}
                          >
                            Xóa chuyên đề
                          </Menu.Item>
                        </Menu>
                      )

                      return (
                        <List.Item className="modun-item" 
                          onClick={() => {
                            const dataPath = JSON.parse(localStorage.getItem('dataPath')) || [];
                            dataPath.push({
                                title: topic.ten_chuyen_de,
                                path: `/teacher/module-detail/${topic.chuyen_de_id}`
                            });
                            localStorage.setItem('dataPath', JSON.stringify(dataPath));
                            history.push(`/teacher/module-detail/${topic.chuyen_de_id}`)
                          }}
                        >
                          <div className="modun-item-detail" style={{opacity: !topic.trang_thai ? 0.5 : 1}}>
                            <Avatar className="avatar" size={48} icon={<FileTextOutlined />} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Text strong className="modun-title" >
                                  {topic?.ten_chuyen_de}
                                </Text>
                                <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight" onClick={(e) => e.stopPropagation()}>
                                  <Button type="text" size="small" icon={<MoreOutlined />} />
                                </Dropdown>
                              </div>
                              <Space size="large" style={{ color: "#8c8c8c", fontSize: "14px" }} >
                                <Space size={6}>
                                  <FileTextOutlined />
                                  <span>{topic?.so_tai_lieu} tài liệu</span>
                                </Space>
                                <Space size={6}>
                                  <PlayCircleOutlined />
                                  <span>{topic?.so_video} videos bài giảng</span>
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
                        color: activeTab === "exams" ? "#fff" : "#8c8c8c",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontWeight: "500",
                      }}
                    >
                      Đề thi Chương học ({exams?.totalCount})
                    </span>
                  }
                  key="exams"
                >
                  {exams?.totalCount === 0 ? <EmptyExamsState /> : <RightContentChapterDetail />}
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>

        {/* Add chuyên đề Modal */}
        <Modal
          title={!state.isEdit ? "Thêm chuyên đề mới" : "Cập nhật chuyên đề"}
          open={isAddTopicModalVisible}
          onCancel={() => {
            setIsAddTopicModalVisible(false)
            setState({ ...state, fileImg: '', fileVid: '', isEdit: false, idModule: '', idThematic: ''})
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
                  label="Tên chuyên đề"
                  name="ten_chuyen_de"
                  rules={[{ required: true, message: "Vui lòng nhập tên chuyên đề" }]}
                >
                  <Input placeholder="Nhập tên chuyên đề"/>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Khung chương trình"
                  name="kct_id"
                  rules={[{ required: true, message: "Vui lòng chọn khung chương trình" }]}
                  initialValue={module?.data?.kct_id}
                >
                  {renderProgrammes()}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Khóa học"                
                  name="khoa_hoc_id"
                  rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
                  initialValue={module?.data?.khoa_hoc_id}
                >
                  {renderCourses()}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Chương học"
                  name="mo_dun_id"
                  rules={[{ required: true, message: "Vui lòng chọn Chương học" }]}
                  initialValue={module?.data?.mo_dun_id}
                >
                  {renderModules()}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              {/* <Col span={12}>
                <Form.Item className="input-col" label="Lớp học" name="lop_id" 
                  rules={[{ required: true, message: "Vui lòng chọn lớp học" }]}
                >
                  {renderClasses()}
                </Form.Item>
              </Col> */}
              <Col span={12}>
                <Form.Item label="Trạng thái" name="trang_thai" initialValue={true}>
                  <Select disabled={!state.isEdit} style={{height: 48}}
                    onChange={(trang_thai) => setState({ ...state, trang_thai: trang_thai })}
                    placeholder="Chọn trạng thái"
                  >
                    <Option value={true} >Đang hoạt động</Option>
                    <Option value={false} >Đã dừng</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Mô tả"
              name="mo_ta"
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
                    setState({ ...state, fileImg: '', fileVid: '', isEdit: false, idModule: '', idThematic: ''})
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
                  onClick={handleFormTopic}
                >
                  Xác nhận
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal>
        
        {/* edit Chapter Modal */}
        <Modal
          title={'Cập nhật Chương học'}
          open={isAddChapterModalVisible}
          onCancel={() => {
            setIsAddChapterModalVisible(false)
            chapterForm.resetFields()
            setState({ ...state, fileImg: '', fileVid: '', isEdit: false, idModule: ''})
          }}
          footer={[
            <Button key="cancel" onClick={() => {
              setIsAddChapterModalVisible(false)
              chapterForm.resetFields()
              setState({ ...state, fileImg: '', fileVid: '', isEdit: false, idModule: ''})
            }}>
              Hủy bỏ
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                chapterForm
                  .validateFields()
                  .then((values) => {
                    updateChapter(values)
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
                  label="Tên Chương học"
                  name="ten_mo_dun"
                  rules={[{ required: true, message: "Vui lòng nhập tên Chương học" }]}
                >
                  <Input placeholder="Nhập tên Chương học" />
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
                  initialValue={module?.data?.kct_id}
                  rules={[{ required: true, message: "Vui lòng chọn khung chương trình" }]}
                >
                  {renderProgrammes()}
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item className="input-col" label="Khóa học" name="khoa_hoc_id" 
                  initialValue={module?.data?.khoa_hoc_id}
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
                  label="Loại Chương học"
                  initialValue={1}
                  rules={[
                    {
                      required: true,
                      message: 'Loại Chương học là trường bắt buộc.',
                    },
                  ]}
                >
                    <Radio.Group>
                      <Radio className="option-payment" value={1}>
                        Phần thi tổng hợp
                      </Radio>
                      {/* <Radio className="option-payment" value={2}>
                        Phần thi Chương học
                      </Radio> */}
                      <Radio className="option-payment" value={0}>
                        Phần bài học
                      </Radio>
                    </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Mô tả Chương học" name="mo_ta">
              <Input.TextArea
                rows={4}
                placeholder="Mô tả về Chương học"
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
            setDeleteModalVisible(false);
            setExamToDelete(null);
            setModunToDelete(null);
            setThematicToDelete(null);
          }}
          footer={null}
          width={420}
          centered
          closable={false}
          className="delete-confirmation-modal"
        > 
          <Spin spinning={spinning} tip="Đang xóa dữ liệu...">
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
                Xoá {examToDelete ? 'đề thi' : thematicToDelete ? "Chuyên đề" : "Chương học"}
              </Title>
              <Paragraph style={{ fontSize: "16px", color: "#595959", marginBottom: "24px" }}>
                Bạn có chắc chắn muốn xoá {" "} {examToDelete ? 'đề thi' : thematicToDelete ? "Chuyên đề" : "Chương học"} này?
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
                      setThematicToDelete(null);
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
          </Spin>
        </Modal>
        
        {/* add exam modun */}
        <Modal
          title={state.isEdit ? 'Cập nhật đề thi Chương học' : "Tạo đề thi Chương học"}
          open={isModunExamModalVisible}
          onCancel={() => {
            setState({ ...state, isEdit: false, idExam: '', fileImg: '', fileVid: '', fileExam: '' })
            setIsModunExamModalVisible(false)
            addModunExamForm.resetFields()
          }}
          footer={null}
          width={600}
          destroyOnClose
          className="add-modun-exam-modal"
        >
          <Spin spinning={spinning} tip="Đang tải dữ liệu...">
            <Form form={addModunExamForm} layout="vertical" style={{ marginTop: "24px" }}>
              <Form.Item label='Mã đề thi' name="de_thi_ma" rules={[{ required: true, message: 'Mã đề thi là bắt buộc'}]}>
                <Input size="normal" placeholder="Mã đề thi" />
              </Form.Item>
              <Form.Item label='Tên đề thi' name="ten_de_thi" rules={[{ required: true, message: 'Tên đề thi là bắt buộc'}]}>
                <Input size="normal" placeholder="Tên đề thi" />
              </Form.Item>
              <Form.Item label="Khung chương trình" name="kct_id" 
                rules={[{ required: true, message: 'Loại đề thi là bắt buộc'}]}
                initialValue={module?.data?.kct_id}
              >
                  {renderProgrammes()}
              </Form.Item>
              <Form.Item
                label="Khóa học"
                name="khoa_hoc_id"
                rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
                initialValue={module?.data?.khoa_hoc_id}
              >
                {renderCourses()}
              </Form.Item>

              <Form.Item
                label="Chương học"            
                name="mo_dun_id"
                rules={[{ required: true, message: "Vui lòng chọn Chương học" }]}
                initialValue={module?.data?.mo_dun_id}
              >
                {renderModules()}
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
                rules={[{ required: !state.isEdit, message: "Vui lòng tải lên file đề thi" }]}
                style={{ display: state.isEdit ? 'none' : 'block' }}
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

              <Row gutter={16} style={{ marginTop: "32px" }}>
                <Col span={12}>
                  <Button
                    block
                    size="large"
                    onClick={() => {
                      setState({ ...state, isEdit: false, idExam: '', fileImg: '', fileVid: '', fileExam: '' })
                      setIsModunExamModalVisible(false)
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
                    onClick={handleChapterExamForm}
                    className="btn-add"
                  >
                    Xác nhận
                  </Button>
                </Col>
              </Row>
            </Form>
          </Spin>
        </Modal>

        {/* View exam modal */}
        <ViewExam exam={exam?.data} isExamViewModalVisible={isExamViewModalVisible} setIsExamViewModalVisible={setIsExamViewModalVisible}
          handlePublishExam={handlePublishExam} 
        />

        {/* Modal add criteria */}
        <ModalCriteria module={true} isModalVisible={isModalCriteriaVisible} handleCancel={handleCancelCriteriaModal}
          initCourse={module?.data?.khoa_hoc_id} initModule={Number(idChapter)}
        />

      </div>
    </Spin>
  )
}

export default ChapterDetail
