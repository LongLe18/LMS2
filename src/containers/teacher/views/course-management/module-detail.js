import { useState, useEffect } from "react"
import { useParams, useHistory } from "react-router-dom"
import { Menu, Typography, Button, Space, Tabs, List, notification, message,
    Avatar, Dropdown, Row, Col, Card, Modal, Form, Spin, Input, Select, Upload,
    Progress, Alert } from "antd"
import { FileTextOutlined, MoreOutlined, PlayCircleOutlined, PlusOutlined,
    EyeOutlined, EyeInvisibleOutlined, DeleteOutlined, ExclamationCircleFilled,
    EditOutlined, ExclamationCircleOutlined, UploadOutlined, } from "@ant-design/icons"
import './module-detail.css' // Import custom CSS for styling
import config from '../../../../configs/index';
import axios from 'axios';
import ViewExam from "./view-exam"
import ModalCriteria from './modal-criteria';

import * as thematicActions from '../../../../redux/actions/thematic';
import * as lessonActions from '../../../../redux/actions/lesson';
import * as courseActions from '../../../../redux/actions/course';
import * as programmeAction from '../../../../redux/actions/programme';
import * as partActions from '../../../../redux/actions/part';
import * as examActions from '../../../../redux/actions/exam';
import * as criteriaActions from '../../../../redux/actions/criteria';
import { useDispatch, useSelector } from "react-redux"

// ==================================================================== 
// Giao diện chuyên đề (chi tiết Chương học)
// ==================================================================== 

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { Option } = Select
const { Dragger } = Upload

