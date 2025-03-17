import React, { useState, useEffect } from 'react';

// helper
import moment from "moment";
import config from '../../../../configs/index';
import axios from "axios";

// component
import { Tabs, Row, Col, Table, Space, Button, Tag, Pagination, notification } from 'antd';
import AppFilter from "components/common/AppFilter";
// redux
import * as programmeAction from '../../../../redux/actions/programme';
import { useSelector, useDispatch } from "react-redux";

const { TabPane } = Tabs;

const StatisticCourse = (props) => {
    const dispatch = useDispatch();

    const [state, setState] = useState({
        isEdit: false,
        idCourse: '',
        activeTab: "1",
    });
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState([]);
    const [detail, setDetail] = useState([]);

    const [filter, setFilter] = useState({
        trang_thai: '',
        search: '',
        kct_id: '',
    });

    const programmes = useSelector(state => state.programme.list.result);

    // call api get data statistic course
    const fetchDataStatistic = async () => {
        axios.get(config.API_URL + `/course/statistical?pageIndex=${pageIndex}&pageSize=${pageSize}&trang_thai=${filter.trang_thai}&kct_id=${filter.kct_id}&search=${filter.search}`, 
            { headers: {
                Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                'Content-Type': 'application/json',
            }}
        )
            .then(
                res => {
                    if (res.status === 200 && res.statusText === 'OK') {
                        res.data.data = res.data.data.map((item, index) => ({...item, 'key': index}));
                        setData(res.data);
                    } else {
                        notification.error({
                            message: 'Lỗi',
                            description: 'Có lỗi xảy ra khi lấy dữ liệu',
                        })
                    }
                }
            )
            .catch(error => notification.error({ message: error.message }));
    };

    // call api get data detail of  statistic course
    const fetchDataDetailStatistic = async (idCourse) => {
        axios.get(config.API_URL + `/student/of_course/${idCourse}`,
            { headers: {
                Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                'Content-Type': 'application/json',
            }}
        )
            .then(
                res => {
                    if (res.status === 200 && res.statusText === 'OK') {
                        setDetail(res.data.data);
                    } else {
                        notification.error({
                            message: 'Lỗi',
                            description: 'Có lỗi xảy ra khi lấy dữ liệu',
                        })
                    }
                }
            )
            .catch(error => notification.error({ message: error.message }));
    };

    useEffect(() => {
        dispatch(programmeAction.getProgrammes({ status: '' }));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchDataStatistic(); // call api lấy dữ liệu thống kê khoá học
    }, [pageSize, pageIndex]); // eslint-disable-line react-hooks/exhaustive-deps
    
    useEffect(() => {
        fetchDataStatistic(); // call api lấy dữ liệu thống kê khoá học
    }, [filter.kct_id, filter.search, filter.trang_thai]); // eslint-disable-line react-hooks/exhaustive-deps

    const columns = [
        {
            title: 'STT',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Tên khóa học',
            dataIndex: 'ten_khoa_hoc',
            key: 'ten_khoa_hoc',
            responsive: ['md'],
        },
        {
            title: 'Khung chương trình',
            dataIndex: 'ten_khung_ct',
            key: 'ten_khung_ct',
            responsive: ['md'],
            render: (ten_khung_ct, record) => (
                record.khung_chuong_trinh.ten_khung_ct
            ),
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'ngay_bat_dau',
            key: 'ngay_bat_dau',
            responsive: ['md'],
            render: (ngay_bat_dau) => (
                moment(ngay_bat_dau).utc(7).format(config.DATE_FORMAT_SHORT)
            )
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'ngay_ket_thuc',
            key: 'ngay_ket_thuc',
            responsive: ['md'],
            render: (ngay_ket_thuc) => (
                moment(ngay_ket_thuc).utc(7).format(config.DATE_FORMAT_SHORT)
            )
        },
        {
            title: 'Số lượng',
            dataIndex: 'so_luong',
            key: 'so_luong',
            responsive: ['md'],
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            responsive: ['md'],
            render: (trang_thai) => (
                <Tag color={trang_thai ? 'green' : 'red'} key={trang_thai}>
                    {trang_thai ? "Đang hoạt động" : "Đã dừng"}
                </Tag>
            ),
        },
        {
            title: 'Tùy chọn',
            key: 'khoa_hoc_id',
            dataIndex: 'khoa_hoc_id',
            // Redirect view for edit
            render: (khoa_hoc_id) => (
                <Space size="middle">
                    <Button type="button" onClick={() => detailStatistic(khoa_hoc_id)} className="ant-btn ant-btn-round ant-btn-primary">Chi tiết</Button>
                </Space>
            ),
        },
    ];

    const columns2 = [
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
            title: 'Ngày sinh',
            dataIndex: 'ngay_sinh',
            key: 'ngay_sinh',
            responsive: ['md'],
            render: (ngay_sinh) => (
                ngay_sinh !== null ? moment(ngay_sinh).utc(7).format(config.DATE_FORMAT_SHORT) : ''
            )
        },
        {
            title: 'Số chuyên đề chưa học',
            dataIndex: 'so_chuyen_de_chua_hoc',
            key: 'so_chuyen_de_chua_hoc',
            responsive: ['md'],
        },
        {
            title: 'Số chuyên đề đã học',
            dataIndex: 'so_chuyen_de_da_hoc',
            key: 'so_chuyen_de_da_hoc',
            responsive: ['md'],
        },
        {
            title: 'Tiến độ',
            dataIndex: 'tien_do',
            key: 'tien_do',
            responsive: ['md'],
        },
    ];

    // event đổi pageSize
    const onShowSizeChange = (current, pageSize) => {
        setPageSize(pageSize)
    };

    // event đổi pageIndex
    const onChange = page => {
        setPageIndex(page);
    };

    const detailStatistic = (id) => {
        setState({...state, activeTab: "2", idCourse: id });
        // call api get detail statistic course
        fetchDataDetailStatistic(id);
    };

    const onFilterChange = (field, value) => {
        if (field === 'ngay') {
          setFilter((state) => ({ ...state, start: value[0] }));  
          setFilter((state) => ({ ...state, end: value[1] }));  
        }
        else {
          setFilter((state) => ({ ...state, [field]: value }));  
        }
    };
    
    const onChangeTab = (value) => {
        setState({...state, activeTab: value});
    };

    return (
        <div className='content'>
            <Col xl={24} className="body-content">
                <Row className="app-main">
                    <Col xl={24} sm={24} xs={24}>
                        <AppFilter
                            title="Thống kê khóa học"
                            placeholder="Tìm kiếm theo tên khóa học"
                            isShowStatus={state.activeTab === "1"}
                            isShowSearchBox={state.activeTab === "1"}
                            isShowDatePicker={false}
                            isRangeDatePicker={false}
                            isShowProgramme={state.activeTab === "1"}
                            programmes={programmes?.data}
                            onFilterChange={(field, value) => onFilterChange(field, value)}
                        />
                    </Col>
                </Row>
            </Col>
            <Tabs defaultActiveKey={state.activeTab} activeKey={state.activeTab} onChange={onChangeTab}>
                <TabPane tab="Thống kê khóa học" key="1">
                    <Table className="table-striped-rows" columns={columns} dataSource={data?.data} pagination={false}/>
                    <Pagination style={{marginTop: 12}}
                        showSizeChanger
                        onShowSizeChange={onShowSizeChange}
                        pageSize={pageSize}
                        onChange={onChange}
                        defaultCurrent={pageIndex}
                        total={data?.totalCount}
                    />
                </TabPane>
                <TabPane tab="Chi tiết Thống kê khóa học" disabled key="2">
                    <Table className="table-striped-rows" columns={columns2} dataSource={detail} />
                </TabPane>
            </Tabs>      
        </div>
    )
};

export default StatisticCourse;