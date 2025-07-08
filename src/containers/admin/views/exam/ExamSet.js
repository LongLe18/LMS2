import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import config from '../../../../configs/index';
import defaultImage from 'assets/img/default.jpg';
import moment from 'moment';
import axios from 'axios';
// antd
import { Button, Table, Avatar, Modal, Form, Upload,
    message, notification, Spin, Pagination, Tag, Space, Tabs, Tooltip} from 'antd';
import { UploadOutlined, ExclamationCircleOutlined, DownloadOutlined, PlusCircleOutlined, UserOutlined, } from '@ant-design/icons';

// component
import AppFilter from 'components/common/AppFilter';

// redux
import { useSelector, useDispatch } from "react-redux";
import * as courseAction from '../../../../redux/actions/course';
import * as programmeAction from '../../../../redux/actions/programme';
import * as setExamAction from '../../../../redux/actions/setExam';
import * as userAction from '../../../../redux/actions/user';

const { Dragger } = Upload;
const { TabPane } = Tabs;

const ExamSetPage = () => {
    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const [listFile, setListFile] = useState([]);
    const [form] = Form.useForm();

    const [filter, setFilter] = useState({
        trang_thai: '',
        search: '',
        kct_id: ''
    });
    const [state, setState] = useState({
        fileImg: '',
        idCourse: '',
        idFile: '',
        activeTab: '1',
        course: ''
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [students, setStudents] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const programmes = useSelector(state => state.programme.list.result);
    const studentsOfSetExam = useSelector(state => state.setExam.listUser.result);

    const mergeListFile = (data) => {
        const result = [];

        // B1: Tạo map các object theo tep_tin_id
        const mapById = {};
            data.forEach(item => {
            mapById[item.tep_tin.tep_tin_id] = item;
        });

        // B2: Duyệt tất cả, tìm các file .rar (cha)
        data.forEach(item => {
            const fileName = item.tep_tin.ten;
            if (fileName.endsWith('.rar')) {
                const group = {
                    ten: fileName,
                    rar: item,
                    children: []
                };

                // Tìm tất cả file có tep_tin_cha_id = id của .rar
                data.forEach(child => {
                    if (child.tep_tin_cha_id === item.tep_tin.tep_tin_id) {
                        group.children.push(child);
                    }
                });

                result.push(group);
            }
        });
        return result;
    }

    const columns = [
        {
            title: 'Ảnh đại diện',
            dataIndex: 'anh_dai_dien',
            key: 'anh_dai_dien',
            responsive: ['lg'],
            render: (src) => (
                <Avatar src={src !== null ? config.API_URL + src : defaultImage} size={50} shape='circle' />
            )
        },
        {
            title: 'Tên bộ đề thi',
            dataIndex: 'ten_khoa_hoc',
            key: 'ten_khoa_hoc',
            responsive: ['md'],
        },
        {
            title: 'Khung chương trình',
            dataIndex: 'ten_khung_ct',
            key: 'ten_khung_ct',
            responsive: ['md'],
            render: (ten_khung_ct, khoa_hoc) => (
                khoa_hoc?.khung_chuong_trinh?.ten_khung_ct
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            responsive: ['md'],
            render: (trang_thai) => (
                <Tag color={trang_thai === true ? 'green' : 'red'} key={trang_thai}>
                    {trang_thai === true ? "Đang hoạt động" : "Đã dừng"}
                </Tag>
            ),
        },
        {
          title: 'Ngày bắt đầu',
          dataIndex: 'ngay_bat_dau',
          key: 'ngay_bat_dau',
          responsive: ['md'],
          render: (date) => (
            moment(date).utc(7).format(config.DATE_FORMAT_SHORT)
          )
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'ngay_ket_thuc',
            key: 'ngay_ket_thuc',
            responsive: ['md'],
            render: (date) => (
              moment(date).utc(7).format(config.DATE_FORMAT_SHORT)
            )
        },
        {
            title: 'Tùy chọn',
            key: 'khoa_hoc_id',
            dataIndex: 'khoa_hoc_id',
            // Redirect view for edit
            render: (khoa_hoc_id, record) => (
                <Space size="middle">
                    <Button  type="button" className="ant-btn ant-btn-round ant-btn-primary"
                        onClick={() => {
                            dispatch(setExamAction.getSetExam({ id: khoa_hoc_id }, (res) => {
                                if (res.status === 'success' && res.data) {
                                    setListFile(mergeListFile(res.data.khoa_hoc_tep_tins));
                                    setState({ ...state, activeTab: '2', course: record?.ten_khoa_hoc, idCourse: khoa_hoc_id });
                                } else {
                                    notification.warning({
                                        message: 'Thông báo',
                                        description: 'Bộ đề này chưa có file đề thi nào, xin hãy Upload đề thi', 
                                    })
                                }
                            }));
                        }}
                    >
                        Chi tiết
                    </Button>
                    <Tooltip title="Upload bộ đề thi">
                        <Button shape="round" type="primary" onClick={() => {
                            setIsModalVisible(true);
                            setState({ ...state, idCourse: khoa_hoc_id });
                        }}>
                            <UploadOutlined />
                        </Button> 
                    </Tooltip>
                    <Button shape="round" type="danger" onClick={() => deleteSetExam(khoa_hoc_id)}>Xóa</Button>
                </Space>
            ),
        },
    ];

    const columnsTab2 = [
        {
            title: 'STT',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Tên bộ đề',
            dataIndex: 'ten',
            key: 'ten',
            responsive: ['md'],
        },
        {
            title: 'File xem trước',
            dataIndex: 'tep_tin',
            key: 'tep_tin',
            responsive: ['md'],
            render: (tep_tin, record) => (
                <a target="_blank" rel="noopener noreferrer" 
                    style={{fontWeight: 600, fontSize: 16}}
                    href={config.API_URL + record?.children[0].tep_tin?.duong_dan} 
                >
                    {record?.children[0]?.tep_tin?.ten}
                </a>
            )
        },
        {
            title: 'Tùy chọn',
            key: 'khoa_hoc_id',
            dataIndex: 'khoa_hoc_id',
            // Redirect view for edit
            render: (khoa_hoc_id, record) => (
                <Space size="middle">
                    <Tooltip key={'tooltip2'} title="Thêm học viên vào bộ đề thi">
                        <Button key={'button1'} 
                            shape="round" type="primary"
                            onClick={() => {
                                setState({ ...state, idFile: record?.rar?.khtt_id, idCourse: record?.rar?.khoa_hoc_id, activeTab: '4',
                                    course: state.course + ` / ${record?.ten}`
                                 });
                            }} 
                        >
                            <PlusCircleOutlined />
                        </Button>
                    </Tooltip>
                    <Tooltip key={'tooltip1'} title="Danh sách học viên trong bộ đề">
                        <Button key={'button2'} shape="round" type="primary" 
                            onClick={() => {
                                setState({ ...state, idFile: record?.rar?.khtt_id, activeTab: '3', course: state.course + ` / ${record?.ten}` });
                                setPageIndex(1);
                                setPageSize(100);
                                dispatch(setExamAction.getUserOfSetExam({ id: record?.rar?.khtt_id, pageSize: pageSize, pageIndex: pageIndex, search: filter.search }, ))
                            }}
                        >
                            <UserOutlined />
                        </Button>
                    </Tooltip>
                    <Tooltip key={'tooltip2'} title="Tải xuống file đề thi">
                        <Button key={'button2'} shape="round" type="primary" onClick={() => downloadFileExam(record?.rar)}>
                            <DownloadOutlined />
                        </Button>
                    </Tooltip>
                    <Button key={'button1' } 
                        shape="round" type="danger" 
                        onClick={() => deleteFileSetExam(record?.rar?.khtt_id, record?.rar?.khoa_hoc_id, record?.children[0]?.khtt_id)} 
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ]

    const columns3 = [
        {
            title: 'STT',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Tên học viên',
            dataIndex: 'ho_ten',
            key: 'ho_ten',
            responsive: ['md'],
        },
        {
            title: 'Giới tính',
            dataIndex: 'gioi_tinh',
            key: 'gioi_tinh',
            responsive: ['md'],
        },
        {
            title: 'email',
            dataIndex: 'email',
            key: 'email',
            responsive: ['md'],
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'sdt',
            key: 'sdt',
            responsive: ['md'],
        },
        {
            title: 'Tỉnh / Thành phố',
            dataIndex: 'tinh',
            key: 'tinh',
            responsive: ['md'],
            render: (hoc_vien, record) => record?.tinh_thanhpho?.ten
        },
        {
            title: 'Tùy chọn',
            key: 'hoc_vien_id',
            dataIndex: 'hoc_vien_id',
            // Redirect view for edit
            render: (hoc_vien_id) => (
                <Space size="middle">
                    {state.activeTab === '4' ?
                        <Button shape="round" type="primary" 
                            onClick={() => addUserToSetExam(hoc_vien_id)}
                        >
                            Thêm học viên
                        </Button>
                    :
                        <Button danger shape="round" type="primary" 
                            onClick={() => removeStudentSetExam(hoc_vien_id)}
                        >
                            Xóa
                        </Button>
                    }
                </Space>
            ),
        },
    ]

    const propsFile = {
        name: 'file',
        action: '#',

        beforeUpload: file => {
            // check loại file => chỉ cho upload file word
            const isDocx = 
                // file.type === 'application/msword' || 
                // file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.type === 'application/pdf' ||
                file.type === 'application/zip' || file.type === '' ||
                file.type === 'application/x-zip-compressed' || file.type === 'application/x-rar-compressed';
            if (!isDocx) {
                message.error(`${file.name} có định dạng không được hỗ trợ (pdf, word, zip)`);
                return false;
            }
            // check dung lượng file trên 5mb => không cho upload
            if (file.size > 5242880) {
                message.error(`${file.name} dung lượng file quá lớn`);
                return false;
            }
                return isDocx || Upload.LIST_IGNORE;
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

    useEffect(() => {
        dispatch(programmeAction.getProgrammes({ status: '' }));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    useEffect(() => {
        if (state.activeTab === '1') {
            dispatch(courseAction.getCourses({ idkct: '', status: '', search: filter.search, 
                start: filter.start, end: filter.end, pageIndex: pageIndex, pageSize: 999999999}, (res) => {
                    if (res.status === 'success') {
                        res.data = (res.data
                            .filter(item => item.khung_chuong_trinh.loai_kct === 6)
                            .map((module, index) => {
                            return {...module, 'key': index};
                        }));
                        setData([...res.data]);
                    }
            }));
        } else if (state.activeTab === '4') {
            dispatch(userAction.getStudents({ search: filter.search, startDay: '', 
                endDay: '', status: 1, pageIndex: 1, pageSize: 999999999999, province: '' }, (res) => {
                    if (res.data && res.status === 'success') {
                        dispatch(setExamAction.getUserOfSetExam({ id: state.idFile, pageSize: pageSize, pageIndex: pageIndex, search: filter.search }, (res2) => {
                            if (res2.data && res2.status === 'success') {
                                const B_ids = res2?.data?.map(hv => hv.hoc_vien_id); // tạo mảng ID từ B
                                setStudents(res?.data.filter(item => !B_ids.includes(item.hoc_vien_id)).map((student) => {
                                    return {...student, 'vai_tro': 'học viên', 'key': student.hoc_vien_id };
                                }))
                            }
                        }));
                    }
                }));
        } else if (state.activeTab === '3') {
            dispatch(setExamAction.getUserOfSetExam({ id: state.idFile, pageSize: pageSize, pageIndex: pageIndex, search: filter.search }));
        }
    }, [pageIndex, pageSize, state.activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (state.activeTab === '1') {
            dispatch(courseAction.getCourses({ idkct: '', status: filter.trang_thai, search: filter.search, 
                start: filter.start, end: filter.end, pageIndex: pageIndex, pageSize: 999999999}, (res) => {
                    if (res.status === 'success') {
                        res.data = (res.data
                            .filter(item => item.khung_chuong_trinh.loai_kct === 6)
                            .map((module, index) => {
                            return {...module, 'key': index};
                        }));
                        setData([...res.data]);
                    }
            }));
        } else if (state.activeTab === '4') {
            dispatch(userAction.getStudents({ search: filter.search, startDay: '', 
                endDay: '', status: 1, pageIndex: 1, pageSize: 999999999999, province: '' }, (res) => {
                    if (res.data && res.status === 'success') {
                        dispatch(setExamAction.getUserOfSetExam({ id: state.idFile, pageSize: pageSize, pageIndex: pageIndex, search: filter.search }, (res2) => {
                            if (res2.data && res2.status === 'success') {
                                const B_ids = res2?.data?.map(hv => hv.hoc_vien_id); // tạo mảng ID từ B
                                setStudents(res?.data.filter(item => !B_ids.includes(item.hoc_vien_id)).map((student) => {
                                    return {...student, 'vai_tro': 'học viên', 'key': student.hoc_vien_id };
                                }))
                            }
                        }));
                    }
                }));
        } else if (state.activeTab === '3') {
            dispatch(setExamAction.getUserOfSetExam({ id: state.idFile, pageSize: pageSize, pageIndex: pageIndex, search: filter.search }));
        }
    }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps
    
    const onFilterChange = (field, value) => {
        if (field === 'ngay') {
            setFilter((state) => ({ ...state, start: value[0] }));  
            setFilter((state) => ({ ...state, end: value[1] }));  
        }
        else {
            setFilter((state) => ({ ...state, [field]: value }));  
        }
    };

    const onSelectChange = (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };

    // event thay đổi trang
    const onChange = (page) => {
        setPageIndex(page);
    };
    
    const UploadExam = async (values) => {
        if (state.fileImg === '' || state.fileImg === undefined 
            || state.fileImg === null || values.file_de_thi === undefined 
            || values.file_de_thi.fileList.length === 0) {
            notification.warning({
                message: 'Thông báo',
                description: 'Bạn chưa upload file',
            })
            return;
        }
        const formData = new FormData();
        values.file_de_thi.fileList.map((file => 
            file.originFileObj.name.includes('zip') || file.originFileObj.name.includes('rar') ? 
            formData.append('files', file.originFileObj) : 
            formData.append('file_review', file.originFileObj)
        ))
        
        setSpinning(true);
        await axios.post(
            config.API_URL + `/course/${state.idCourse}/upload-file-exam`,
            formData, 
            {
                timeout: 1800000,
                headers: { "content-type": "multipart/form-data", 
                    Authorization: `Bearer ${localStorage.getItem('userToken')}`, 
                    Accept: '*/*',
                },
            }
        ).then(
            res => {
                if (res.statusText === 'OK' && res.status === 200 && res.data.status === 'success') {
                    form.resetFields();
                    
                    notification.success({
                        message: 'Thành công',
                        description: 'Thêm đề thi mới thành công',
                    });
                    setIsModalVisible(false);
                    setSpinning(false);
                } else {
                    notification.error({
                        message: 'Thêm đề thi mới thất bại.',
                        description: `Lỗi ${res?.data?.detail}.Xin vui lòng kiểm tra đề`,
                    })
                    setSpinning(false);
                }
            }
        )
        .catch(error => {
            notification.error({ message: error.message });
            setSpinning(false);
        });
    }

    const renderModalUploadFile = () => {
        return (
            <Spin spinning={spinning} tip="Đang upload đề thi. Quá trình này sẽ mất thời gian, bạn xin vui lòng chờ">
                <h2 className="form-title">Upload đề thi</h2>
                <Form form={form} onFinish={UploadExam}
                    className="login-form app-form" name="login-form" 
                >
                    
                    <Form.Item className="input-col" label="File đề thi" name="file_de_thi" rules={[]}>
                        <Dragger {...propsFile} maxCount={3}
                            listType="picture"
                            className="upload-list-inline"
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text bold">Click hoặc kéo thả đề thi vào đây</p>
                        </Dragger>
                    </Form.Item>
                    <div style={{color: 'red', fontWeight: 700, marginBottom: 8}}>Lưu ý: File xem trước và file nén bộ đề phải cùng tên</div>
                    <Form.Item className="button-col" style={{marginBottom: 0}}>
                        <Button shape="round" type="primary" htmlType="submit" >Upload đề thi</Button>
                    </Form.Item>
                </Form>
          </Spin>
        )
    };

    const addUserToSetExam = (hoc_vien_id) => {
        setSpinning(true);
        const formData = {
            "khtt_id": state.idFile,
            "hoc_vien_ids": [hoc_vien_id],
            "khoa_hoc_id": state.idCourse
        }
        dispatch(setExamAction.AddUserToSetExam({ formData }, (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                setSpinning(false);
                dispatch(userAction.getStudents({ search: filter.search, startDay: '', 
                endDay: '', status: 1, pageIndex: 1, pageSize: 999999999999, province: '' }, (res) => {
                    if (res.data && res.status === 'success') {
                        dispatch(setExamAction.getUserOfSetExam({ id: state.idFile, pageSize: pageSize, pageIndex: pageIndex, search: filter.search }, (res2) => {
                            if (res2.data && res2.status === 'success') {
                                const B_ids = res2?.data?.map(hv => hv.hoc_vien_id); // tạo mảng ID từ B
                                setStudents(res?.data.filter(item => !B_ids.includes(item.hoc_vien_id)).map((student) => {
                                    return {...student, 'vai_tro': 'học viên', 'key': student.hoc_vien_id };
                                }))
                                notification.success({
                                    message: 'Thành công',
                                    description: 'Thêm học viên vào bộ đề thi thành công',
                                })
                            }
                        }));
                    }
                }));
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: 'Thêm học viên vào bộ đề thi thất bại',
                })
                setSpinning(false);
            }
        }));
    }

    // Thêm danh sách học viên vào bộ đề thi
    const addListUserToSetExam = () => {
        setSpinning(true);
        const formData = {
            "khtt_id": state.idFile,
            "hoc_vien_ids": selectedRowKeys,
            "khoa_hoc_id": state.idCourse
        }
        dispatch(setExamAction.AddUserToSetExam({ formData }, (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                setSpinning(false);
                dispatch(userAction.getStudents({ search: filter.search, startDay: '', 
                endDay: '', status: 1, pageIndex: 1, pageSize: 999999999999, province: '' }, (res) => {
                    if (res.data && res.status === 'success') {
                        dispatch(setExamAction.getUserOfSetExam({ id: state.idFile, pageSize: pageSize, pageIndex: pageIndex, search: filter.search }, (res2) => {
                            if (res2.data && res2.status === 'success') {
                                const B_ids = res2?.data?.map(hv => hv.hoc_vien_id); // tạo mảng ID từ B
                                setStudents(res?.data.filter(item => !B_ids.includes(item.hoc_vien_id)).map((student) => {
                                    return {...student, 'vai_tro': 'học viên', 'key': student.hoc_vien_id };
                                }))
                                notification.success({
                                    message: 'Thành công',
                                    description: 'Thêm học viên vào bộ đề thi thành công',
                                })
                            }
                        }));
                    }
                }));
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: 'Thêm học viên vào bộ đề thi thất bại',
                })
                setSpinning(false);
            }
        }));
    }
    
    // xoá file đề thi
    const deleteFileSetExam = (id_rar, khoahoc_id, id_doc) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn xóa file đề thi này?',
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk() {
                const callback = (res) => {
                    if (res.statusText === 'OK' && res.status === 200) {
                        dispatch(setExamAction.DeleteFileSetExam({ id: id_rar}, (res) => {
                            if (res.statusText === 'OK' && res.status === 200) {
                                dispatch(setExamAction.getSetExam({ id: khoahoc_id }, (res) => {
                                    if (res.status === 'success' && res.data) {
                                        setListFile(mergeListFile(res.data.khoa_hoc_tep_tins));
                                        notification.success({
                                            message: 'Thành công',
                                            description: 'Xóa file đề thi thành công',
                                        })
                                    }
                                    else {
                                        notification.error({
                                            message: 'Thông báo',
                                            description: 'Xóa file đề thi thất bại',
                                        })
                                    };
                                }));
                            } else {
                                notification.warning({
                                    message: 'Thông báo',
                                    description: 'File đề thi này không tồn tại hoặc đã bị xóa',
                                })
                            }
                        }));
                    } else {
                        notification.error({
                            message: 'Thông báo',
                            description: 'Xóa file đề thi thất bại',
                        })
                    };
                }
                dispatch(setExamAction.DeleteFileSetExam({ id: id_doc}, callback));
            },
        });
    };

    // download File
    const downloadFileExam = async (file) => {
        try {
            const link = document.createElement("a");
            link.href = config.API_URL + file.tep_tin.duong_dan;
            link.download = file.tep_tin.ten;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download error:', error);
        }
    }

    // xoá bộ đề thi
    const deleteSetExam = (id) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn xóa bộ đề thi này?',
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk() {
                dispatch(setExamAction.DeleteSetExam({ id: id }, (res) => {
                    if (res.statusText === 'OK' && res.status === 200) {
                        dispatch(courseAction.getCourses({ idkct: '', status: filter.trang_thai, search: filter.search, 
                            start: filter.start, end: filter.end, pageIndex: pageIndex, pageSize: 999999999}, (res) => {
                                if (res.status === 'success') {
                                    res.data = (res.data
                                        .filter(item => item.khung_chuong_trinh.loai_kct === 6)
                                        .map((module, index) => {
                                        return {...module, 'key': index};
                                    }));
                                    setData([...res.data]);
                                }
                        }));
                        notification.success({
                            message: 'Thành công',
                            description: 'Xóa bộ đề thi thành công',
                        })
                    } else {
                        notification.error({
                            message: 'Thông báo',
                            description: 'Xóa bộ đề thi thất bại',
                        })
                    };
                }));
            },
        });
    }

    const onChangeTab = (value) => {
        setPageIndex(1);
        if (value === '1') {
            setState({...state, activeTab: value, idFile: '', course: ''});
        } else setState({...state, activeTab: value});
        setFilter({ ...filter,
            search: '',
            trang_thai: '',
            kct_id: '',
        })
    };

    const onShowSizeChange = (current, pageSize) => {
        setPageSize(pageSize);
    };

    const removeStudentSetExam = (hoc_vien_id) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn xóa học viên này khỏi bộ đề thi?',
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk() {
                setSpinning(true);
                dispatch(setExamAction.removeUserSetExam({ id: state.idFile, userId: hoc_vien_id }, (res) => {
                    if (res.status === 'success') {
                        setSpinning(false);
                        notification.success({
                            message: 'Thành công',
                            description: 'Xóa học viên khỏi bộ đề thi thành công',
                        });
                        dispatch(setExamAction.getUserOfSetExam({ id: state.idFile, pageSize: pageSize, pageIndex: pageIndex, search: filter.search }));
                    } else {
                        notification.error({
                            message: 'Thông báo',
                            description: 'Xóa học viên khỏi bộ đề thi thất bại',
                        });
                        setSpinning(false);
                    }
                }));
            },
        });
    };

    const paginate = (data, pageIndex, pageSize) => {
        const start = (pageIndex - 1) * pageSize;
        const end = start + pageSize;
        return data?.slice(start, end);
    }

    return (
        <div className='content'>
            <Helmet>
                <title>Quản lý bộ đề thi</title>
            </Helmet>
            <AppFilter
                title="Danh sách bộ đề thi"
                isShowProgramme={state.activeTab === '1' ? true : false}
                isShowCourse={false}
                isShowModule={false}
                isShowThematic={false}
                isShowStatus={state.activeTab === '1' ? true : false}
                isShowSearchBox={true}
                isShowDatePicker={false}
                isRangeDatePicker={false}
                programmes={programmes?.data?.filter(item => item.loai_kct === 6)}
                onFilterChange={(field, value) => onFilterChange(field, value)}
            />
            <br/>
            <Tabs defaultActiveKey={state.activeTab} activeKey={state.activeTab} onChange={onChangeTab}>
                <TabPane tab="Quản lý khóa học - học viên" key="1">
                    <Table className="table-striped-rows" columns={columns} dataSource={data} pagination={false}/>
                    <br/>
                    <Pagination current={pageIndex} pageSize={10} onChange={onChange} total={data?.length}/>
                </TabPane>
                <TabPane tab="Danh sách bộ đề" disabled key="2">
                    <h5>{state.course}</h5>
                    <br/>
                    <Table className="table-striped-rows" columns={columnsTab2} dataSource={listFile} pagination={false} />
                </TabPane>
                <TabPane tab="Danh sách học viên" disabled key="3">
                    <Spin spinning={spinning} tip="Đang lấy dữ liệu">
                        <Table className="table-striped-rows" columns={columns3} dataSource={studentsOfSetExam?.data} pagination={false} />
                        <br/>
                        <Pagination current={pageIndex} pageSize={pageSize} onChange={onChange} total={studentsOfSetExam?.totalCount} onShowSizeChange={onShowSizeChange} />
                    </Spin>
                </TabPane>
                <TabPane tab="Thêm học viên" disabled key="4">
                    <h5>{state.course}</h5>
                    <br/>
                    <Button type="primary" shape="round" className="mb-3"
                        onClick={() => {    
                            addListUserToSetExam()
                        }}                    
                    >
                        Thêm học viên
                    </Button>
                    <Table className="table-striped-rows" columns={columns3} 
                        dataSource={paginate(students, pageIndex, pageSize)} pagination={false} 
                        rowSelection={rowSelection}
                    />
                    <br/>
                    <Pagination current={pageIndex} onChange={onChange} total={students?.length} defaultPageSize={pageSize} onShowSizeChange={onShowSizeChange}
                        showSizeChanger 
                        pageSizeOptions={['10', '20', '50', '100']}
                    />
                </TabPane>
            </Tabs>


            <Modal visible={isModalVisible} mask={true} centered={true} className="cra-exam-modal" wrapClassName="cra-exam-modal-container"                                   
                onOk={() => setIsModalVisible(false)} 
                onCancel={() => setIsModalVisible(false)}
                maskStyle={{ background: 'rgba(0, 0, 0, 0.8)' }}
                maskClosable={false}
                footer={null}
            >
                {renderModalUploadFile()}
            </Modal>
        </div>
    )
}

export default ExamSetPage;