import React, { useEffect, useState } from 'react';
import moment from "moment";
import config from '../../../../../configs/index';
import AppFilter from 'components/common/AppFilter';
import PermissionForm from "./permission-form"

// antd
import { Table, Button, Space, Form, Input, Pagination, Spin,
    Row, Col, notification, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

// redux
import * as positionAction from '../../../../../redux/actions/position';
import { useSelector, useDispatch } from "react-redux";

// Phân quyền cho từng chức vụ 
// Nhân viên (Admin, Kỹ thuật viên, Giám độc trung tâm)
// 4. Giáo viên 

const { TextArea } = Input;

const PermissionPage = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    
    const [permission, setPermission] = useState();
    const [state, setState] = useState({
        isEdit: false,
        chuc_vu_id: null,
    });
    const [filter, setFilter] = useState({
        search: '',
    });
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    
    const positions = useSelector((state) => state.position.list.result);
    const permissions = useSelector((state) => state.position.permissions.result);
    const loading = useSelector((state) => state.position.list.loading);

    const columnsTable = [
        {
            title: 'Thứ tự',
            dataIndex: 'index',
            key: 'index',
            responsive: ['lg'],
            render: (item, record, index) => (<>{index + 1}</>)
        },
        {
            title: 'Tên chức vụ',
            dataIndex: 'ten',
            key: 'ten',
            responsive: ['md'],
        },
        {
            title: 'Người tạo',
            dataIndex: 'nguoi_tao',
            key: 'nguoi_tao',
            responsive: ['md'],
            render: (nguoi_tao, khoa_hoc) => (
                nguoi_tao
            )
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
            title: 'Người cập nhật',
            dataIndex: 'nguoi_sua',
            key: 'nguoi_sua',
            responsive: ['md'],
            render: (nguoi_sua, khoa_hoc) => (
                nguoi_sua
            )
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'ngay_sua',
            key: 'ngay_sua',
            responsive: ['md'],
            render: (date) => (
                moment(date).utc(7).format(config.DATE_FORMAT_SHORT)
            )
        },
        {
            title: 'Tùy chọn',
            key: 'chuc_vu_id',
            dataIndex: 'chuc_vu_id',
            // Redirect view for edit
            render: (chuc_vu_id) => (
            <Space size="middle">
                <Button  type="button" onClick={() => {onUpdate(chuc_vu_id, true)}} className="ant-btn ant-btn-round ant-btn-primary">Cập nhật</Button>
                <Button shape="round" type="danger" onClick={() => {deletePosition(chuc_vu_id)}} >Xóa</Button> 
            </Space>
            ),
        },
    ];

    useEffect(() => {
        dispatch(positionAction.getPositions({ pageIndex: pageIndex, pageSize: pageSize, search: filter.search }));
        dispatch(positionAction.getPermissions({ pageIndex: 1, pageSize: 999999, search: '' }));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const onFilterChange = (field, value) => {
        if (field === 'ngay') {
            setFilter((state) => ({ ...state, start: value[0] }));  
            setFilter((state) => ({ ...state, end: value[1] }));  
        }
        else {
            setFilter((state) => ({ ...state, [field]: value }));  
        }
    };
    
    // cập nhật item
    const onUpdate = (chuc_vu_id, request) => {
        if (request) {
            dispatch(positionAction.getPosition({ id: chuc_vu_id }, (response) => {
                if (response.status === 'success') {
                    form.setFieldsValue(response.data);
                    setPermission(response.data.chuc_vu_qtcs);
                }
            }));
            setState({ ...state, isEdit: true, chuc_vu_id: chuc_vu_id });
            let body = document.getElementsByClassName('cate-form-block')[0];
            body.scrollIntoView();
        }
    }

    // event thay đổi trang
    const onChange = (page) => {
        setPageIndex(page);
    };
  
    // event đổi pageSize
    const onShowSizeChange = (current, pageSize) => {
        setPageSize(pageSize)
    };

    const updatePosition = (values) => {
        const callback = (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                form.resetFields();
                setState({ ...state, isEdit: false });
                dispatch(positionAction.getPositions({ pageIndex: pageIndex, pageSize: pageSize, search: filter.search }));
                notification.success({
                    message: 'Thành công',
                    description:  !state.isEdit ? 'Thêm khóa chức vụ thành công' : 'Cập nhật chức vụ thành công',
                })
            } else {
                notification.error({
                    message: 'Thông báo',
                    description:  !state.isEdit ? 'Thêm chức vụ thành công' : 'Cập nhật chức vụ thất bại',
                })
            }
        };

        const data = {
            "ten": values.ten,
            "ma": values.ma,
            "mo_ta": values.mo_ta,
        }
        if (state.isEdit) {
            dispatch(positionAction.editPosition({ formData: data, id: state.chuc_vu_id }, callback))
        } else {
            dispatch(positionAction.createPosition(data, callback));
        }
    }

    const cancelEdit = () => {
        setState({ ...state, isEdit: false })
        form.resetFields();
    };

    const onChangePermissions = (changedValues) => {
        const callback = (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                notification.success({
                    message: 'Thành công',
                    description:  'Cập nhật quyền thành công',
                })
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: 'Cập nhật quyền thất bại',
                })
            }
        };

        const data = {
            "qtc_ids": changedValues?.chuc_vu_qtcs,
        }
        if (state.isEdit) {
            dispatch(positionAction.editPosition({ formData: data, id: state.chuc_vu_id }, callback))
        } 
    }

    const deletePosition = (id) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chán muốn xóa chức vụ này?',
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk() {
                const callback = (res) => {
                if (res.statusText === 'OK' && res.status === 200) {
                    dispatch(positionAction.getPositions({ pageIndex: pageIndex, pageSize: pageSize, search: filter.search }));
                    notification.success({
                        message: 'Thành công',
                        description:  'Xóa chức vụ thành công',
                    })
                } else {
                    notification.error({
                        message: 'Thông báo',
                        description: 'Xóa chức vụ thất bại',
                    })
                };
                }
                dispatch(positionAction.deletePosition({ id: id }, callback))
            },
        });
    }

    return (
        <div className="content" >
            <Spin spinning={loading}>
                <AppFilter
                    title="Quản lý quyền"
                    isShowSearchBox={true}
                    onFilterChange={(field, value) => onFilterChange(field, value)}
                />
                <br/>
                <Table className="table-striped-rows" columns={columnsTable} dataSource={positions.data} pagination={false}/>
                <br/>
                <Pagination showSizeChanger 
                    onShowSizeChange={onShowSizeChange} 
                    current={pageIndex} 
                    pageSize={pageSize} 
                    onChange={onChange} 
                    total={positions?.totalCount}
                />
                <br/>
                <Row>
                    <Col xl={24} sm={24} xs={24} className="cate-form-block">
                        <h5>Cập nhật quyền</h5>
                        <Form layout="vertical" className="category-form" form={form} autoComplete="off" onFinish={updatePosition}>
                            <Form.Item
                                className="input-col"
                                label="Tên chức vụ"
                                name="ten"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Tên chức vụ là trường bắt buộc.',
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập tên chức vụ"/>
                            </Form.Item>
                            <Form.Item
                                className="input-col"
                                label="Mã chức vụ"
                                name="ma"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Mã chức vụ là trường bắt buộc.',
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập mã chức vụ"/>
                            </Form.Item>
                            <Form.Item
                                className="input-col"
                                label="Mô tả"
                                name="mo_ta"
                                rules={[]}
                            >
                                <TextArea rows={4} placeholder='Nhập mô tả'/>
                            </Form.Item>
                            {state.isEdit &&
                                <PermissionForm permissions={permissions?.data} data={permission} onValuesChange={onChangePermissions}/>
                            }
                            <Form.Item className="button-col">
                                <Space>
                                    <Button shape="round" type="primary" htmlType="submit" >
                                    {(state.isEdit) ? 'Cập nhật' : 'Thêm mới'}   
                                    </Button>
                                    {(state.isEdit) 
                                    ?  <Button shape="round" type="danger" onClick={() => cancelEdit()} > 
                                        Hủy bỏ
                                    </Button>
                                    : ''}    
                                </Space>    
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </Spin>
        </div>
    )
}

export default PermissionPage;