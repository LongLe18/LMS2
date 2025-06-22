import React, { useState, useEffect }  from "react"
import { useParams } from "react-router-dom"
import { diff } from "helpers/common.helper";
import Hashids from "hashids";

import { Card, Avatar, Typography, Space, Button, Upload, Row, Col, 
    message, Dropdown, Menu, Form, notification, Modal, } from "antd"
import { DashOutlined, SendOutlined, UploadOutlined, ExclamationCircleOutlined } from "@ant-design/icons"
import './css/detail-reply.css'
import config from '../../../../configs/index'
import defaultImage from 'assets/img/default.jpg';
import TextEditorWidget2 from "components/common/TextEditor/TextEditor2";

// redux
import * as commentAction from '../../../../redux/actions/comment';
import * as notificationAction from '../../../../redux/actions/notification';
import { useSelector, useDispatch } from "react-redux";
import moment from "moment"

const { Title, Text } = Typography
const { Dragger } = Upload;

const ReplyDetail = () => {
    const dispatch = useDispatch();
    const idReply = useParams().idReply; // Lấy id từ URL
    const hashids = new Hashids();
    const [form] = Form.useForm();

    const [state, setState] = useState({
        comment: '',
        idComment: 0,
        idSubComment: 0,
        fileImg: '',
        isEdit: false,
    });

    const comment = useSelector(state => state.comment.item.result);
    const subcomments = useSelector(state => state.comment.listSub.result);

    useEffect(() => {
        dispatch(commentAction.getCOMMENT({ id: idReply })); // Lấy bình luận theo id
        dispatch(commentAction.getSUBCCOMMENTs({ idComment: idReply }));
    }, [])
    
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
            setState({ ...state, fileImg: info.fileList });
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
    
    const cancelEdit = () => {
        setState({ ...state, idSubComment: 0, isEdit: false });
        form.resetFields();
    };

    const editSubComment = (binh_luan_phu_id) => {
        setState({ ...state, idSubComment: binh_luan_phu_id, isEdit: true });
        dispatch(commentAction.getSUBCOMMENT({ id: binh_luan_phu_id }, (res) => {
            if (res.status === 'success') {
                if (res.data) form.setFieldsValue({ nhan_xet: res.data.noi_dung });
            }
        }))
    };

    const deleteSubComment = (binh_luan_phu_id) => {
        const callback = (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                dispatch(commentAction.getSUBCCOMMENTs({ idComment: state.idComment }));

                notification.success({
                    message: 'Thành công',
                    description: 'Xóa bình luận thành công',
                });
                // Xóa thông báo
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: 'Xóa bình luận mới thất bại',
                })
            };
        }

        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn xóa bình luận này?',
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk() {
                dispatch(commentAction.DeleteSUBCCOMMENT({ idComment: binh_luan_phu_id }, callback));
                
            },
        });
    };

    const submitComment = (values) => {
        const callback = (res) => {
            if (res.data.status === 'success' && res.statusText === 'OK') {
                notification.success({
                    message: 'Thành công',
                    description: !state.isEdit ? 'Thêm bình luận thành công' : 'Sửa bình luận thành công',
                });
                /// Tạo thông báo cho sinh viên
                if (!state.isEdit) {
                    const note = {
                        "loai_thong_bao": 1, // sub comment
                        "lien_ket_id": res.data.data.binh_luan_phu_id,
                        //// bổ sung link_lien_ket
                        "link_lien_ket": comment.data.loai_hoi_dap === 0 ? 
                            `/${hashids.encode(comment.data.mo_dun_id)}/${hashids.encode(comment.data.khoa_hoc_id)}` :
                            comment.data.lien_ket_id.split('/')[4] === '1' ?
                            `${comment.data.lien_ket_id.split('/')[2]}/${comment.data.mo_dun_id}/${comment.data.khoa_hoc_id}/${comment.data.lien_ket_id.split('/')[0]}/${comment.data.lien_ket_id.split('/')[3]}/${idReply}`
                            : comment.data.lien_ket_id.split('/')[4] === '2' ?
                            `${comment.data.mo_dun_id}/${comment.data.khoa_hoc_id}/${comment.data.lien_ket_id.split('/')[0]}/${comment.data.lien_ket_id.split('/')[3]}/${idReply}`
                            : `${comment.data.khoa_hoc_id}/${comment.data.lien_ket_id.split('/')[0]}/${comment.data.lien_ket_id.split('/')[3]}/${idReply}`
                    }; 
                    dispatch(notificationAction.CreateNOTIFICATION({ formData: note, 
                        idModule: comment.data.mo_dun_id !== null ? comment.data.mo_dun_id : '', 
                        type: comment.data.loai_hoi_dap, idCourse: comment.data.khoa_hoc_id,
                        idThematic: comment.data.loai_hoi_dap === 0 ? comment.data.lien_ket_id : '', 
                        idExam: comment.data.loai_hoi_dap === 1 ? comment.data.lien_ket_id.split('/')[0] : '', 
                        index: comment.data.loai_hoi_dap === 1 ? comment.data.lien_ket_id.split('/')[1] : '', 
                        Teacher: comment.data.hoc_vien_id !== null ? comment.data.hoc_vien_id : '' }));       
                }
                // cập nhật trạng thái bình luận
                const editdata = {tra_loi: 1}
                dispatch(commentAction.EditCOMMENT({ formData: editdata, idComment: idReply }, (res) => {
                    if (res.status === 200 && res.statusText === 'OK') {
                        dispatch(commentAction.getSUBCCOMMENTs({ idComment: idReply }));
                        form.resetFields();
                    } 
                }));
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: !state.isEdit ? 'Thêm bình luận thất bại' : 'Sửa bình luận thất bại',
                })
            }
        };
        
        const formData = new FormData();
        formData.append('noi_dung', values.nhan_xet)
        if (state.fileImg !== '') {
            formData.append('anh_dinh_kem', state.fileImg[0].originFileObj); // array image
        }
        if (state.isEdit) { // sửa
            dispatch(commentAction.EditSUBCCOMMENT({ formData: formData, idSubComment: state.idSubComment }, callback));
        } else { // Thêm
            formData.append('binh_luan_id', idReply);
            dispatch(commentAction.CreateSUBCCOMMENT(formData, callback));
        }
    };

    return (
        <div className="reply-detail">

            <Row gutter={24}>
                {/* Main Content */}
                <Col xs={24} lg={16}>
                    <Card style={{ borderRadius: "8px", marginBottom: "24px" }}>
                        {/* Student Info Header */}
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                            <Avatar size={48} src={require('assets/img/avatar.png').default} style={{ marginRight: "12px" }} />
                            <div>
                                <Title level={4} style={{ margin: 0, color: "#262626" }}>
                                    {comment?.data?.ho_ten}
                                </Title>
                                <Text type="secondary">{moment(comment?.data?.ngay_tao).utc(7).format(config.DATE_FORMAT)}</Text>
                            </div>
                        </div>

                        {/* Question Title */}
                        <div style={{ backgroundColor: "#FAAD1426", padding: "20px", borderRadius: "8px", marginBottom: "24px" }}>

                            <Title level={3} style={{ marginBottom: "16px", color: "#262626" }}>
                                Câu hỏi về {comment?.data?.type === 0 ? 'Chuyên đề' : 'Đề thi'}
                            </Title>

                            {/* Question Content */}
                            <div dangerouslySetInnerHTML={{ __html: comment?.data?.noi_dung }}></div>
                        </div>

                        {/* Section sub comment */}
                        <div style={{ marginBottom: "24px" }}>
                            {subcomments?.data?.map((item, index) => (
                                <li className='ml-10' key={index}>
                                    <Row className="comment">
                                        <Col xs={4} sm={1} className="avatar-user" style={{ marginRight: 8,}}>
                                            <Row style={{height: '100%', flexDirection: 'column'}}>
                                                <Avatar size={"large"} src={item.anh_dai_dien !== null ? config.API_URL + item.anh_dai_dien : defaultImage}/>
                                            </Row>
                                        </Col>
                                        <Col xs={20} sm={8} className="content-user">
                                            <span className="name-user">{item.ho_ten}</span>
                                            <div className="content-comment">
                                                <div dangerouslySetInnerHTML={{ __html: item.noi_dung }}></div><br/>
                                                {item.anh_dinh_kem !== null && <img src={config.API_URL + item.anh_dinh_kem} alt="ảnh bình luận"/>}
                                            </div>
                                        </Col>
                                        {(item.nguoi_tra_loi_id === JSON.parse(localStorage.getItem('userInfo')).nhan_vien_id && item.loai_quyen === 2) && 
                                            <Col className="ml-3">
                                                <Dropdown overlay={
                                                    <Menu
                                                        items={[
                                                            {
                                                                label: <Button type="link" onClick={() => editSubComment(item.binh_luan_phu_id)} size='large' style={{width: '100%'}}>Chỉnh sửa</Button>,
                                                                key: '0',
                                                            },
                                                            {
                                                                label: <Button type="link" size='large' style={{width: '100%'}} onClick={() => deleteSubComment(item.binh_luan_phu_id)}>Xóa</Button>,
                                                                key: '1',
                                                            },
                                                        ]}
                                                    />
                                                } 
                                                trigger={['click']}>
                                                    <a href="#/" onClick={(e) => e.preventDefault()}>
                                                        <Space>
                                                            <DashOutlined />
                                                        </Space>
                                                    </a>
                                                </Dropdown>
                                            </Col>
                                        }
                                    </Row>
                                    <ul>
                                       <span style={{color: '#3c3cf6c4', fontSize: 12}}>Đã bình luận: {diff(item.ngay_sua)}</span>
                                    </ul>
                                </li>             
                            ))}                      
                        </div>

                        {/* Reply Section */}
                        <div>
                            <Title level={4} style={{ marginBottom: "16px", color: "#262626" }}>
                                Trả lời
                            </Title>
                            <Form layout="vertical" className="category-form" form={form} autoComplete="off" onFinish={submitComment}>
                                <Form.Item 
                                    className="input-col"
                                    label="Bình luận của bạn"
                                    name="nhan_xet"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Trường bắt buộc.',
                                        },
                                    ]}
                                    >
                                        <TextEditorWidget2
                                            placeholder="Bình luận bài giảng"
                                            showToolbar={true}
                                            isMinHeight200={true}
                                            isSimple={false}
                                        />
                                </Form.Item>

                                <Form.Item className="input-col" label="Hình ảnh" name="hinh_anh" rules={[]}>
                                    <Dragger {...propsImage} maxCount={1}
                                        listType="picture"
                                        className="upload-list-inline"
                                    >
                                        <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                                        <p className="ant-upload-text bold">Click hoặc kéo thả ảnh vào đây</p>
                                    </Dragger>
                                </Form.Item>
                                <Form.Item className="button-col" htmlType="submit">
                                    {state.isEdit === false ?
                                        <Button type="primary" htmlType="submit">BÌNH LUẬN</Button>
                                        :
                                        <Space>
                                            <Button icon={<SendOutlined />} type="primary" htmlType="submit" size='large'>GỬI ĐI</Button>  
                                            <Button type="primary" danger onClick={() => cancelEdit()} size='large'>HỦY</Button>  
                                        </Space>
                                    }
                                </Form.Item>
                            </Form>

                        </div>
                    </Card>
                </Col>

                {/* Student Info Sidebar */}
                <Col xs={24} lg={8}>
                    <Card style={{ borderRadius: "8px" }}>
                        <div style={{ textAlign: "center", marginBottom: "24px" }}>
                            <Avatar size={80} src="/placeholder.svg?height=80&width=80" style={{ marginBottom: "12px" }} />
                            <Title level={4} style={{ margin: 0, color: "#262626" }}>
                                {comment?.data?.ho_ten || "Tên học viên"}
                            </Title>
                        </div>

                        <div style={{ marginBottom: "24px" }}>
                            <Row gutter={[0, 12]}>
                                <Col span={24}>
                                    <Row>
                                        <Col span={10}>
                                        <Text type="secondary">Mã học viên</Text>
                                        </Col>
                                        <Col span={14}>
                                        <Text strong>{comment?.data?.hoc_vien_id}</Text>
                                        </Col>
                                    </Row>
                                </Col>
                                
                                <Col span={24}>
                                    <Row>
                                        <Col span={10}>
                                            <Text type="secondary">Ngày bình luận</Text>
                                        </Col>
                                        <Col span={14}>
                                            <Text>{moment(comment?.data?.ngay_tao).utc(7).format(config.DATE_FORMAT_SHORT)}</Text>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col span={24}>
                                    <Row>
                                        <Col span={10}>
                                            <Text type="secondary">Lần cuối bình luận</Text>
                                        </Col>
                                        <Col span={14}>
                                            <Text>{moment(comment?.data?.ngay_sua).utc(7).format(config.DATE_FORMAT_SHORT)}</Text>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>

                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default ReplyDetail
