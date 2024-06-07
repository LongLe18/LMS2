import React, { useEffect, useState } from 'react';
import config from '../../../../configs/index';
import moment from "moment";
// antd
import { Table, Space, Button, notification, Row, Col, Form, Input } from 'antd';
import LoadingCustom from 'components/parts/loading/Loading';
// redux
import * as majorAction from '../../../../redux/actions/major';
import { useSelector, useDispatch } from "react-redux";

const { TextArea } = Input;

const MajorPage = () => {
    const data = [];
    const [form] = Form.useForm();
    
    const dispatch = useDispatch();
    const majors = useSelector(state => state.major.list.result);
    const error = useSelector(state => state.major.list.erorr);
    const loading = useSelector(state => state.major.list.loading);

    const major = useSelector(state => state.major.item.result);

    const [state, setState] = useState({
        isEdit: false, 
        chuyen_nganh_id: ''
    });

    useEffect(() => {
        dispatch(majorAction.getMajors());
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (majors.status === 'success') {
        majors.data.map((major) => data.push({ ...major, 'key': major.chuyen_nganh_id }))
    }
    
    const columns = [
        {
            title: 'Tên chuyên ngành',
            dataIndex: 'ten_chuyen_nganh',
            key: 'ten_chuyen_nganh',
            responsive: ['md'],
        },
        {
            title: 'Mô tả',
            dataIndex: 'mo_ta',
            key: 'mo_ta',
            responsive: ['md'],
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'ngay_tao',
            key: 'ngay_tao',
            responsive: ['md'],
            render: (date) => (
                moment(date).utc(7).format(config.DATE_FORMAT_SHORT)
            )
        },
        {
          title: 'Tùy chọn',
          key: 'chuyen_nganh_id',
          dataIndex: 'chuyen_nganh_id',
          // Redirect view for edit
          render: (chuyen_nganh_id) => (
            <Space size="middle">
              <Button  type="button" onClick={() => EditMajor(chuyen_nganh_id)} className="ant-btn ant-btn-round ant-btn-primary">Sửa</Button>
              <Button shape="round" type="danger" onClick={() => deleteMajor(chuyen_nganh_id)} >Xóa</Button> 
            </Space>
          ),
        },
    ]

    const EditMajor = (id) => {
        dispatch(majorAction.getMajor({ id: id }));
        setState({ ...state, isEdit: true, chuyen_nganh_id: id });
        let body = document.getElementsByClassName('cate-form-block')[0];
        body.scrollIntoView();
    };

    useEffect(() => {   
        form.setFieldsValue(major.data);
    }, [major]);  // eslint-disable-line react-hooks/exhaustive-deps

    const cancelEdit = () => {
        setState({ ...state, isEdit: false })
        form.resetFields();
    };

    const CreateAndEditMajor = (values) => {
        const formData = {
            ten_chuyen_nganh: values.ten_chuyen_nganh,
            mo_ta: values.mo_ta
        };

        const callback = (res) => {
            console.log(res);
            if (res.data.status === 'success' ||res.status === 'success') {
                form.resetFields();
                dispatch(majorAction.getMajors());
                notification.success({
                  message: 'Thành công',
                  description: state.isEdit ? 'Sửa thông tin Chuyên ngành thành công' : 'Thêm chuyên nghành mới thành công', 
                })
            } else {
                notification.error({
                message: 'Thông báo',
                description: state.isEdit ? 'Sửa thông tin chuyên ngành thất bại' : 'Thêm chuyên ngành mới thất bại',
                })
            }
        };

        if (state.isEdit) {
            dispatch(majorAction.editMajor({ id: state.chuyen_nganh_id, formData: formData }, callback))
        } else {
            dispatch(majorAction.createMajor(formData, callback))
        }
    };

    const deleteMajor = (id) => {
        const result = window.confirm('Bạn có chắc chắn muốn hủy kích hoạt chuyên ngành này?');
        if (result) {
          const callback = (res) => {
                if (res.data.status === 'success') {
                    dispatch(majorAction.getMajors());
                    notification.success({
                        message: 'Thành công',
                        description: 'Xóa chuyên ngành thành công',
                    })
                } else {
                    notification.error({
                        message: 'Thông báo',
                        description: 'Xóa chuyên ngành thất bại',
                    })
                };
            }
            dispatch(majorAction.deleteMajor({ id: id }, callback))
        }
    }
    return (    
        <>
            {loading && <LoadingCustom/>}
            <br/>
            <div className="content">
                <h5>Quản lý chuyên ngành</h5>
                {data.length > 0 && 
                    <Table className="table-striped-rows" columns={columns} dataSource={data} />
                }
                {(error) && notification.error({
                    message: 'Thông báo',
                    description: 'Lấy dữ liệu chuyền ngành thất bại',
                })}
                <Row>
                    <Col xl={24} sm={24} xs={24} className="cate-form-block">
                    {(state.isEdit) ? <h5>Sửa thông tin chuyên ngành</h5> : <h5>Thêm mới chuyên ngành</h5>}  
                        <Form layout="vertical" className="category-form" form={form} autoComplete="off" onFinish={CreateAndEditMajor}>
                            <Form.Item
                                className="input-col"
                                label="Tên chuyên ngành"
                                name="ten_chuyen_nganh"
                                rules={[
                                    {
                                    required: true,
                                    message: 'Tên chuyên ngành là trường bắt buộc.',
                                    },
                                ]}
                            >
                                <Input placeholder=""/>
                            </Form.Item>
                            <Form.Item className="input-col" label="Mô tả" name="mo_ta" rules={[]}>
                                <TextArea rows={2} placeholder="Mô tả" />
                            </Form.Item>
                            <Form.Item className="button-col">
                                <Space>
                                    <Button shape="round" type="primary" htmlType="submit" >
                                    {(state.isEdit ) ? 'Cập nhật' : 'Thêm mới'}   
                                    </Button>
                                    {(state.isEdit ) 
                                    ?  <Button shape="round" type="danger" onClick={() => cancelEdit()}>  
                                        Hủy bỏ
                                    </Button>
                                    : ''}    
                                </Space>    
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default MajorPage;