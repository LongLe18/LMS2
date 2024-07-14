import React, { useEffect, useState } from 'react';
// import defaultImage from 'assets/img/default.jpg';
import config from '../../../../configs/index';
import moment from 'moment';
import MathJax from 'react-mathjax';

// component
import { Row, Col, Table, notification, Button, Space, Form, Upload, message } from 'antd';
import LoadingCustom from 'components/parts/loading/Loading';
import AppFilter from 'components/common/AppFilter';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';

// redux
import * as exceprtAction from '../../../../redux/actions/exceprt';
import { useSelector, useDispatch } from "react-redux"; 

const { Dragger } = Upload;

const Exceprt = (props) => {
    const dispatch = useDispatch();

    const [form] = Form.useForm();
    const data = [];
    const exceprts = useSelector(state => state.exceprt.list.result);
    const loading = useSelector(state => state.exceprt.list.loading);

    const [isEdit, setIsEdit] = useState(false);
    const [state, setState] = useState({
        idExceprt: '',
        fileImg: ''
    });

    useEffect(() => {
        dispatch(exceprtAction.getExceprts());
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (exceprts.status === 'success') {
        exceprts.data.map((item, index) => {
            let doan_trichs = item.noi_dung.split('$').map((doan_trich) => {
                if (doan_trich.includes('\\underline')) {
                    doan_trich = '<span class="underline">' + doan_trich.split('\\underline{')[1].split('}')[0] + '</span>';
                }
                return doan_trich
            })
            data.push({...item, 'key': index, noi_dung: doan_trichs?.join('') })
        });
    }

    const columns = [
        {
            title: 'Nội dung',
            dataIndex: 'noi_dung',
            key: 'noi_dung',
            responsive: ['md'],
            render: (noi_dung) => (
                <MathJax.Provider>
                    <div style={{whiteSpace: 'pre-line'}} dangerouslySetInnerHTML={{ __html: noi_dung }}></div>
                    {/* {question.cau_hoi?.trich_doan?.noi_dung?.split('\n').map((item) =>
                        item.indexOf('includegraphics') !== -1 && (
                            <img src={config.API_URL + `/${item.match(regex)[1]}`}></img>
                        ) 
                    )} */}
                </MathJax.Provider>
            )
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'ngay_tao',
            key: 'ngay_tao',
            responsive: ['md'],
            render: (ngay_tao) => moment(ngay_tao).format(config.DATE_FORMAT)
        },
        {
            title: 'Tùy chọn',
            key: 'trich_doan_id',
            dataIndex: 'trich_doan_id',
            // Redirect view for edit
            render: (trich_doan_id) => (
                <Space size="middle">
                <Button  type="button" onClick={() => Edit(trich_doan_id)} className="ant-btn ant-btn-round ant-btn-primary">Sửa</Button>
                <Button shape="round" type="danger" onClick={() => Delete(trich_doan_id)} >Xóa</Button> 
                </Space>
            ),
        },
    ];  

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
          console.log(e);
          setState({ ...state, fileImg: '' });
        },
    };

    const Edit = (trich_doan_id) => {
        const callback = (res) => {
            if (res.status === 'success') form.setFieldsValue(res.data);
            document.getElementsByClassName('select-action-group')[0].scrollIntoView();
        };

        setIsEdit(true);
        setState({...state, idExceprt: trich_doan_id});
        dispatch(exceprtAction.getEXCEPRT({ id: trich_doan_id }, callback))
    };

    const Delete = (trich_doan_id) => {
        const result = window.confirm('Bạn có chắc chán muốn xóa trích đoạn này?');
        if (result) {
          const callback = (res) => {
            if (res.statusText === 'OK' && res.status === 200) {
                dispatch(exceprtAction.getExceprts());
                notification.success({
                    message: 'Thành công',
                    description: 'Xóa trích đoạn thành công',
                })
            } else {
              notification.error({
                message: 'Thông báo',
                description: 'Xóa trích đoạn thất bại',
              })
            };
          }
          dispatch(exceprtAction.deleteEXCEPRT({ id: trich_doan_id }, callback))
        }
    };

    const createExceprt = (values) => {
        const formData = new FormData();
        const callback = (res) => {
            if (res.status === 200 && res.statusText === 'OK') {
                notification.success({
                    message: 'Thành công',
                    description: state.isEdit ? 'Sửa thông tin trích đoạn thành công' : 'Thêm trích đoạn mới thành công', 
                });
                dispatch(exceprtAction.getExceprts());
            } else {
                notification.error({
                    message: 'Thông báo',
                    description: 'Thêm mới trích đoạn thất bại',
                })
            }
        };

        if (state.fileImg !== '')
            formData.append('noi_dung', state.fileImg !== undefined ? state.fileImg : '');
        
        if (!isEdit)
            dispatch(exceprtAction.createEXCEPRT(formData, callback));
        else dispatch(exceprtAction.editEXCEPRT({ id: state.idExceprt, formData: formData }, callback));
    };

    return (
        <>
            {loading && <LoadingCustom/>}
            <div className='content'>
                <Row className="app-main">
                    <Col xl={24} className="body-content">
                        <AppFilter
                            title="Trích đoạn đề thi"
                            // isShowCourse={true}
                            // isShowModule={true}
                            // isShowThematic={true}
                            // isShowStatus={true}
                            // isShowSearchBox={true}
                            // isShowDatePicker={true}
                            // isRangeDatePicker={true}
                            // courses={courses.data}
                            // onFilterChange={(field, value) => onFilterChange(field, value)}
                        />
                    </Col>
                </Row>
                <Row className="select-action-group" gutter={[8, 8]}>
                    <Col xl={12} sm={12} xs={24}></Col>
                    <Col xl={12} sm={12} xs={24} className="right-actions">
                        <Button shape="round" type="primary" icon={<PlusOutlined />} className=" btn-action" onClick={() => {
                            setIsEdit(false)
                        }}>
                            Thêm mới trích đoạn
                        </Button>
                    </Col>
                </Row>
                {exceprts.status === 'success' &&
                    <Table className="table-striped-rows" columns={columns} dataSource={data}></Table>
                }

                <Row>
                    <Col xl={24} sm={24} xs={24} className="cate-form-block">
                        {!isEdit ? <h5>Thêm mới trích đoạn đề thi</h5> :  <h5>Sửa trích đoạn đề thi</h5>}
                        <Form layout="vertical" className="category-form" form={form} autoComplete="off" onFinish={createExceprt}>
                            <Row gutter={25}>
                                <Col xl={24} sm={24} xs={24} className="right-content">
                                    <Form.Item
                                        className="input-col"
                                        label="Nội dung"
                                        name="noi_dung"
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Nội dung là trường bắt buộc.',
                                            },
                                        ]}
                                    >
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
                                    <Form.Item className="button-col" style={{textAlign: 'right'}}>
                                        {!isEdit ? <Button shape="round" type="primary" htmlType="submit" >Thêm mới</Button> : <Button shape="round" type="primary" htmlType="submit" >Cập nhật</Button>}                             
                                    </Form.Item>
                                </Col>
                            </Row>                                     
                        </Form>
                    </Col>
                </Row>
            </div>
        </>
    )
};

export default Exceprt;