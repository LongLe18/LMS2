import React from 'react';
import { Modal, Form, InputNumber, Button, Row, Col,
    Select, notification, } from 'antd';

import * as criteriaAction from '../../../../redux/actions/criteria';
import * as moduleAction from '../../../../redux/actions/part';
import * as thematicAction from '../../../../redux/actions/thematic';
import { useSelector, useDispatch } from "react-redux"; 

const { Option } = Select;

const ModalCriteria = (props) => {
    const dispatch = useDispatch();
    const [addCriteriaForm] = Form.useForm()

    const courses = useSelector(state => state.course.list.result);
    const modules = useSelector(state => state.part.list.result);

    const renderCourses = () => {
        let options = [];
        options = courses?.data?.map((course) => (
            <Option key={course.khoa_hoc_id} value={course.khoa_hoc_id} >{course.ten_khoa_hoc}</Option>
        ));
        return (
            <Select style={{width: '100%'}}
                maxTagCount="responsive"
                showSearch={true}
                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                allowClear={true}
                onChange={(value) => {
                    dispatch(moduleAction.getModulesByIdCourse({ idCourse: value !== undefined ? value : '' }));
                }}
                placeholder="Danh mục khóa học"
            >
                <Option key={''} value={''}>Tất cả khóa học</Option>
                {options}
            </Select>
        );
    };
    
    const renderModules = () => {
        let options = [];
        if (modules.status === 'success') {
            options = modules.data
            .filter((module) => module.loai_tong_hop === 0) // Lọc bỏ chương học tổng hợp
            .map((module) => (
                <Option key={module.mo_dun_id} value={module.mo_dun_id} >{module.ten_mo_dun}</Option>
            ))
        }
        return (
            <Select
                showSearch={false}
                onChange={(mo_dun_id) => {
                    dispatch(thematicAction.getThematicsByIdModule({ idModule: mo_dun_id }))
                }}
                placeholder="Chọn chương học"
            >
                {options}
            </Select>
        );
    };
    
    // Handle form submission
    const handleSubmit = () => {
        addCriteriaForm
        .validateFields()
        .then((values) => {
            if (props?.course) { // Tiêu chí đề thi tổng hợp
                dispatch(criteriaAction.createCriteriaCourse(values, () => {
                    notification.success({
                        message: "Thêm tiêu chí thành công",
                    })
                    props?.handleCancel();
                    addCriteriaForm.resetFields();
                    dispatch(criteriaAction.checkCriteria({ type: 'synthetic', id: props?.initCourse }));
                }))
            } 
        })
        .catch((info) => {
            console.log("Validate Failed:", info)
        })
    }

    return (
        <Modal
            title={(props?.course) ? "Thêm mới tiêu chí đề thi tổng hợp" : (!props?.module) ? "Thêm mới tiêu chí đề thi chương học" : (props?.thematic) ? "Thêm mới tiêu chí đề thi chuyên đề" : ""}
            open={props?.isModalVisible}
            onCancel={() => {
                props?.handleCancel();
                addCriteriaForm.resetFields();
            }}
            footer={null}
            width={600}
            maskClosable={false}
            destroyOnClose
            closeIcon={<span style={{ fontSize: "16px" }}>×</span>}
        >
            <Form form={addCriteriaForm} layout="vertical" style={{ marginTop: "20px" }}>
                <Form.Item
                    name="khoa_hoc_id"
                    label={"Khóa học"}
                    rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
                    initialValue={props?.initCourse}
                >
                    {renderCourses()}
                </Form.Item>

                <Form.Item style={{display: require.module ? '' : 'none'}}
                    className="input-col"
                    label="chương học"
                    name="mo_dun_id"
                    rules={[
                        {
                            required: props?.module,
                            message: 'chương học là trường bắt buộc.',
                        },
                    ]}
                >
                    {renderModules()}
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="so_cau_hoi"
                            label={"Số câu hỏi"}
                            rules={[{ required: true, message: "Vui lòng nhập số câu hỏi" }]}
                        >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="Nhập số câu hỏi" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                    <Form.Item
                        name="so_lan_thi"
                        label={"Số lần thi"}
                        rules={[{ required: true, message: "Vui lòng nhập số lần thi" }]}
                    >
                        <InputNumber style={{ width: "100%" }} min={0} placeholder="Nhập số lần thi tối đa được phép thi" />
                    </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="thoi_gian"
                            label={"Thời gian"}
                            rules={[{ required: true, message: "Vui lòng nhập thời gian" }]}
                        >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="Nhập thời gian" addonAfter="Phút" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="yeu_cau"
                            label={"Yêu cầu"}
                            rules={[{ required: true, message: "Vui lòng nhập yêu cầu" }]}
                        >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="Nhập yêu cầu đạt đề thi" />
                        </Form.Item>
                    </Col>
                </Row>

                <span style={{color: 'red', display: props?.thematic ? 'block' : 'none'}}>* Các chuyên đề cùng chương học có tiêu chí giống nhau</span>
                <Row gutter={16}>
                    <Col span={12}>
                        <Button
                            block
                            size="large"
                            onClick={() => {
                                props?.handleCancel();
                                addCriteriaForm.resetFields();
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
                            onClick={handleSubmit}
                            className="btn-add"
                        >
                            Xác nhận
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default ModalCriteria;