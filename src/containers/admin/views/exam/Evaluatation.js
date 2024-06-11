import React, { useEffect, useState } from 'react';
import LoadingCustom from 'components/parts/loading/Loading';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import config from '../../../../configs/index';

import { Row, Col, Table, Pagination, Space, Button, notification, Form, Modal, Select, InputNumber, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// redux
import * as evaluationAction from '../../../../redux/actions/evaluate';
import * as examActions from '../../../../redux/actions/exam';
import { useSelector, useDispatch } from "react-redux"; 

const { Option } = Select;
const { TextArea } = Input;

const EvaluationPage = () => {
    const dataEvaluations = [];
    const [formEvaluation] = Form.useForm();

    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [idExam, setIdExam] = useState('');
    const [idEvaluation, setIdEvaluation] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const dispatch = useDispatch();

    const evaluations = useSelector(state => state.evaluate.list.result);
    const exams = useSelector(state => state.exam.list.result);
    const loadingExams = useSelector(state => state.exam.list.loading);
    const loading = useSelector(state => state.evaluate.list.loading);

    useEffect(() => {
        dispatch(evaluationAction.getEVALUATEs({ id: idExam, pageIndex: pageIndex, pageSize: pageSize}));
    }, [pageIndex, pageSize, idExam]); // eslint-disable-line react-hooks/exhaustive-deps

    // lấy dữ liệu danh sách đề thi
    useEffect(() => {
        dispatch(examActions.filterExam({ idCourse: '', idModule: '', idThematic: '', status: '', search: '', 
            start: '', end: '', idType: 4, publish: 1 }));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (evaluations.status === 'success' ) {    
        evaluations.data.map((item, index) => dataEvaluations.push({...item, 'key': index}));
    };

    // event show modal
    const showModal = () => {
        setIsModalVisible(true);
    };

    // event destroy modal
    const handleCancel = () => {
        setIdEvaluation('');
        setIsModalVisible(false);
    };
    
    // event submit form add / edit
    const submitForm = (values) => {
        const callback = (res) => {
            if (res.status === 200 && res.statusText === 'OK') {
                formEvaluation.resetFields();
                dispatch(evaluationAction.getEVALUATEs({ id: idExam, pageIndex: pageIndex, pageSize: pageSize}));
                if (idEvaluation === '') {
                    notification.success({
                        message: 'Thành công',
                        description: 'Thêm đánh giá mới thành công',
                    })
                } else {
                    notification.success({
                        message: 'Thành công',
                        description: 'Sửa thông tin đánh giá thành công',
                    })
                }
                setIsModalVisible(false);
                setIdEvaluation('');
            } else {
                if (idEvaluation === '') {
                    notification.error({
                        message: 'Thông báo',
                        description: 'Thêm mới đánh giá thất bại' + res.response.data.message,
                    })
                } else {
                    notification.error({
                        message: 'Thông báo',
                        description: 'Sửa thông tin đánh giá thất bại',
                    })
                }
            }
        };

        if (idEvaluation === '') {
            dispatch(evaluationAction.CreateEVALUATE(values, callback));
        } else {
            dispatch(evaluationAction.EditEVALUATE({ id: idEvaluation, formData: values}, callback));
        }   
    }
    
    const renderExams = (onChange = false) => {
        let options = [];
        if (exams.status === 'success') {
            options = exams.data.map((exam) => (
                <Option key={exam.de_thi_id} value={exam.de_thi_id} >{exam.ten_de_thi}</Option>
            ))
        }
        return (
            <Select style={{width: '100%'}}
                showSearch
                allowClear
                filterOption={(input, option) =>
                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
                loading={loadingExams}
                onChange={(value) => {
                    if (onChange) {
                        if (value === undefined || value === null) value = '';
                        setIdExam(value)
                    }
                }}
                placeholder="Chọn đề thi"
            >
                {options}
            </Select>
        );
    };

    // modal content
    const renderModal = () => {
        return(
            <Row>
                <Col xl={24} sm={24} xs={24} className="cate-form-block">
                    {(idEvaluation === '') ? <h5>Thêm mới đánh giá</h5> : <h5>Sửa thông tin đánh giá</h5>}
                    <Form layout="vertical" className="category-form" form={formEvaluation} autoComplete="off" onFinish={submitForm}>
                        <Row gutter={25}>
                            <Col xl={24} sm={24} xs={24}>
                                <Form.Item
                                    className="input-col"
                                    label="Tên đề thi"
                                    name="de_thi_id"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Tên đề thi là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    {renderExams()}
                                </Form.Item>
                            </Col>
                            <Col xl={24} sm={24} xs={24} className="left-content">
                                <Form.Item
                                    className="input-col"
                                    label="Phần thi"
                                    name="phan_thi"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Phần thi là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    <InputNumber placeholder="Nhấp phần thi" style={{width: "100%"}}/>
                                </Form.Item>
                                <Form.Item
                                    className="input-col"
                                    label="Câu bắt đầu"
                                    name="cau_bat_dau"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Câu bắt đầu là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    <InputNumber placeholder="Nhập số câu bắt đầu" style={{width: "100%"}}/>
                                </Form.Item>
                                
                            </Col>
                            <Col xl={24} sm={24} xs={24} className="right-content">
                                <Form.Item
                                    className="input-col"
                                    label="Câu kết thúc"
                                    name="cau_ket_thuc"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Câu kết thúc là trường bắt buộc.',
                                        },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('cau_bat_dau') < value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Câu kết thúc phải lớn hơn câu bắt đầu!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <InputNumber placeholder="Nhập số câu kết thúc" style={{width: "100%"}}/>
                                </Form.Item>
                                <Form.Item
                                    className="input-col"
                                    label="Đánh giá"
                                    name="danh_gia"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Đánh giá là trường bắt buộc.',
                                        },
                                    ]}
                                >
                                    <TextArea rows={4} placeholder="Nhập nội dung đánh giá" style={{width: "100%"}}/>
                                </Form.Item>
                                
                            </Col>
                            
                            <Form.Item className="button-col" style={{textAlign: 'right'}}>
                                {idEvaluation === '' ? <Button shape="round" type="primary" htmlType="submit" >Thêm mới</Button> : <Button shape="round" type="primary" htmlType="submit" >Cập nhật</Button>}                             
                            </Form.Item>
                        </Row>                                     
                    </Form>
                </Col>
            </Row>
        )
    }

    const EditEvaluation = (danh_gia_id) => {
        const callback = (res) => {
            if (res.status === 'success') {
                setIsModalVisible(true);
                formEvaluation.setFieldsValue(res.data);
            }
        }
        setIdEvaluation(danh_gia_id);
        dispatch(evaluationAction.getEVALUATE({ id: danh_gia_id }, callback));
    }
    
    const DeleteEvaluation = (danh_gia_id) => {
        const result = window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?');
        if (result) {
          const callback = (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                dispatch(evaluationAction.getEVALUATEs({ id: idExam, pageIndex: pageIndex, pageSize: pageSize}));         
                notification.success({
                    message: 'Thành công',
                    description: 'Xóa đánh giá thành công',
                })
            } else {
              notification.error({
                message: 'Thông báo',
                description: 'Xóa đánh giá mới thất bại',
              })
            };
          }
          dispatch(evaluationAction.DeleteEVALUATE({ id: danh_gia_id }, callback))
        }
    }

    // event đổi pageSize
    const onShowSizeChange = (current, pageSize) => {
        setPageSize(pageSize)
    };

    // event đổi pageIndex
    const onChange = page => {
        setPageIndex(page - 1 );
    };

    const columns = [
        {
          title: 'Tên đề thi',
          dataIndex: 'ten_de_thi',
          key: 'ten_de_thi',
          responsive: ['md'],
          sorter: (a, b) => a.ten_de_thi.localeCompare(b.ten_de_thi),
        },
        {
            title: 'Phần thi',
            dataIndex: 'phan_thi',
            key: 'phan_thi',
            responsive: ['md'],
        },
        {
            title: 'Số câu bắt đầu',
            dataIndex: 'cau_bat_dau',
            key: 'cau_bat_dau',
            responsive: ['md'],
        },
        {
          title: 'Số câu kết thúc',
          dataIndex: 'cau_ket_thuc',
          key: 'cau_ket_thuc',
          responsive: ['md'],
        },
        {
          title: 'Nội dung đánh giá',
          dataIndex: 'danh_gia',
          key: 'danh_gia',
          responsive: ['md'],
        },
        {
          title: 'Thời gian cập nhật',
          dataIndex: 'ngay_sua',
          key: 'ngay_sua',
          responsive: ['md'],
          render: (date) => (
            moment(date).utc(7).format(config.DATE_FORMAT)
          ),
          sorter: (a, b) => moment(a.ngay_sua).unix() - moment(b.ngay_sua).unix()
        },     
        {
            title: 'Tùy chọn',
            key: 'danh_gia_id',
            dataIndex: 'danh_gia_id',
            // Redirect view for edit
            render: (danh_gia_id) => (
                <Space size="middle">
                    <Button  type="button" onClick={() => EditEvaluation(danh_gia_id)} className="ant-btn ant-btn-round ant-btn-primary">Sửa</Button>
                    <Button shape="round" type="danger" onClick={() => DeleteEvaluation(danh_gia_id)} >Xóa</Button> 
                </Space>
            ),
        },
    ];

    return (
        <>
            {loading && <LoadingCustom />}
            <div className='content'>
                <Helmet>
                    <title>Quản lý đánh giá đề thi</title>
                </Helmet>
                <Row className="app-main"><h5>Quản lý đánh giá đề thi</h5></Row>
                <Row cclassName="select-action-group" gutter={[8, 8]}>
                    <Col xl={12} sm={12} xs={24}>
                        {renderExams(true)}
                    </Col>
                    <Col xl={12} sm={12} xs={24} className="right-actions">
                        <Button shape="round" type="primary" icon={<PlusOutlined />} className=" btn-action" onClick={() => {
                            showModal();
                            formEvaluation.resetFields();
                        }}>
                            Thêm mới đánh giá
                        </Button>
                    </Col>
                </Row>

                {(evaluations.status === 'success') &&
                    <>
                        <Table className="table-striped-rows" columns={columns} dataSource={dataEvaluations} />
                        <Pagination
                            showSizeChanger
                            onShowSizeChange={onShowSizeChange}
                            onChange={onChange}
                            defaultCurrent={pageIndex + 1}
                            total={dataEvaluations.length}
                        />
                    </>
                }
            </div>

            <Modal visible={isModalVisible}  mask={true} centered={true} className="cra-exam-modal" wrapClassName="cra-exam-modal-container"
                onCancel={handleCancel}
                maskStyle={{ background: 'rgba(0, 0, 0, 0.8)' }}
                maskClosable={false}
                width={600}
                footer={null}
            >
                {renderModal()}
            </Modal>
        </>
    )
}

export default EvaluationPage;