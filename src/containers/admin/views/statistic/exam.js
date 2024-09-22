import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// helper
import moment from "moment";
import config from '../../../../configs/index';

// hooks
import useFetch from 'hooks/useFetch';
import useDebounce from 'hooks/useDebounce';

// component
import { Row, Col, Table, Button, Tag, Select, notification, Pagination } from 'antd';
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
    const [total, setTotal] = useState(0);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchStatiscal = (idExam) => {
        const token = localStorage.getItem('userToken');
        axios.get(config.API_URL + `/exam/student/${idExam}?index=${pageIndex}&limit=${pageSize}&search=${searchValue}&ngay_bat_dau=${filter.start}&ngay_ket_thuc=${filter.end}&tinh=${filter.tinh}`, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'}})
        .then(
            res => {
                if (res.status === 200 && res.statusText === 'OK') {
                    if (res.data.data.length > 0) {
                        setTotal(res.data.total);
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
            start: '', end: '', idType: '', publish: 1, offset: '', limit: 1000000 }, callback));
        
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
                showSearch={true}
                placeholder="Chọn khóa học"
                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                onChange={(khoa_hoc_id) => {
                    dispatch(examActions.filterExam({ offset: 0, limit: 100000, idCourse: khoa_hoc_id, idModule: '', idThematic: '', status: '', search: '', 
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
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
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
    }, [filter.start, filter.end, filter.tinh, state.examId, pageIndex, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

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
            render: (diem_so) => (
                diem_so.toFixed(2)
            )
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
        {
            title: 'Tùy chọn',
            dataIndex: 'dthv_id',
            key: 'dthv_id',
            responsive: ['md'],
            render: (dthv_id, record) => (
                <>
                    <Button type='primary' style={{borderRadius: 6, marginRight: 6}}
                        onClick={async () => {
                            try {
                                const response = await axios({
                                    url: `${config.API_URL}/evaluate/${dthv_id}/export-report`, 
                                    method: 'GET',
                                    responseType: 'blob', 
                                    headers: {
                                        Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                                    }
                                });
                    
                                // Create a URL for the file
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `${moment(record.ngay_thi).utc(7).format('ddmmYY')}_${record.ho_ten}.pdf`); // Replace with your file name and extension
                                document.body.appendChild(link);
                                link.click();
                                link.parentNode.removeChild(link);
                            } catch (error) {
                                console.error('Download error:', error);
                            }
                        }}
                    >
                        Tải báo cáo
                    </Button>
                    {/* Xem laị bài thi */}
                    <Button type='primary' style={{borderRadius: 6}}
                        onClick={() => {
                            // open new  tab
                            window.open(`/luyen-tap/lich-su-admin/${state.examId}/${dthv_id}`, '_blank');
                        }}
                    >
                        Xem lại
                    </Button>
                </>
            )
        }
    ];

    const onChange = (page) => {
        setPageIndex(page);
    };
      
    const onShowSizeChange = (current, pageSize) => {
        setPageSize(pageSize);
    };

    const exportReportSummanry = async () => {
        const token = localStorage.getItem('userToken');
        try {
            const response = await axios.get(config.API_URL + `/student_exam/export-report?ngay_bat_dau=${filter.start}&ngay_ket_thuc=${filter.end}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            // Create a URL for the Blob and trigger a download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'baocaoTonghop.xlsx'); // or any other extension
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Có lỗi xảy ra khi tải báo cáo',
            })
        }
    };

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
                        <Button type='primary' style={{marginLeft: 8}} onClick={exportReportSummanry}>Tải báo cáo tổng hợp</Button>
                    </Col>
                </Row>
            </Col>
            <Table className="table-striped-rows" columns={columns} dataSource={data} pagination={false}/>
            <br/>
            <Pagination current={pageIndex} onChange={onChange} total={total} onShowSizeChange={onShowSizeChange} showSizeChanger defaultPageSize={pageSize}/>
        </div>
    )
};

export default StatisticExam;