const ModunDetail = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const idThematic = useParams().idThematic; // id of the Chapter from URL params
    const [activeTab, setActiveTab] = useState("materials")
    const [lessonForm] = Form.useForm();
    const [spinning, setSpinning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedMaterial, setSelectedMaterial] = useState(null)
    const [isLessonModalVisible, setIsLessonModalVisible] = useState(false);
    const [isExamViewModalVisible, setIsExamViewModalVisible] = useState(false);
    const [examToDelete, setExamToDelete] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [isThematicExamModalVisible, setIsThematicExamModalVisible] = useState(false)
    const [isModalCriteriaVisible, setIsModalCriteriaVisible] = useState(false);
    const [addThematicExamForm] = Form.useForm();

    const thematic = useSelector(state => state.thematic.item.result);
    const lessons = useSelector(state => state.lesson.list.result);
    const programmes = useSelector(state => state.programme.list.result);
    const courses = useSelector(state => state.course.list.result);
    const modules = useSelector(state => state.part.list.result);
    const thematics = useSelector(state => state.thematic.list.result);
    const exams = useSelector(state => state.exam.list.result);
    const exam = useSelector(state => state.exam.item.result);
    const checkCriteria = useSelector(state => state.criteria.check.result);

    const [state, setState] = useState({
        isEdit: false,
        idModule: '',
        idExam: '',
        idThematic: '',
        idLesson: '',
        filePdf: '',
        fileListVideo: [],
        typeLesson: 'pdf',
        Uploading: false,
    });
    
    useEffect(() => {
        dispatch(thematicActions.getThematic({ id: idThematic }, (res) => {
            if (res.status === 'success') {
                dispatch(lessonActions.filterLessons({ idCourse: '', idModule: res?.data?.mo_dun_id, idThematic: idThematic, status: '', search: '', 
                    start: '', end: '', pageSize: 999999999, pageIndex: 1 }));
                dispatch(courseActions.getCourses({ idkct: res?.data?.kct_id, status: '', search: '', pageSize: 99999999, pageIndex: 1 }));
                dispatch(partActions.getModulesTeacher({ idCourse: res?.data?.khoa_hoc_id, lkh: '', status: '', search: '', pageSize: 99999999, pageIndex: 1 }));
                dispatch(thematicActions.getThematicsByTeacher({ idCourse: '', idModule: res?.data?.mo_dun_id, status: '', search: '', start: '', end: '', pageIndex: 1, pageSize: 99999999 }));
                dispatch(examActions.getSyntheticExamThematic({ idCourse: res?.data?.khoa_hoc_id, idModule: res?.data?.mo_dun_id, idThematic: idThematic, pageSize: 999999, pageIndex: 1 }));
                dispatch(criteriaActions.checkCriteria({ type: 'thematic', id: res?.data?.mo_dun_id }));
            }
        }));
        dispatch(programmeAction.getProgrammes({ status: '' }));
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const propsImage = {
        name: 'file',
        action: '#',
    
        beforeUpload: file => {
            const isPNG = file.type === 'image/png' || file.type === 'image/jpeg';
            if (!isPNG) {
                message.error(`${file.name} có định dạng không phải là png/jpg`);
            }
            // check dung lượng file trên 1mb => không cho upload
            let size = true;
            if (file.size > 1024000) {
                message.error(`${file.name} dung lượng file quá lớn`);
                size = false;
            }
            return (isPNG && size) || Upload.LIST_IGNORE;
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
            console.log(e);
            setState({ ...state, fileImg: '' });
        },
    };
    
    const propsVideo = {
        name: 'file',
        action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',

        beforeUpload: file => {
        const isPDF = file.type === 'application/pdf' || file.type === 'video/mp4';
        if (file.type === 'application/pdf') setState({ ...state, typeLesson: 'pdf' });
        else if (file.type === 'video/mp4') setState({ ...state, typeLesson: 'video' });

        if (!isPDF) {
            message.error(`${file.name} có định dạng không phải là application/pdf hoặc video/mp4`);
        }
        return isPDF || Upload.LIST_IGNORE;
        },

        onChange(info) {       
        setState({ ...state, filePdf: info.file.originFileObj });
        },

        async customRequest(options) {
        const { onSuccess } = options;

        setTimeout(() => {
            onSuccess("ok");
        }, 0);
        },

        onDrop(e) {
        console.log('Dropped files', e.dataTransfer.files);
        setState({...state, fileImg: ''});
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

    const renderProgrammes = () => {
        let options = [];
        if (programmes.status === 'success') {
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
                onChange={(kct_id) => dispatch(courseActions.getCourses({ idkct: kct_id, status: '', search: '', pageSize: 99999999, pageIndex: 1 }))}
            >
                {options}
            </Select>
        );
    };
    
    const renderCourses = () => {
        let options = [];
        if (courses.status === 'success') {
            options = courses.data
            .filter((course) => course.khung_chuong_trinh.loai_kct === 2 || course.khung_chuong_trinh.loai_kct === 4 || course.khung_chuong_trinh.loai_kct === 5)
            .map((course) => (
                <Option key={course.khoa_hoc_id} value={course.khoa_hoc_id} >{course.ten_khoa_hoc}</Option>
            ))
        }
        return (
        <Select
            showSearch={true}
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            onChange={(khoa_hoc_id) => {
                dispatch(partActions.getModulesByIdCourse({ idCourse: khoa_hoc_id }))
            }}
            placeholder="Chọn khóa học"
        >
            {options}
        </Select>
        );
    };
    
    const renderModules = () => {
        let options = [];
        if (modules.status === 'success') {
            options = modules.data
            .filter((module) => module.loai_tong_hop !== true)
            .map((module) => (
                <Option key={module.mo_dun_id} value={module.mo_dun_id} >{module.ten_mo_dun}</Option>
            ))
        }
        return (
        <Select
            showSearch={true}
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            onChange={(mo_dun_id) => {
                dispatch(thematicActions.getThematicsByIdModule({ idModule: mo_dun_id }))
            }}
            placeholder="Chọn Chương học"
        >
            {options}
        </Select>
        );
    };

    const renderThematics = () => {
        let options = [];
        if (thematics.status === 'success') {
            options = thematics?.data?.map((thematic) => (
                <Option key={thematic.chuyen_de_id} value={thematic.chuyen_de_id} >{thematic.ten_chuyen_de}</Option>
            ))
        }
        return (
            <Select
                showSearch={false}
                onChange={(chuyen_de_id) => {
                    setState({...state, thematicId: chuyen_de_id });
                }}
                placeholder="Chọn chuyên đề"
            >
                {options}
            </Select>
        );
    }

    const handleMaterialClick = (material) => {
        setSelectedMaterial(material)
    }

    const handleLessonForm = async (values) => {
        const submitForm = async (formData) => {
            const configa = {
                headers: { "content-type": "multipart/form-data", Authorization: `Bearer ${localStorage.getItem('userToken')}`, },
                onUploadProgress: event => {
                    const percent = Math.floor((event.loaded / event.total) * 100);
                    setProgress(percent);
                    if (percent === 100) {
                        setTimeout(() => setProgress(0), 1000);
                    }
                }
            }; 
            try {
                if (state.isEdit) {
                    await axios.put(
                        config.API_URL + `/lesson/${state.idLesson}`,
                            formData,
                            configa,
                        );
                        lessonForm.resetFields();
                        setState({...state, Uploading: false, isEdit: false, idLesson: '', fileImg: '', fileVid: ''});
                        setIsLessonModalVisible(false);
                        setSpinning(false);
                        dispatch(lessonActions.filterLessons({ idCourse: '', idModule: thematic?.data?.mo_dun_id, idThematic: idThematic, status: '', search: '', 
                            start: '', end: '', pageSize: 999999999, pageIndex: 1 }));
                        notification.success({
                            message: 'Thành công',
                            description: 'Cập nhật bài giảng thành công',
                        });
                } else {
                    await axios.post(
                        config.API_URL + '/lesson/create',
                        formData,
                        configa,
                    );
                    lessonForm.resetFields();
                    dispatch(lessonActions.filterLessons({ idCourse: '', idModule: thematic?.data?.mo_dun_id, idThematic: idThematic, status: '', search: '', 
                            start: '', end: '', pageSize: 999999999, pageIndex: 1 }));
                    setState({...state, Uploading: false});
                    setIsLessonModalVisible(false);
                    setSpinning(false);
                    notification.success({
                        message: 'Thành công',
                        description: 'Thêm bài giảng mới thành công',
                    })
                }
            } catch (err) {
                setState({...state, Uploading: false});
                notification.error({
                    message: 'Thông báo',
                    description: state.isEdit ? 'Cập nhật bài giảng thất bại' : 'Thêm bài giảng mới thất bại ' + err,
                })
            }
        }
        setState({...state, Uploading: true});
        setSpinning(true);

        if (state.typeLesson !== values.loai_bai_giang) {
            notification.error({
                message: 'Cảnh báo',
                description: 'Loại bài giảng không khớp với loại file tải lên',
            });
            setSpinning(false);
            return;
        }
      
        const formData = new FormData();
        let isExist = false;
        
        if (values.loai_bai_giang === 'pdf') {
            for (let i = 0; i < lessons?.data?.length; i++) {
                if (lessons?.data[i].chuyen_de_id === values.chuyen_de && lessons?.data[i].loai_bai_giang === 'pdf') {
                    isExist = true;
                }        
            }
        }
        if (isExist) {
            Modal.confirm({
                icon: <ExclamationCircleOutlined />,
                content: 'Chuyên đề này đã có bài giảng pdf \n Bạn có muốn ghi đè bài giảng đã có không?',
                okText: 'Đồng ý',
                cancelText: 'Hủy',
                onOk() {
                    formData.append('ten_bai_giang', values.ten_bai_giang);
                    formData.append('loai_bai_giang', state.typeLesson);
                    formData.append('mo_ta', values.mo_ta !== undefined ? values.mo_ta : '' );
                    formData.append('chuyen_de_id', values.chuyen_de);
                    // video , image
                    if (state.filePdf !== '')
                        formData.append('link_bai_giang', state.filePdf);   
                    submitForm(formData);
                },
            });
        } else {
            formData.append('ten_bai_giang', values.ten_bai_giang);
            formData.append('loai_bai_giang', values.loai_bai_giang);
            formData.append('mo_ta', values.mo_ta !== undefined ? values.mo_ta : '' );
            formData.append('chuyen_de_id', values.chuyen_de);
            // video , image
            if (state.filePdf !== '')
                formData.append('link_bai_giang', state.filePdf);   
            submitForm(formData);
        }
    }

    const handleHideLesson = (material) => {
        // check trạngn thái bài giảng
        // nếu tồn tại bài giảng đang hiện thị thi thông báo 
        const checkLesson = () => {
            if (lessons?.data?.length > 0) {
                const isExist = lessons.data.some(item => item.loai_bai_giang === 'pdf' && item.trang_thai === 1 && item.bai_giang_id !== material.bai_giang_id);
                if (isExist) {
                    notification.warning({
                        message: 'Cảnh báo',
                        description: 'Vui lòng ẩn bài giảng đang hiện thị trước khi thực hiện thao tác này',
                    });
                    return true;
                }
            }
            return false;
        }

        Modal.confirm({
            title: 'Cảnh báo',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn ${material.trang_thai === 0 ? 'hiện' : 'ẩn'} bài giảng "${material.ten_bai_giang}" không?`,
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk() {
                if (!checkLesson()) {
                    const formData = new FormData();
                    formData.append('trang_thai', material.trang_thai === 0 ? 1 : 0);
                    dispatch(lessonActions.EditLesson({ idLesson: material.bai_giang_id, formData: formData }, (res) => {
                        if (res?.data?.status === 'success') {
                            notification.success({
                                message: 'Thành công',
                                description: `Bài giảng "${material.ten_bai_giang}" đã ${material.trang_thai === 0 ? 'hiện' : 'ẩn'} thành công`,
                            });
                            dispatch(lessonActions.filterLessons({ idCourse: '', idModule: thematic?.data?.mo_dun_id, idThematic: idThematic, status: '', search: '', 
                                start: '', end: '', pageSize: 999999999, pageIndex: 1 }));
                        } else {
                            notification.error({
                                message: 'Thất bại',
                                description: `Không thể ${material.trang_thai === 0 ? 'hiện' : 'ẩn'} bài giảng "${material.ten_bai_giang}"`,
                            });
                        }
                    }));
                }
            },
        });
    }

    const handleDeleteLesson = (material) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chán muốn xóa Bài giảng này?',
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk() {
                const callback = (res) => {
                if (res.statusText === 'OK' && res.status === 200) {
                    dispatch(lessonActions.filterLessons({ idCourse: '', idModule: thematic?.data?.mo_dun_id, idThematic: idThematic, status: '', search: '',
                    start: '', end: '', pageSize: 999999999, pageIndex: 1 }));
                    notification.success({
                        message: 'Thành công',
                        description: 'Xóa bài giảng thành công',
                    })
                } else {
                    notification.error({
                        message: 'Thông báo',
                        description: 'Xóa bài giảng thất bại',
                    })
                };
                }
                dispatch(lessonActions.DeleteLesson({ idLesson: material?.bai_giang_id }, callback))
            },
        });
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

    // event xuất bản thi tổng hợp
    const handlePublishExam = (exam) => {
    
        const handlePusblish = () => {
            const callback = (res) => {
                if (res.status === 'success') {
                    if (!exam.xuat_ban) dispatch(examActions.getUsing({ id: exam.de_thi_id }, (response) => {
                        if (response.status === 'success') {
                            dispatch(examActions.getSyntheticExamThematic({ idCourse: thematic?.data?.khoa_hoc_id, idModule: thematic?.data?.mo_dun_id, idThematic: idThematic, pageSize: 999999, pageIndex: 1 }));
                        }
                    }))
                    else dispatch(examActions.getSyntheticExamThematic({ idCourse: thematic?.data?.khoa_hoc_id, idModule: thematic?.data?.mo_dun_id, idThematic: idThematic, pageSize: 999999, pageIndex: 1 }));
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

    // event xoá Chương học / đề thi modun
    const handleDelete = () => {
        setSpinning(true);
        // call api
        const callback = (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                dispatch(examActions.getSyntheticExamThematic({ idCourse: thematic?.data?.khoa_hoc_id, idModule: thematic?.data?.mo_dun_id, idThematic: idThematic, pageSize: 999999, pageIndex: 1 }));
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
        dispatch(examActions.deleteExam({ idExam: examToDelete.de_thi_id }, callback))
    }

    // event submit form exam
    const handleChapterExamForm = () => {
        addThematicExamForm
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
                                addThematicExamForm.resetFields();
                                dispatch(examActions.getSyntheticExamThematic({ idCourse: thematic?.data?.khoa_hoc_id, idModule: thematic?.data?.mo_dun_id, idThematic: idThematic, pageSize: 999999, pageIndex: 1 }));
                                notification.success({
                                    message: 'Thành công',
                                    description: 'Thêm đề thi mới thành công',
                                });
                                setIsThematicExamModalVisible(false);
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
                        setIsThematicExamModalVisible(false);
                        addThematicExamForm.resetFields();
                        dispatch(examActions.getSyntheticExamThematic({ idCourse: thematic?.data?.khoa_hoc_id, idModule: thematic?.data?.mo_dun_id, idThematic: idThematic, pageSize: 999999, pageIndex: 1 }));
                    }
                } else {
                    notification.error({
                        message: 'Thông báo',
                        description: state.isEdit ? 'Cập nhật đề thi thất bại' : 'Thêm đề thi mới thất bại',
                    })
                    setIsThematicExamModalVisible(false);
                    addThematicExamForm.resetFields();
                }
            };
    
            const formData = new FormData();
            formData.append('ten_de_thi', values.ten_de_thi);
            formData.append('loai_de_thi_id', 1); // 2 là đề thi Chương học
            formData.append('kct_id', values.kct_id);
            formData.append('khoa_hoc_id', values.khoa_hoc_id);
            formData.append('mo_dun_id', values.mo_dun_id);
            formData.append('chuyen_de_id', values.chuyen_de_id);
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

     // Render UI for chapter detail
    const RightContentChapterDetail = () => (
        <List
            dataSource={exams?.data}
            renderItem={(exam, index) => {
            const menu = (
                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.Item key="edit" icon={<EditOutlined />}
                                onClick={(e) => {
                                    e.domEvent.stopPropagation();
                                    if (!exam.xuat_ban) {
                                        history.push(`/teacher/exam/detail/${exam?.de_thi_id}?loai_de_thi=onluyen`)
                                        // dispatch(examActions.getExam({ id: exam.de_thi_id }, (res) => {
                                        //     if (res.status === 'success') {
                                        //         setState({ ...state, isEdit: true, idExam: exam.de_thi_id });
                                        //         setIsThematicExamModalVisible(true);
                                        //         addThematicExamForm.setFieldsValue(res.data)
                                        //     }
                                        // }));
                                    } else 
                                        notification.warning({
                                            message: 'Cảnh báo',
                                            description: 'Đề thi đã được xuất bản, không thể chỉnh sửa đề thi này',
                                        })
                                }}
                            >
                                Cập nhật đề thi
                            </Menu.Item>
                            <Menu.Item key="hide" icon={(!exam.trang_thai || !exam.xuat_ban) ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                onClick={(e) => {
                                    e.domEvent.stopPropagation();
                                    handlePublishExam(exam)} // done
                                }
                            >
                                {!exam.xuat_ban ? "Xuất bản đề thi" : !exam.trang_thai ? "Sử dụng đề thi" : "Ngừng sử dụng đề thi"}
                            </Menu.Item>
                            <Menu.Item key="delete" danger icon={<DeleteOutlined />}
                                onClick={(e) => {
                                    e.domEvent.stopPropagation();
                                    setExamToDelete(exam)
                                    setDeleteModalVisible(true)
                                }}
                            >
                                Xóa đề thi
                            </Menu.Item>
                        </Menu>
                    }
                    trigger={["click"]}
                    placement="bottomRight"
                >
                    <Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()}/>
                </Dropdown>
            )

            return (
                <List.Item style={{ padding: "12px 0", border: "none" }} onClick={() => handleViewExam(exam)}>
                    <div style={{ display: "flex", width: "100%", cursor: 'pointer',
                        alignItems: "center", opacity: (!exam.trang_thai || !exam.xuat_ban) ? 0.5 : 1 }}
                    >
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
                                {exam?.ten_de_thi}
                            </Text>
                            <Space size="large" style={{ color: "#8c8c8c", fontSize: "14px" }}>
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
                        {menu}
                    </div>
                </List.Item>
            )
            }}
        />
    )

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
                Chưa có đề thi chuyên đề
            </Text>
            {(checkCriteria?.status === 'success' && checkCriteria?.data?.mo_dun_id === thematic?.data?.mo_dun_id) ? '' :
                <Alert
                    message="Bạn chưa tạo tiêu chí cho đề thi chuyên đề!"
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
            {(checkCriteria?.status === 'success' && checkCriteria?.data?.mo_dun_id === thematic?.data?.mo_dun_id) &&
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
                    onClick={() => setIsThematicExamModalVisible(true)}
                >
                    Thêm đề thi
                </Button>
            }
            {(checkCriteria?.status === 'success' && checkCriteria?.data?.mo_dun_id === thematic?.data?.mo_dun_id) ? '' :
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
                    Tạo tiêu chí đề thi chuyên đề
                </Button>
            }
        </div>
    )

    const handleCancelCriteriaModal = () => {
        setIsModalCriteriaVisible(false)
    }

    return (
        <Spin spinning={spinning} tip="Đang xử lý...">
            <div className="module-detail" >
                <Row gutter={24}>
                    {/* Left Content */}
                    <Col xs={24} lg={10}>
                        <Card style={{ borderRadius: "8px", marginBottom: "24px" }}>
                            {/* Topic Title */}
                            <Title level={3} style={{ marginBottom: "16px", color: "#262626", lineHeight: "1.4" }}>
                                {thematic?.data?.ten_chuyen_de}
                            </Title>

                            {/* Topic Description */}
                            <Paragraph style={{ color: "#595959", lineHeight: "1.6", marginBottom: "24px" }}>
                                {thematic?.data?.mo_ta}
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
                                        Bài giảng ({lessons?.totalCount})
                                        </span>
                                    }
                                    key="materials"
                                >
                                    <List
                                        dataSource={lessons?.data}
                                        renderItem={(material, index) => {
                                            const menu = (
                                                <Menu>
                                                    <Menu.Item key="edit" icon={<EditOutlined />}
                                                        onClick={(e) => {
                                                            e.domEvent.stopPropagation();
                                                            dispatch(lessonActions.getLesson({ id: material?.bai_giang_id }, (res) => {
                                                                if (res.status === 'success') {
                                                                    setState({ ...state, isEdit: true, idLesson: material?.bai_giang_id, fileImg: '', fileVid: '', idModule: thematic?.data?.mo_dun_id });
                                                                    setIsLessonModalVisible(true);
                                                                    lessonForm.setFieldsValue(res.data)
                                                                }
                                                            }));
                                                        }}
                                                    >
                                                        Cập nhật bài giảng
                                                    </Menu.Item>
                                                    <Menu.Item key="hide" icon={(material.trang_thai === 0) ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                                        onClick={(e) => {
                                                            e.domEvent.stopPropagation();
                                                            handleHideLesson(material)}
                                                        }
                                                    >
                                                        {material.trang_thai === 0 ? "Hiện bài giảng" : "Ẩn bài giảng"}
                                                    </Menu.Item>
                                                    <Menu.Item key="delete" danger icon={<DeleteOutlined />}
                                                        onClick={(e) => {
                                                            e.domEvent.stopPropagation();
                                                            handleDeleteLesson(material)}
                                                        }
                                                    >
                                                        Xóa bài giảng
                                                    </Menu.Item>
                                                </Menu>
                                        )

                                            return (
                                                <List.Item
                                                    style={{
                                                        padding: "12px 0",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        backgroundColor: selectedMaterial?.bai_giang_id === material.bai_giang_id ? "#f0f2ff" : "transparent",
                                                        borderRadius: "6px",
                                                        marginBottom: "4px",
                                                        paddingLeft: selectedMaterial?.bai_giang_id === material.bai_giang_id ? "12px" : "0",
                                                        paddingRight: selectedMaterial?.bai_giang_id === material.bai_giang_id ? "12px" : "0",
                                                    }}
                                                    onClick={() => handleMaterialClick(material)}
                                                >
                                                    <div style={{ display: "flex", width: "100%", alignItems: "center", opacity: (!material.trang_thai) ? 0.5 : 1 }}>
                                                        <div style={{ marginRight: "12px", fontSize: "18px" }}>
                                                            {
                                                                material?.loai_bai_giang === "video" ?
                                                                <PlayCircleOutlined style={{ color: "#262626" }} /> :
                                                                <FileTextOutlined style={{ color: "#ff4d4f" }} />
                                                            }
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <Text
                                                                style={{
                                                                    fontSize: "14px",
                                                                    lineHeight: "1.4",
                                                                    color: "#262626",
                                                                    display: "block",
                                                                }}
                                                            >
                                                                {material?.ten_bai_giang}
                                                            </Text>
                                                        </div>
                                                        <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Button type="text" size="small" icon={<MoreOutlined />} />
                                                        </Dropdown>
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
                                        onClick={() => setIsLessonModalVisible(true)}
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
                                            Đề thi chuyên đề ({exams?.totalCount})
                                        </span>
                                    }
                                    key="exams"
                                >
                                    {exams?.totalCount === 0 ? <EmptyExamsState /> : <RightContentChapterDetail />}
                                </TabPane>
                            </Tabs>
                        </Card>
                    </Col>

                    {/* Right Content - Document Viewer */}
                    <Col xs={24} lg={14}>
                        <Card style={{ borderRadius: "8px", height: "calc(100vh)" }}>
                            <div className="document-viewer">
                                {selectedMaterial ? (
                                    <div className="document-content">
                                        {selectedMaterial.loai_bai_giang === "video" ? (
                                            <video
                                                controls
                                                style={{ width: "100%", height: "100%", borderRadius: "8px" }}
                                            >
                                                <source src={config.API_URL + selectedMaterial.link_bai_giang} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : (
                                            <iframe
                                                src={config.API_URL + selectedMaterial.link_bai_giang}
                                                title={selectedMaterial.ten_bai_giang}
                                                style={{ width: "100%", height: "calc(100vh - 100px)", borderRadius: "8px" }}
                                                frameBorder="0"
                                            ></iframe>
                                        )}
                                        <div className="document-info">
                                            <Title level={4} style={{ marginBottom: "8px" }}>
                                                {selectedMaterial.ten_bai_giang}
                                            </Title>
                                            <Text type="secondary">
                                                {selectedMaterial.mo_ta || "Không có mô tả"}
                                            </Text>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-material-selected">
                                        <Title level={4} style={{ color: "#8c8c8c" }}>
                                            Vui lòng chọn một bài giảng hoặc đề thi để xem
                                        </Title>
                                        <Text type="secondary">
                                            Bấm vào một bài giảng trong danh sách bên trái để xem nội dung.
                                        </Text>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Modal form lesson */}
                <Modal
                    title={state.isEdit ? 'Cập nhật bài giảng' : "Tạo đề bài giảng"}
                    open={isLessonModalVisible}
                    onCancel={() => {
                        setState({ ...state, isEdit: false, idExam: '', fileImg: '', fileVid: '', fileExam: '' })
                        setIsLessonModalVisible(false)
                        lessonForm.resetFields()
                    }}
                    footer={[
                        <Button key="cancel" onClick={() => {
                            if (!spinning) {
                                setIsLessonModalVisible(false)
                                lessonForm.resetFields()
                                setState({ ...state, fileImg: '', fileVid: '', isEdit: false, idModule: ''})
                            } else {
                                notification.warning({message: 'Hệ thống đang xử lý. Xin vui lòng chờ đợi...'})
                            }
                        }}>
                            Hủy bỏ
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={() => {
                                lessonForm
                                .validateFields()
                                .then((values) => {
                                    handleLessonForm(values)
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
                    closable={false}
                    width={800}
                    className="add-modun-exam-modal"
                >
                    <Spin spinning={spinning} tip="Đang tải dữ liệu...">
                        <Form form={lessonForm} layout="vertical" style={{ marginTop: "16px" }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        className="input-col"
                                        label="Tên bài giảng"
                                        name="ten_bai_giang"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Tên bài giảng là bắt buộc",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Tên bài giảng"/>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        initialValue={"video"}
                                        className="input-col"
                                        label="Loại bài giảng"
                                        name="loai_bai_giang"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Loại bài giảng là bắt buộc',
                                            },
                                        ]}
                                    >
                                        <Select
                                            placeholder='Chọn loại bài giảng'
                                        >
                                            <Option value='pdf'>pdf</Option>
                                            <Option value='video'>video</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        className="input-col"
                                        label="Khung chương trình"
                                        name="khung_ct_id"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Khung chương trình là trường bắt buộc.',
                                            },
                                        ]}
                                        initialValue={thematic?.data?.kct_id}
                                    >
                                        {renderProgrammes()}
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item className="input-col" label="Khóa học" name="khoa_hoc_id" 
                                    initialValue={thematic?.data?.khoa_hoc_id}
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
                                        className="input-col"
                                        label="Chương học"
                                        name="mo_dun"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Chương học là bắt buộc',
                                            },
                                        ]}
                                        initialValue={thematic?.data?.mo_dun_id}
                                    >
                                        {renderModules()}
                                    </Form.Item>  
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        className="input-col"
                                        label="Chuyên đề"
                                        name="chuyen_de"
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Chuyên đề là bắt buộc',
                                            },
                                        ]}
                                        initialValue={thematic?.data?.chuyen_de_id}
                                    >
                                        {renderThematics()}
                                    </Form.Item> 
                                </Col>
                            </Row>

                            <Form.Item label="Mô tả bài giảng" name="mo_ta">
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Mô tả về bài giảng"
                                    maxLength={1000}
                                    showCount
                                    style={{ resize: "none" }}
                                />
                            </Form.Item>

                            <Form.Item className="input-col" label="Chọn pdf / video" name="bai_giang">
                                <Dragger {...propsVideo} maxCount={1}
                                    listType="picture"
                                    className="upload-list-inline"
                                >
                                    <p className="ant-upload-drag-icon">
                                        <UploadOutlined />
                                    </p>
                                    <p className="ant-upload-text bold">Click chọn file hoặc video bài giảng vào đây</p>
                                </Dragger>
                            </Form.Item> 
                            
                            <Form.Item className="button-col">
                                {(state.Uploading) && <Progress percent={progress}/>}
                            </Form.Item>

                        </Form>
                    </Spin>
                </Modal>
                
                {/* Delete Exam Confirmation Modal */}
                <Modal
                    title={null}
                    open={deleteModalVisible}
                    onCancel={() => {
                        setDeleteModalVisible(false);
                        setExamToDelete(null);
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
                                Xoá đề thi 
                            </Title>
                            <Paragraph style={{ fontSize: "16px", color: "#595959", marginBottom: "24px" }}>
                                Bạn có chắc chắn muốn xoá đề thi này?
                            </Paragraph>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Button
                                        block
                                        size="large"
                                        onClick={() => {
                                            setDeleteModalVisible(false);
                                            setExamToDelete(null);
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
                    open={isThematicExamModalVisible}
                    onCancel={() => {
                        setState({ ...state, isEdit: false, idExam: '', fileImg: '', fileVid: '', fileExam: '' })
                        setIsThematicExamModalVisible(false)
                        addThematicExamForm.resetFields()
                    }}
                    footer={null}
                    width={600}
                    destroyOnClose
                    className="add-modun-exam-modal"
                >
                    <Spin spinning={spinning} tip="Đang tải dữ liệu...">
                        <Form form={addThematicExamForm} layout="vertical" style={{ marginTop: "24px" }}>
                            <Form.Item label='Mã đề thi' name="de_thi_ma" rules={[{ required: true, message: 'Mã đề thi là bắt buộc'}]}>
                                <Input size="normal" placeholder="Mã đề thi" />
                            </Form.Item>
                            <Form.Item label='Tên đề thi' name="ten_de_thi" rules={[{ required: true, message: 'Tên đề thi là bắt buộc'}]}>
                                <Input size="normal" placeholder="Tên đề thi" />
                            </Form.Item>
                            <Form.Item label="Khung chương trình" name="kct_id" 
                                rules={[{ required: true, message: 'Loại đề thi là bắt buộc'}]}
                                initialValue={thematic?.data?.kct_id}
                            >
                                {renderProgrammes()}
                            </Form.Item>
                            <Form.Item
                                label="Khóa học"
                                name="khoa_hoc_id"
                                rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
                                initialValue={thematic?.data?.khoa_hoc_id}
                            >
                                {renderCourses()}
                            </Form.Item>
            
                            <Form.Item
                                label="Chương học"            
                                name="mo_dun_id"
                                rules={[{ required: true, message: "Vui lòng chọn Chương học" }]}
                                initialValue={thematic?.data?.mo_dun_id}
                            >
                                {renderModules()}
                            </Form.Item>
                            <Form.Item label="Chuyên đề" name="chuyen_de_id" 
                                rules={[{ required: true, message: 'Chuyên đề là bắt buộc' }]}
                                initialValue={thematic?.data?.chuyen_de_id}
                            >
                                {renderThematics()}
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
                                            setIsThematicExamModalVisible(false)
                                            addThematicExamForm.resetFields()
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

                <ViewExam exam={exam?.data} isExamViewModalVisible={isExamViewModalVisible} setIsExamViewModalVisible={setIsExamViewModalVisible}
                    handlePublishExam={handlePublishExam} 
                />

                {/* Modal add criteria */}
                <ModalCriteria thematic={true} isModalVisible={isModalCriteriaVisible} handleCancel={handleCancelCriteriaModal}
                    initCourse={thematic?.data?.khoa_hoc_id} initModule={thematic?.data?.mo_dun_id} 
                />

            </div>
        </Spin>
    )
}

export default ModunDetail
