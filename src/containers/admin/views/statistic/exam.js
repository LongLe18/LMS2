import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// helper
import moment from "moment";
import config from '../../../../configs/index';

// hooks
import useFetch from 'hooks/useFetch';
import useDebounce from 'hooks/useDebounce';

// component
import { Row, Col, Table, Button, Tag, Select, notification } from 'antd';
import AppFilter from "components/common/AppFilter";
import ReactExport from "react-export-excel";

// redux
import { useSelector, useDispatch } from "react-redux";
import * as examActions from '../../../../redux/actions/exam';
import * as courseActions from '../../../../redux/actions/course';

const { Option } = Select;
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const StatisticExam = (props) => {
    const dispatch = useDispatch();

    const exams = useSelector(state => state.exam.list.result);
    const courses = useSelector(state => state.course.list.result);
    
    const [state, setState] = useState({
        examId: 0,
    });

    const [filter, setFilter] = useState({
        search: '',
        start: '',
        end: '',
        tinh: '',
    });
    const searchValue = useDebounce(filter.search, 250);

    const [province] = useFetch('/province');
    const [data, setData] = useState([]);

    // const [data] = useFetch( ``);

    const fetchStatiscal = (idExam) => {
        const token = localStorage.getItem('userToken');
        axios.get(config.API_URL + `/exam/student/${idExam}?index=1&limit=10000&search=${searchValue}&ngay_bat_dau=${filter.start}&ngay_ket_thuc=${filter.end}&tinh=${filter.tinh}`, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'}})
        .then(
            res => {
                if (res.status === 200 && res.statusText === 'OK') {
                    if (res.data.data.length > 0) {
                        res.data.data.map((item, index) => {
                            if (item.diem_cac_phan !== null && item.diem_cac_phan !== "") {
                                const scores = item.diem_cac_phan.split(',');
                                scores.map((_, i) => {
                                    item[`diem_phan_${i + 1}`] = _
                                    return null;
                                })
                            }
                            return null;
                        })
                        setData(res.data.data.map((item, index) => ({...item, key: index})));
                    }
                    else 
                        setData(res.data.data);
                } else {
                    notification.error({
                        message: 'Lỗi',
                        description: 'Có lỗi xảy ra khi lấy dữ liệu',
                    })
                }
            }
        )
        .catch(error => 
        {   
            notification.error({ message: error.response.data })
        });
    }

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
        const callback = (res) => {
            if (res.status === 'success') {
                setState({ ...state, examId: res.data[0].de_thi_id });
                fetchStatiscal(res.data[0].de_thi_id);
            }
        }
        dispatch(courseActions.getCourses({ idkct: '', status: '', search: '' }));
        dispatch(examActions.filterExam({ idCourse: '', idModule: '', idThematic: '', status: '', search: '', 
            start: '', end: '', idType: '', publish: '1' }, callback));
        
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const renderCourse = () => {
        let options = [];
        if (courses.status === 'success') {
            options = courses.data.map((course) => (
                <Option key={course.khoa_hoc_id} value={course.khoa_hoc_id}>{course.ten_khoa_hoc}</Option>
            ))
        }
        return (
            <Select style={{marginRight: 10, width: 300}}
                showSearch={false}
                placeholder="Chọn khóa học"
                onChange={(khoa_hoc_id) => {
                    dispatch(examActions.filterExam({ idCourse: khoa_hoc_id, idModule: '', idThematic: '', status: '', search: '', 
                        start: '', end: '', idType: '', publish: '1' }));
                }}
            >
                {options}
            </Select>
        );
    };

    const renderExams = () => {
        let options = [];
        if (exams.status === 'success') {
            options = exams.data.map((exam) => (
                <Option key={exam.de_thi_id} value={exam.de_thi_id} >{exam.ten_de_thi}</Option>
            ))
        }
        return (
          <Select style={{marginRight: 10}}
            showSearch={true} value={state.examId}
            placeholder="Chọn đề thi"
            onChange={(exam) => {
                setState({ ...state, examId: exam })
            }}
          >
            {options}
          </Select>
        );
    };
    
    useEffect(() => {
        fetchStatiscal(state.examId)
    }, [filter.start, filter.end, filter.tinh, state.examId]); // eslint-disable-line react-hooks/exhaustive-deps

    useMemo(() => {
        fetchStatiscal(state.examId)
    }, [searchValue]); // eslint-disable-line react-hooks/exhaustive-deps

    const columns = [
        {
            title: 'STT',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Họ tên',
            dataIndex: 'ho_ten',
            key: 'ho_ten',
            responsive: ['md'],
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'sdt',
            key: 'sdt',
            responsive: ['md'],
        },
        {
            title: 'Tỉnh/Thành phố',
            dataIndex: 'tinh',
            key: 'tinh',
            responsive: ['md'],
        },
        {
            title: 'Số câu đúng',
            dataIndex: 'so_cau_tra_loi_dung',
            key: 'so_cau_tra_loi_dung',
            responsive: ['md'],
        },
        {
            title: 'Điểm số',
            dataIndex: 'diem_so',
            key: 'diem_so',
            responsive: ['md'],
        },
        {
            title: 'Ngày thi',
            dataIndex: 'ngay_thi',
            key: 'ngay_thi',
            responsive: ['md'],
            render: (ngay_thi) => (
                moment(new Date(ngay_thi)).utc(7).format(config.DATE_FORMAT)
            )
        },
        {
            title: 'Xếp hạng',
            dataIndex: 'diem_so',
            key: 'diem_so',
            responsive: ['md'],
            render: (diem_so) => (
                <Tag color={(diem_so >= 9.5 && diem_so <= 10) ? 'green' 
                    : (diem_so >= 8.0 && diem_so < 9.5) ? 'blue' 
                    : (diem_so >= 7.0 && diem_so < 8.0) ? 'geekblue' 
                    : (diem_so >= 5.0 && diem_so < 7.0) ? 'purple' : 'red'} 
                    key={diem_so}>
                        {(diem_so >= 9.5 && diem_so <= 10) ? "Xuất sắc" 
                    : (diem_so >= 8.0 && diem_so < 9.5) ? 'Giỏi' 
                    : (diem_so >= 7.0 && diem_so < 8.0) ? 'Khá' 
                    : (diem_so >= 5.0 && diem_so < 7.0) ? 'Trung binh' : 'Dưới trung bình'}
                </Tag>
            ),
        },
    ];

    return (
        <div className='content'>
            <Col xl={24} className="body-content">
                <Row className="app-main">
                    <Col xl={24} sm={24} xs={24}>
                        <AppFilter
                            title="Thống kê kết quả"
                            isShowSearchBox={true}
                            isSearchProvinces={true}
                            isShowDatePicker={true}
                            isRangeDatePicker={true}
                            provinces={province.length > 0 ? province: []}
                            onFilterChange={(field, value) => onFilterChange(field, value)}
                        />
                    </Col>
                </Row>
                <Row className='app-main' style={{paddingTop: 0}}>
                    <Col xl={24} sm={24} xs={24}>
                        {renderCourse()}
                        {renderExams()}
                        <ExcelFile element={<Button type='primary'>Trích xuất file</Button>} filename={props.title || ''}>
                        <ExcelSheet data={data} name={'Thống kê điểm'}>
                            <ExcelColumn label="Họ tên" value="ho_ten"/>
                            <ExcelColumn label="Số điện thoại" value="sdt"/>
                            <ExcelColumn label="Quê quán" value="tinh"/>
                            <ExcelColumn label="Trường học" value="truong_hoc"/>
                            <ExcelColumn label="Số câu đúng" value={"so_cau_tra_loi_dung"}/>
                            <ExcelColumn label="Số câu sai" value={"so_cau_tra_loi_sai"}/>
                            <ExcelColumn label="Điểm phần 1" value={"diem_phan_1"}/>
                            <ExcelColumn label="Điểm phần 2" value={"diem_phan_2"}/>
                            <ExcelColumn label="Điểm phần 3" value={"diem_phan_3"}/>
                            <ExcelColumn label="Điểm phần 4" value={"diem_phan_4"}/>
                            <ExcelColumn label="Điểm" value="diem_so"/>
                            <ExcelColumn label="Xếp hạng" value={(col) => (col.diem_so >= 9.5 && col.diem_so <= 10) ? "Xuất sắc" 
                                    : (col.diem_so >= 8.0 && col.diem_so < 9.5) ? 'Giỏi' 
                                    : (col.diem_so >= 7.0 && col.diem_so < 8.0) ? 'Khá' 
                                    : (col.diem_so >= 5.0 && col.diem_so < 7.0) ? 'Trung binh' : 'Dưới trung bình'}/>
                            <ExcelColumn label="Ngày thi" value={(col) => moment(col.ngay_thi).utc(7).format(config.DATE_FORMAT)}/>
                        </ExcelSheet>
                    </ExcelFile>
                    </Col>
                </Row>
            </Col>
            <Table className="table-striped-rows" columns={columns} dataSource={data} />
        </div>
    )
};

export default StatisticExam;