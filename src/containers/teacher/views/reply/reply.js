import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import './css/content.css';

// helper
import config from '../../../../configs/index';
import moment from 'moment';

// components
import { Row, Col, Tag, Space, Button, Table, 
    Tooltip, Pagination, notification, Modal, } from 'antd';
import AppFilter from "components/common/AppFilter";
import { CommentOutlined, DeleteOutlined, ExclamationCircleOutlined, } from "@ant-design/icons";

// redux
import * as commentAction from '../../../../redux/actions/comment';
import * as courseAction from '../../../../redux/actions/course';
import { useSelector, useDispatch } from "react-redux";

const ReplyPage = (props) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const comments = useSelector(state => state.comment.list.result);
    const courses = useSelector(state => state.course.list.result);

    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filter, setFilter] = useState({
        khoa_hoc_id: '',
        mo_dun_id: '',
        trang_thai: '',
    });
    useEffect(() => {
        dispatch(commentAction.getCOMMENTs({ idCourse: filter.khoa_hoc_id, idModule: filter.mo_dun_id, type: filter.trang_thai, isTeacher: true }));
        dispatch(courseAction.filterCourses({ status: '', search: '', start: '', end: '', pageSize: 10000000, pageIndex: 1 }));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const columns = [
        {
            title: 'STT',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Nội dung',
            dataIndex: 'noi_dung',
            key: 'noi_dung',
            responsive: ['md'],
            render: (noi_dung)  => (
                <div dangerouslySetInnerHTML={{ __html: noi_dung }}></div>
            )
        },
        {
            title: 'Khóa học',
            dataIndex: 'ten_khoa_hoc',
            key: 'ten_khoa_hoc',
            responsive: ['md'],
            render: (name, record) => (
                <span>{record?.khoa_hoc?.ten_khoa_hoc !== null ? record?.khoa_hoc?.ten_khoa_hoc : ''}</span>
            )
        },
        {
            title: 'Mô-đun',
            dataIndex: 'ten_mo_dun',
            key: 'ten_mo_dun',
            responsive: ['md'],
            render: (name, record) => (
                <span>{record?.mo_dun?.ten_mo_dun !== null ? record?.mo_dun?.ten_mo_dun : ''}</span>
            )
        },
        {
            title: 'Loại hỏi đáp',
            dataIndex: 'loai_hoi_dap',
            key: 'loai_hoi_dap',
            responsive: ['md'],
            render: (type) => (
              <span>{type === 0 ? 'Chuyên đề' : 'Đề thi'}</span>
            )
        },
        {
            title: 'Tên học viên',
            dataIndex: 'ten_hoc_vien',
            key: 'ten_hoc_vien',
            responsive: ['md'],
            render: (name, record) => (
                <span>{record?.hoc_vien?.ho_ten !== null ? record?.hoc_vien?.ho_ten : ''}</span>
            )
        },
        {
            title: 'Ngày hỏi',
            dataIndex: 'ngay_tao',
            key: 'ngay_tao',
            responsive: ['md'],
            render: (date) => (
              moment(date).utc(7).format(config.DATE_FORMAT_SHORT)
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'tra_loi',
            key: 'tra_loi',
            responsive: ['md'],
            render: (tra_loi) => (
                <Tag color={tra_loi === 0 ? 'blue' : 'green'} key={tra_loi}>
                    {tra_loi === 0 ? "Chờ trả lời" : "Đã trả lời"}
                </Tag>
            ),
        },
        {
            title: 'Tùy chọn',
            key: 'binh_luan_id',
            dataIndex: 'binh_luan_id',
            // Redirect view for edit
            render: (binh_luan_id) => (
                <Space>
                    <Tooltip title="Trả lời">
                        <Button type="text" icon={<CommentOutlined />} size="small" 
                            onClick={() => history.push(`/teacher/detail-reply/${binh_luan_id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button type="text" icon={<DeleteOutlined />} size="small" danger 
                            onClick={() => deleteComment(binh_luan_id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const onFilterChange = (field, value) => {
        if (field === 'ngay') {
          setFilter((state) => ({ ...state, start: value[0] }));  
          setFilter((state) => ({ ...state, end: value[1] }));  
        }
        else {
          setFilter((state) => ({ ...state, [field]: value }));  
        }
    };

    useEffect(() => {
        dispatch(commentAction.getCOMMENTs({ idCourse: filter.khoa_hoc_id, idModule: filter.mo_dun_id, type: filter.trang_thai, isTeacher: true }));
    }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

    // event đổi pageSize
    const onShowSizeChange = (current, pageSize) => {
        setPageSize(pageSize)
    };

    // event thay đổi trang
    const onChange = (page) => {
        setPageIndex(page);
    };

    // Xóa bình luận
    const deleteComment = (binh_luan_id) => {
        const callback = (response) => {
            if (response.status === 200 && response.data.status === 'success') {
                notification.success({
                    message: 'Thành công',
                    description: 'Xóa bình luận thành công',
                });
                dispatch(commentAction.getCOMMENTs({ idCourse: filter.khoa_hoc_id, idModule: filter.mo_dun_id, type: filter.trang_thai, isTecher: true }));
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: 'Xóa bình luận thất bại',
                })
            }
        }

        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn xóa bình luận này?',
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk() {
                dispatch(commentAction.DeleteCOMMENT({ idComment: binh_luan_id }, callback));
            },
        });
    }
        
    return (
        <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Row className="app-main">
                <Col xl={24} className="body-content">
                    <Row>
                        <Col xl={24} sm={24} xs={24}>
                            <AppFilter
                                title="Danh sách hỏi đáp"
                                isShowCourse={true}
                                isShowModule={true}
                                isShowStatus={true}
                                courses={courses.data}
                                onFilterChange={(field, value) => onFilterChange(field, value)}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
            
            <Table className="table-striped-rows" columns={columns} dataSource={comments.data} pagination={false} />
            <Pagination showSizeChanger style={{marginTop: 8}}
                onShowSizeChange={onShowSizeChange} 
                current={pageIndex} 
                pageSize={pageSize} 
                onChange={onChange} 
                total={comments?.totalCount}
            />

        </div>
    )
};

export default ReplyPage;