import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';

import config from '../../../../configs/index'
import { Row, Table, Space, Col, Button } from 'antd';

// component
import AppFilter from 'components/common/AppFilter';

const QuestionPage = () => {

    const column1 = [
        {
          title: 'Tên câu hỏi',
          dataIndex: 'ten_cau_hoi',
          key: 'ten_de_thi',
          responsive: ['md'],
        },
        {
          title: 'Mức độ',
          dataIndex: 'thoi_gian',
          key: 'thoi_gian',
          responsive: ['md'],
        },
        {
          title: 'Đề thi',
          dataIndex: 'ten_de_thi',
          key: 'ten_de_thi',
          responsive: ['md'],
        },
        {
          title: 'Ngày tạo',
          dataIndex: 'ngay_tao',
          key: 'ngay_tao',
          responsive: ['md'],
          render: (date) => (
            moment(date).utc(7).format(config.DATE_FORMAT)
          )
        },
        {
          title: 'Tùy chọn',
          key: 'de_thi_id',
          dataIndex: 'de_thi_id',
          // Redirect view for edit
          render: (de_thi_id) => (
            <Space size="middle">
              <Link to={ "#" } type="button" className="ant-btn ant-btn-round ant-btn-primary">Xem</Link>
              <Button shape="round" type="danger" >Xóa</Button> 
            </Space>
          ),
        },
    ];

    return (
        <>
            <div className="content">
                <Row className="app-main">
                    <Col xl={24} className="body-content">
                        <Row>
                            <Col xl={24} sm={24} xs={24}>
                                {/* {courses.status === "success" && */}
                                    <AppFilter
                                    title="Quản lý câu hỏi"
                                    isShowCourse={false}
                                    isShowModule={false}
                                    isShowThematic={false}
                                    isShowStatus={true}
                                    isShowSearchBox={true}
                                    isShowDatePicker={true}
                                    isRangeDatePicker={true}
                                    // courses={courses.data}
                                    // onFilterChange={(field, value) => onFilterChange(field, value)}
                                />
                                {/* } */}
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <br/>
                <Table className="table-striped-rows" columns={column1}>

                </Table>
            </div>
        </>
    )
}

export default QuestionPage;
