import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import config from '../../../../configs/index';
import defaultImage from 'assets/img/default.jpg';
import moment from 'moment';
import axios from 'axios';
// antd
import { Button, Table, Avatar, Modal, Form, Upload, List, Skeleton,
    message, notification, Spin, Pagination, Tag, Space, 
    Select} from 'antd';
import { UploadOutlined, ExclamationCircleOutlined, DownloadOutlined, PlusCircleOutlined, } from '@ant-design/icons';

// component
import AppFilter from 'components/common/AppFilter';
import adope from 'assets/img/exam/adope.gif';
import docIcon from 'assets/img/exam/doc-icon.png';

// redux
import { useSelector, useDispatch } from "react-redux";
import * as courseAction from '../../../../redux/actions/course';
import * as programmeAction from '../../../../redux/actions/programme';
import * as setExamAction from '../../../../redux/actions/setExam';
import * as userAction from '../../../../redux/actions/user';

const { Dragger } = Upload;
const { Option } = Select;

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
        idFile: ''
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalDetailVisible, setIsModalDetailVisible] = useState(false);
    const [isModalAddUserToSetExam, setIsModalAddUserToSetExam] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const [pageIndex, setPageIndex] = useState(1);

    const programmes = useSelector(state => state.programme.list.result);
    const students = useSelector(state => state.user.listUser.result);

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
          render: (khoa_hoc_id) => (
            <Space size="middle">
                <Button  type="button" className="ant-btn ant-btn-round ant-btn-primary"
                    onClick={() => {
                        dispatch(setExamAction.getSetExam({ id: khoa_hoc_id }, (res) => {
                            if (res.status === 'success' && res.data) {
                                setListFile(res.data.khoa_hoc_tep_tins
                                    .map((file, index) => {
                                        return {...file, 'key': index};
                                    }));
                                setIsModalDetailVisible(true);
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
                <Button shape="round" type="primary" onClick={() => {
                    setIsModalVisible(true);
                    setState({ ...state, idCourse: khoa_hoc_id });
                }}>
                    Upload đề
                </Button> 
                <Button shape="round" type="danger" onClick={() => deleteSetExam(khoa_hoc_id)}>Xóa</Button>
            </Space>
          ),
        },
    ];

    const propsFile = {
        name: 'file',
        action: '#',

        beforeUpload: file => {
            // check loại file => chỉ cho upload file word
            const isDocx = file.type === 'application/msword' || 
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
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
        dispatch(userAction.getStudents({ search: '', startDay: '', 
            endDay: '', status: 1, pageIndex: 1, 
            pageSize: 999999999, province: '' }));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
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
    }, [pageIndex]); // eslint-disable-line react-hooks/exhaustive-deps


    useEffect(() => {
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

    const addUserToSetExam = (values) => {
        setSpinning(true);
        const formData = {
            "khtt_id": state.idFile,
            "hoc_vien_id": values.hoc_vien_id,
            "khoa_hoc_id": state.idCourse
        }
        dispatch(setExamAction.AddUserToSetExam({ formData }, (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                setSpinning(false);
                notification.success({
                    message: 'Thành công',
                    description: 'Thêm học viên vào bộ đề thi thành công',
                })
                setIsModalAddUserToSetExam(false);
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: 'Thêm học viên vào bộ đề thi thất bại',
                })
                setSpinning(false);
            }
        }));
    }

    // modal thêm người dùng vào đề thi
    const renderModalAddUserToSetExam = () => {
        let options = [];
        options = students?.data?.map((item, index) => (
            <Option key={item.hoc_vien_id} value={item.hoc_vien_id} >{item.ho_ten}</Option>
        ));

        return (
            <Spin spinning={spinning} tip="Đang thêm học viên vào bộ đề thi">
                <h2 className="form-title">Thêm học viên vào bộ đề thi</h2>
                <Form form={form} onFinish={addUserToSetExam}
                    className="login-form app-form" name="login-form" 
                >
                    <Form.Item className="input-col" label="Người dùng" name="hoc_vien_id" 
                        rules={[{ required: true, message: 'Vui lòng chọn người dùng' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn người dùng"
                            optionFilterProp="children"
                            filterOption={(input, option) => option?.children?.toLowerCase().includes(input?.toLowerCase())}
                            style={{ width: '100%' }}
                            className="select-col"
                        >
                            {options}
                        </Select>
                    </Form.Item>
                    <Form.Item className="button-col" style={{marginBottom: 0}}>
                        <Button shape="round" type="primary" htmlType="submit" >Xác nhận</Button>
                    </Form.Item>
                </Form>
          </Spin>
        )
    }

    // xoá file đề thi
    const deleteFileSetExam = (id, khoahoc_id) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn xóa file đề thi này?',
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk() {
                const callback = (res) => {
                    if (res.statusText === 'OK' && res.status === 200) {
                        dispatch(setExamAction.getSetExam({ id: khoahoc_id }, (res) => {
                            if (res.status === 'success' && res.data) {
                                setListFile(res.data.khoa_hoc_tep_tins
                                    .map((file, index) => {
                                        return {...file, 'key': index};
                                    }));
                            }
                        }));
                        notification.success({
                            message: 'Thành công',
                            description: 'Xóa file đề thi thành công',
                        })
                    } else {
                        notification.error({
                            message: 'Thông báo',
                            description: 'Xóa file đề thi thất bại',
                        })
                    };
                }
                dispatch(setExamAction.DeleteFileSetExam({ id: id}, callback));
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

    return (
        <div className='content'>
            <Helmet>
                <title>Quản lý bộ đề thi</title>
            </Helmet>
            <AppFilter
                title="Danh sách bộ đề thi"
                isShowProgramme={true}
                isShowCourse={false}
                isShowModule={false}
                isShowThematic={false}
                isShowStatus={true}
                isShowSearchBox={true}
                isShowDatePicker={false}
                isRangeDatePicker={false}
                programmes={programmes?.data?.filter(item => item.loai_kct === 6)}
                onFilterChange={(field, value) => onFilterChange(field, value)}
            />
            <br/>
            <Table className="table-striped-rows" columns={columns} dataSource={data} pagination={false}/>
            <br/>
            <Pagination current={pageIndex} onChange={onChange} total={data?.length}/>
            <br/>
            <Modal visible={isModalVisible} mask={true} centered={true} className="cra-exam-modal" wrapClassName="cra-exam-modal-container"                                   
                onOk={() => setIsModalVisible(false)} 
                onCancel={() => setIsModalVisible(false)}
                maskStyle={{ background: 'rgba(0, 0, 0, 0.8)' }}
                maskClosable={false}
                footer={null}
            >
                {renderModalUploadFile()}
            </Modal>
            <Modal
                title={<b>Danh sách đề thi</b>}
                open={isModalDetailVisible}
                onCancel={() => setIsModalDetailVisible(false)}
                footer={null}
                width={800}
            >
                <List
                    bordered
                    dataSource={listFile}
                    renderItem={(file, index) => (
                        <List.Item
                            actions={[
                                <Button key={'button1' + index} 
                                    shape="round" type="danger" 
                                    onClick={() => deleteFileSetExam(file.khtt_id, file.khoa_hoc_id)} 
                                >
                                    Xóa
                                </Button> , 
                                <Button key={'button2' + index} shape="round" type="primary" onClick={() => downloadFileExam(file)}>
                                    <DownloadOutlined />
                                </Button>,
                                <Button key={'button1' + index} 
                                    shape="round" type="primary"
                                    onClick={() => {
                                        setIsModalAddUserToSetExam(true);
                                        setState({ ...state, idFile: file.khtt_id, idCourse: file.khoa_hoc_id });
                                    }} 
                                >
                                    <PlusCircleOutlined />
                                </Button>
                            ]}
                        >
                            <Skeleton avatar loading={false} title={false} active>
                                <List.Item.Meta style={{marginTop: 4}}
                                    avatar={<Avatar src={file.tep_tin.ten.includes('pdf') ? adope : docIcon} />}
                                    title={<a target="_blank" rel="noopener noreferrer" 
                                        style={{fontWeight: 600, fontSize: 16}}
                                        href={config.API_URL + file.tep_tin.duong_dan} 
                                    >
                                        {file.tep_tin.ten}
                                    </a>}
                                />
                            </Skeleton>
                        </List.Item>
                    )}
                />
            </Modal>
            <Modal visible={isModalAddUserToSetExam} mask={true} centered={true} className="cra-exam-modal" wrapClassName="cra-exam-modal-container"                                   
                onOk={() => setIsModalAddUserToSetExam(false)} 
                onCancel={() => setIsModalAddUserToSetExam(false)}
                maskStyle={{ background: 'rgba(0, 0, 0, 0.8)' }}
                maskClosable={false}
                footer={null}
            >
                {renderModalAddUserToSetExam()}
            </Modal>
        </div>
    )
}

export default ExamSetPage;