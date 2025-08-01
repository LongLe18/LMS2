import { useState, useEffect } from "react"
import { useParams } from "react-router-dom";
import axios from 'axios';
import moment from "moment";
import config from '../../../../configs/index';
import { Card, Row, Col, Input, Select, Button, Table, Space, Modal,
    Typography, Pagination, notification, Tooltip, message, Divider } from "antd"
import {
    SearchOutlined,
    DownloadOutlined,
    EyeOutlined,
} from "@ant-design/icons"
import { PieChart, Pie, Cell } from "recharts";

import * as examActions from '../../../../redux/actions/exam';
import * as partActions from '../../../../redux/actions/part';
import * as courseAction from '../../../../redux/actions/course';
import * as thematicActions from '../../../../redux/actions/thematic';
import { useSelector, useDispatch } from "react-redux";

const { Title, Text } = Typography
const { Option } = Select

const ClassesManagement = () => {
    const dispatch = useDispatch();
    const idCourse = useParams().courseId;

    const [activeTab, setActiveTab] = useState("3")

    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filter, setFilter] = useState({
        idExam: '',
        search: '',
        idModule: '',
        idThematic: '',
    });

    const [dataSource, setDataSource] = useState([]);
    const [moduns, setModuns] = useState([]);
    const [userId, setUserId] = useState(null);
    const [statisticData, setStatisticData] = useState(null)
    const [isShowHistoryModal, setIsShowHistoryModal] = useState(false);
    const [isShowHistoryModuleModal, setIsShowHistoryModuleModal] = useState(false);

    const modules = useSelector(state => state.part.list.result);
    const exams = useSelector(state => state.exam.list.result);
    const course = useSelector(state => state.course.item.result);
    const module = useSelector(state => state.part.item.result);
    const studentsExam = useSelector(state => state.exam.studentsExam.result);
    const examUser = useSelector(state => state.exam.listExamsUser.result);
    const thematics = useSelector(state => state.thematic.list.result);
    const thematic = useSelector(state => state.thematic.item.result);

    const getDashboardData = async () => {
        axios.get(config.API_URL + '/course/dashboard-by-teacher', {headers: {Authorization: `Bearer ${localStorage.getItem('userToken')}`}})
        .then(
            res => {
                if (res.status === 200 && res.statusText === 'OK') {

                } else {
                    notification.error({
                        message: 'Lỗi',
                        description: 'Có lỗi xảy ra khi lấy dữ liệu thống kê',
                    })
                }
            }
        )
        .catch(error => notification.error({ message: error.message }));
    };

    useEffect(() => {
        getDashboardData();
        dispatch(courseAction.getCourse({ id: idCourse }))
        dispatch(partActions.getModulesTeacher({ idCourse: idCourse, lkh: '', status: '', search: '', pageSize: 99999999, pageIndex: 1 }));
        dispatch(examActions.getStatisticExam({ }, (res) => {
            if (res.status === 'success') {
                const gradeMapping = [
                    { key: "gioi", label: "Giỏi", color: "#52c41a" },
                    { key: "trungbinh", label: "Trung bình", color: "#faad14" },
                    { key: "kha", label: "Khá", color: "#1890ff" },
                    { key: "kem", label: "Kém", color: "#ff4d4f" }
                ];
        
                setStatisticData(res?.data?.map(item => {
                        const total = gradeMapping.reduce((sum, grade) => sum + (item[grade.key] || 0), 0);
                        const categories = gradeMapping.map(grade => ({
                        label: grade.label,
                        value: item[grade.key] || 0,
                        color: grade.color
                    }));
        
                    return {
                        title: `Tổng lượt thi ${item.mo_ta.replace("Đề thi ", "").replace("Mô-đun", 'chương học')}`,
                        total,
                        categories
                    };
                }))
            }
        }))
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    useEffect(() => {
        if (activeTab === "3") {
            fetchStudentsSynthetic()
        } else if (activeTab === "2") {
            dispatch(examActions.getStudentsExamByTeacher({ type: 'module', idCourse: idCourse, 
                pageSize: pageSize, pageIndex: pageIndex, search: filter.search, idModule: filter.idModule
            }));
        } else {
            dispatch(examActions.getStudentsExamByTeacher({ type: 'thematic', idCourse: idCourse, 
                pageSize: pageSize, pageIndex: pageIndex, search: filter.search, idModule: filter.idModule,
                idThematic: filter.idThematic
            }));
        }
    }, [pageIndex, pageSize, filter, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchStudentsSynthetic = async () => {
        try {
            dispatch(examActions.getStudentsExamByTeacher({ type: 'synthetic', idCourse: idCourse, 
                pageSize: pageSize, pageIndex: pageIndex, search: filter.search 
            }, (res) => {
                if (res.status === 'success' && res.data) {
                    const formatted = res?.data?.map((hv, index) => {
                        const row = {
                            key: hv.hoc_vien_id,
                            stt: (pageIndex - 1) * pageSize + index + 1,
                            ho_ten: hv.ho_ten,
                            email: hv.email,
                            sdt: hv.sdt,
                            truong_hoc: hv.truong_hoc,
                            tinh_thanhpho: hv.tinh_thanhpho,
                            de_thi_hoc_viens: hv.de_thi_hoc_viens
                        };

                        hv.de_thi_hoc_viens.forEach((dt) => {
                            row[`diem_${dt.mo_dun_id}`] = dt.ket_qua_diem;
                        });

                        return row;
                    });
                    setDataSource(formatted);
                    setModuns(res?.moduns);
                }
            }));
        } catch (err) {
            message.error('Không thể tải dữ liệu');
            console.error(err);
        } finally {
        }
    };

    const tinhDiemHocPhan = (de_thi_hoc_viens, record) => {
        if (!Array.isArray(de_thi_hoc_viens) || de_thi_hoc_viens.length === 0) {
            return "Chưa thi";
        }

        const diemTheoChuong = {};

        de_thi_hoc_viens.filter((item) => item?.hoc_vien_id === record?.hoc_vien_id).forEach(({ ket_qua_diem, loai_de_thi_id, de_thi_id }) => {
            if (loai_de_thi_id !== 3) return; // chỉ lấy lại đề thi tổng hợp

            if (typeof ket_qua_diem === "number" && !isNaN(ket_qua_diem)) {
                const key = de_thi_id || "no_module"; // Gộp nếu không có module
                if (!diemTheoChuong[key]) {
                    diemTheoChuong[key] = [];
                }
                diemTheoChuong[key].push(ket_qua_diem);
            }
        });

        const diemCacChuong = Object.values(diemTheoChuong).map((diems) => {
            const sum = diems.reduce((a, b) => a + b, 0);
            return sum / diems.length;
        });

        if (diemCacChuong.length === 0) return "Chưa thi";

        const tong = diemCacChuong.reduce((a, b) => a + b, 0);
        return (
            <Button
                type="text"
                style={{ color: "blue", textDecoration: "underline" }}
                onClick={() => {
                    dispatch(examActions.getExamsUser({ idExam: '', idModule: '', type: 3, pageSize: 9999999999, pageIndex: 1 }, (res) => {
                        setIsShowHistoryModal(true);
                        setUserId(record?.key);
                        localStorage.setItem('ten_hoc_vien', record?.ho_ten);
                    }));
                }}
            >
                {Math.round((tong / diemCacChuong.length) * 10) / 10}
            </Button>
        )
    };

    const columnsHistory = [
        {
            title: 'Làm lại',
            key: 'index',
            responsive: ['lg'],
            render: (value, item, index) => (1 - 1) * 10 + index + 1
        },
        {
            title: 'Tên đề thi',
            key: 'ten_de_thi',
            dataIndex: 'ten_de_thi',
            responsive: ['lg'],
            render: (ten_de_thi, de_thi) => (
                <span>{de_thi?.de_thi?.ten_de_thi}</span>
            )
        },
        {
            title: 'Thời gian bắt đầu',
            key: 'thoi_diem_bat_dau',
            dataIndex: 'thoi_diem_bat_dau',
            responsive: ['lg'],
            render: (thoi_diem_bat_dau) => moment(thoi_diem_bat_dau).format(config.DATE_FORMAT)
        },
        {
            title: 'Trạng thái',
            dataIndex: 'thoi_diem_ket_thuc',
            key: 'thoi_diem_ket_thuc',
            responsive: ['lg'],
            render: (thoi_diem_ket_thuc) => (
                <>
                    <span>Đã xong</span>
                    <br/>
                    {thoi_diem_ket_thuc !== null ? <span>Đã nộp {moment(thoi_diem_ket_thuc).format(config.DATE_FORMAT)}</span> : <span>Đã nộp</span>}
                </>
            )
        },
        {
            title: 'Điểm',
            dataIndex: 'ket_qua_diem',
            key: 'ket_qua_diem',
            responsive: ['lg'],
            render: (ket_qua_diem, de_thi) => (
                <span>{ket_qua_diem}/{de_thi?.de_thi?.tong_diem}</span>
            )
        },
        {
            title: 'Xem lại',
            dataIndex: 'de_thi_id',
            key: 'de_thi_id',
            responsive: ['lg'],
            render: (de_thi_id, de_thi) => (
                  <Button  type="button" onClick={() => {
                    window.open(`/luyen-tap/lich-su-admin/${de_thi_id}/${de_thi.dthv_id}`, '_blank');
                  }} className="ant-btn ant-btn-round ant-btn-primary">Xem lại</Button>
              ),
        },
    ];

    const columns = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            width: 60,
            align: "center",
            render: (text, record, index) => index + 1,
        },
        {
            title: "Họ và tên",
            dataIndex: "ho_ten",
            key: "ho_ten",
            width: 200,
        },
        {
            title: "email",
            dataIndex: "email",
            key: "email",
            width: 180,
        },
        {
            title: "SĐT",
            dataIndex: "sdt",
            key: "sdt",
            width: 120,
            align: "center",
        },
        {
            title: "Trường học",
            dataIndex: "truong_hoc",
            key: "truong_hoc",
            width: 120,
            align: "center",
        },
        {
            title: "Tỉnh/Thành phố",
            dataIndex: "tinh_thanhpho",
            key: "tinh_thanhpho",
            width: 120,
            align: "center",
        },
        {
            title: "Điểm học phần",
            dataIndex: "de_thi_hoc_viens",
            key: "de_thi_hoc_viens",
            width: 180,
            render: (de_thi_hoc_viens, record) => tinhDiemHocPhan(de_thi_hoc_viens, record),
        },
        {
            title: "Điểm thi chương học",
            children: moduns.map((modun) => ({
                title: modun.ten_mo_dun,
                dataIndex: "de_thi_hoc_viens",
                render: (de_thi_hoc_viens, record) => {
                    const diemChuong = de_thi_hoc_viens
                        .filter((dt) => dt.mo_dun_id === modun.mo_dun_id && dt.loai_de_thi_id === 2)
                        .map((dt) => dt.ket_qua_diem)
                        .filter((diem) => typeof diem === "number");

                    if (diemChuong.length === 0) return "Chưa thi";

                    const avg = diemChuong.reduce((sum, d) => sum + d, 0) / diemChuong.length;

                    return (
                        <Button
                            type="text"
                            style={{ color: "blue", textDecoration: "underline" }}
                            onClick={() => {
                                dispatch(
                                    examActions.getExamsUser(
                                        { idExam: '', idModule: modun.mo_dun_id, type: 2, pageSize: 99999999, pageIndex: 1 },
                                        (res) => {
                                            setIsShowHistoryModuleModal(true);
                                            localStorage.setItem('ten_hoc_vien', record?.ho_ten);
                                            setUserId(record?.key);
                                        }
                                    )
                                );
                            }}
                        >
                            {Math.round(avg * 10) / 10}
                        </Button>
                    );
                },
            })),
        }
    ]

    const columns2 = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            width: 60,
            align: "center",
            render: (text, record, index) => index + 1,
        },
        {
            title: "Họ và tên",
            dataIndex: "ho_ten",
            key: "ho_ten",
            render: (text, record) => (
                <span>
                    {record?.hoc_vien?.ho_ten}
                </span>
            )
        },
        {
            title: "email",
            dataIndex: "email",
            key: "email",
            render: (text, record) => (
                <span>
                    {record?.hoc_vien?.email}
                </span>
            )
        },
        {
            title: "SĐT",
            dataIndex: "sdt",
            key: "sdt",
            align: "center",
            render: (text, record) => (
                <span>
                    {record?.hoc_vien?.sdt}
                </span>
            )
        },
        {
            title: "Trường học",
            dataIndex: "truong_hoc",
            key: "truong_hoc",
            align: "center",
            render: (text, record) => (
                <span>
                    {record?.hoc_vien?.truong_hoc}
                </span>
            )
        },
        {
            title: "Tỉnh/Thành phố",
            dataIndex: "tinh_thanh_pho",
            key: "tinh_thanh_pho",
            align: "center",
            render: (text, record) => (
                <span>
                    {record?.hoc_vien?.tinh_thanhpho?.ten}
                </span>
            )
        },
        {
            title: "Tên đề thi",
            dataIndex: "ten_de_thi",
            key: "ten_de_thi",
            render: (text, record) => (
                <span>
                    {record?.de_thi?.ten_de_thi}
                </span>
            )
        },
        {
            title: "Ngày nộp bài",
            dataIndex: "ngay_nop_bai",
            key: "ngay_nop_bai",
            render: (text, record) => (
                <span>
                    {moment(record.ngay_nop_bai).utc(7).format(config.DATE_FORMAT_SHORT)}
                </span>
            ),
        },
        {
            title: "Thời gian làm bài",
            dataIndex: "thoi_gian_lam_bai",
            key: "thoi_gian_lam_bai",
        },
        {
            title: "Số câu đúng",
            dataIndex: "so_cau_tra_loi_dung",
            key: "so_cau_tra_loi_dung",
        },
        {
            title: "Số câu sai",
            dataIndex: "so_cau_tra_loi_sai",
            key: "so_cau_tra_loi_sai",
        },
        {
            title: "Điểm",
            dataIndex: "ket_qua_diem",
            key: "ket_qua_diem",
            render: (text, record) => (
                <span>
                    {record?.so_cau_tra_loi_dung > 0 ?
                        (record?.so_cau_tra_loi_dung / (record?.so_cau_tra_loi_dung + record?.so_cau_tra_loi_sai) * 10).toFixed(2)
                        : '0'
                    }
                </span>
            )
        },
        {
            title: "Lần thi",
            dataIndex: "lan_thi",
            key: "lan_thi",
            render: (text, record, index) => index + 1,
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 120,
            align: "center",
            fixed: 'right',
            render: (record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EyeOutlined />}
                            size="small"
                            onClick={() => {
                                localStorage.setItem('ten_hoc_vien', record?.hoc_vien?.ho_ten);
                                window.open(
                                    `/luyen-tap/lich-su-admin/${record?.de_thi?.de_thi_id}/${record?.dthv_id}`,
                                    '_blank'
                                );
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        }
    ]

    // event thay đổi trang
    const onChange = (page) => {
        setPageIndex(page);
    };

    // event đổi pageSize
    const onShowSizeChange = (current, pageSize) => {
        setPageSize(pageSize)
    };

    // hàm xử lý xuất file
    const handleExportFile = async () => {
        if (activeTab === "3") {
            try {
                const res = await axios.get(`${config.API_URL}/student_exam/export-student-list/by-online/${idCourse}`, {
                    responseType: 'blob', // Để nhận dữ liệu dạng file
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                    },
                });
                const blob = new Blob([res.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });

                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute('download', 'Danh sách học viên');
                document.body.appendChild(link);
                link.click();
                link.remove();
            } catch (error) {
                console.error('Lỗi khi tải file:', error);
                alert('Không thể tải file. Vui lòng thử lại.');
            }
        } else if (activeTab === "2") {
            try {
                const res = await axios.get(`${config.API_URL}/student_exam/export-student-list/by-modun/${idCourse}?mo_dun_id=${filter.idModule}`, {
                    responseType: 'blob', // Để nhận dữ liệu dạng file
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                    },
                });
                const blob = new Blob([res.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });

                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute('download', 'Danh sách học viên');
                document.body.appendChild(link);
                link.click();
                link.remove();
            } catch (error) {
                console.error('Lỗi khi tải file:', error);
                alert('Không thể tải file. Vui lòng thử lại.');
            }
        } else {
            try {
                const res = await axios.get(`${config.API_URL}/student_exam/export-student-list/by-thematic/${idCourse}?mo_dun_id=${filter.idModule}?chuyen_de_id=${filter.idThematic}`, {
                    responseType: 'blob', // Để nhận dữ liệu dạng file
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`,
                    },
                });
                const blob = new Blob([res.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });

                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute('download', 'Danh sách học viên');
                document.body.appendChild(link);
                link.click();
                link.remove();
            } catch (error) {
                console.error('Lỗi khi tải file:', error);
                alert('Không thể tải file. Vui lòng thử lại.');
            }
        }
    }

    // Statistics Card Component
    const StatisticsCard = ({ data }) => {
        const pieData = data?.categories?.map((category) => ({
            name: category.label,
            value: category.value,
            color: category.color,
        }));

        return (
            <Card style={{ borderRadius: "8px", height: "100%", background: '#F2F4F5' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <Title level={2} style={{ margin: 0, color: "#262626", fontSize: "32px", fontWeight: "bold" }}>
                            {data?.total}
                        </Title>
                        <Text style={{ color: "#8c8c8c", fontSize: "14px", display: "block", marginTop: "4px" }}>{data?.title}</Text>
                    </div>
                    <div style={{ width: "120px", height: "120px", position: "relative" }}>
                        <PieChart width={120} height={120}>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={1}
                            >
                                {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </div>
                </div>
                <Divider />
                <div style={{ marginTop: "16px" }}>
                    <Row gutter={[8, 8]}>
                        {data.categories.map((category, index) => (
                        <Col span={12} key={index}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <div
                                    style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    backgroundColor: category.color,
                                    }}
                                />
                                <Text style={{ fontSize: "12px", color: "#595959" }}>{category.label}</Text>
                                <Text strong style={{ fontSize: "12px", marginLeft: "auto" }}>
                                    {category.value}
                                </Text>
                            </div>
                        </Col>
                        ))}
                    </Row>
                </div>
            </Card>
        )
    }

    const handleOkHistoryModal = () => {
        setIsShowHistoryModal(false);
    };
    
    const handleOkHistoryModuleModal = () => {
        setIsShowHistoryModuleModal(false);
    };
    
    return (
        <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Title level={3} style={{ marginBottom: "24px", marginTop: '24px', color: "#262626" }}>
                Quản lý lớp học
            </Title>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                {statisticData?.map((data, index) => (
                    <Col xs={24} md={8} key={index}>
                        <StatisticsCard data={data} />
                    </Col>
                ))}
            </Row>

            {/* Tab Navigation */}
            <div style={{ marginBottom: "24px" }}>
                <Space size="large">
                    <Button
                        type={activeTab === "3" ? "primary" : "default"}
                        style={{
                            backgroundColor: activeTab === "3" ? "#dc4c64" : "#f0f0f0",
                            borderColor: activeTab === "3" ? "#dc4c64" : "#f0f0f0",
                            color: activeTab === "3" ? "#fff" : "#8c8c8c",
                            borderRadius: "6px",
                            height: "40px",
                            paddingLeft: "24px",
                            paddingRight: "24px",
                            fontWeight: "500",
                        }}
                        onClick={() => {
                            setActiveTab("3")
                            setPageIndex(1);
                            setPageSize(10);
                            setFilter((state) => ({ ...state, idExam: '', search: '' }));
                        }}
                    >
                        Kết quả chung
                    </Button>
                    <Button
                        type={activeTab === "2" ? "primary" : "default"}
                        style={{
                            backgroundColor: activeTab === "2" ? "#dc4c64" : "#f0f0f0",
                            borderColor: activeTab === "2" ? "#dc4c64" : "#f0f0f0",
                            color: activeTab === "2" ? "#fff" : "#8c8c8c",
                            borderRadius: "6px",
                            height: "40px",
                            paddingLeft: "24px",
                            paddingRight: "24px",
                            fontWeight: "500",
                        }}
                        onClick={() => {
                            setActiveTab("2")
                            setPageIndex(1);
                            setPageSize(10);
                            setFilter((state) => ({ ...state, idExam: '', search: '' }));
                        }}
                    >
                        Kết quả theo chương
                    </Button>
                    <Button
                        type={activeTab === "1" ? "primary" : "default"}
                        style={{
                            backgroundColor: activeTab === "1" ? "#dc4c64" : "#f0f0f0",
                            borderColor: activeTab === "1" ? "#dc4c64" : "#f0f0f0",
                            color: activeTab === "1" ? "#fff" : "#8c8c8c",
                            borderRadius: "6px",
                            height: "40px",
                            paddingLeft: "24px",
                            paddingRight: "24px",
                            fontWeight: "500",
                        }}
                        onClick={() => {
                            setActiveTab("1")
                            setPageIndex(1);
                            setPageSize(10);
                            setFilter((state) => ({ ...state, idExam: '', search: '' }));
                        }}
                    >
                        Kết quả theo chuyên đề
                    </Button>
                </Space>
            </div>

            {/* Filters and Actions */}
            <Card style={{ marginBottom: "16px", borderRadius: "8px" }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8} md={activeTab !== '1' ? 6 : 4}>
                        <Input
                            placeholder="Tìm kiếm tên/trường học"
                            allowClear
                            prefix={<SearchOutlined />}
                            onChange={(e) => {
                                setFilter((state) => ({ ...state, search: e.target.value }));  
                            }}
                        />
                    </Col>
                    <Col xs={24} sm={8} md={activeTab !== '1' ? 6 : 5} >
                        <Select
                            placeholder="Chọn chương học"
                            style={{ width: "100%", display: activeTab !== "3" ? "block" : "none" }}
                            onChange={(value) => {
                                setFilter((state) => ({ ...state, idModule: value }));
                                if (value !== '') {
                                    dispatch(partActions.getModule({ id: value }));
                                }
                                dispatch(thematicActions.getThematicsByTeacher({ idCourse: idCourse, idModule: value, status: '', search: '', start: '', end: '', pageIndex: 1, pageSize: 99999999 }));
                                dispatch(examActions.getSyntheticExamModule({ idCourse: idCourse, idModule: value, pageSize: 999999, pageIndex: 1 }));
                            }}
                            allowClear
                            defaultValue={""}
                        >
                            {modules?.data?.filter((module) => !module?.loai_tong_hop).map((module) => (
                                <Option key={module.mo_dun_id} value={module.mo_dun_id}>
                                    {module.ten_mo_dun}
                                </Option>
                            ))}
                            <Option value="">
                                Tất cả chương học
                            </Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={5} style={{display: activeTab === "1" ? "block" : "none"}}>
                        <Select
                            placeholder="Chọn chuyên đề"
                            style={{ width: "100%",  }}
                            onChange={(value) => {
                                setFilter((state) => ({ ...state, idThematic: value }));
                                if (value !== '') {
                                    dispatch(thematicActions.getThematic({ id: value }));
                                }
                                dispatch(examActions.getSyntheticExamThematic({ idCourse: idCourse, idModule: filter.idModule, idThematic: value, pageSize: 999999, pageIndex: 1 }));
                            }}
                            allowClear
                        >
                            {thematics?.data?.map((thematic) => (
                                <Option key={thematic.chuyen_de_id} value={thematic.chuyen_de_id}>
                                    {thematic.ten_chuyen_de}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={activeTab !== '1' ? 6 : 4}>
                        <Select placeholder="Chọn đề thi" style={{ width: "100%", display: activeTab !== "3" ? "block" : "none"  }} 
                            onChange={(value) => setFilter((state) => ({ ...state, idExam: value }))  } 
                            allowClear
                        >   
                            {exams?.data?.map((exam) => (
                                <Option key={exam.de_thi_id} value={exam.de_thi_id}>
                                    {exam.ten_de_thi}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={24} md={6}>
                        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                            <Button type="primary" icon={<DownloadOutlined />} onClick={() => handleExportFile()}>
                                Xuất file
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Data Table */}
            <Card style={{ borderRadius: "8px" }}>
                <h6>Kết quả thi: {activeTab === "3" ? course?.data?.ten_khoa_hoc : activeTab === "2" ? module?.data?.ten_mo_dun : module?.data?.ten_mo_dun + ' - ' + thematic?.data?.ten_chuyen_de}</h6>
                <Table
                    columns={activeTab === "3" ? columns : columns2}
                    dataSource={activeTab === '3' ? dataSource : studentsExam?.data}
                    pagination={false}
                    scroll={{ x: 1800 }}
                    size="middle"
                />
                <Pagination showSizeChanger style={{marginTop: 8}}
                    onShowSizeChange={onShowSizeChange} 
                    current={pageIndex} 
                    pageSize={pageSize} 
                    onChange={onChange} 
                    total={studentsExam?.totalCount}
                />
            </Card>

            <Modal 
                style={{
                    maxHeight: '70vh',
                    overflowY: 'auto',
                }}
                className="cra-auth-modal"
                wrapClassName="cra-auth-modal-container"
                maskStyle={{ background: 'rgba(0, 0, 0, 0.8)' }}
                maskClosable={false}
                footer={null}
                mask={true}
                centered={true}
                visible={isShowHistoryModal}
                title="Chi tiết kết quả thi"
                onOk={handleOkHistoryModal}
                onCancel={handleOkHistoryModal}
                width={1000}
            >   
                <Table className="table-striped-rows" columns={columnsHistory} 
                    dataSource={ examUser?.data?.length > 0 &&
                        examUser?.data?.filter((item) => item.hoc_vien_id === userId)?.filter((item) => item.khoa_hoc_id === Number(idCourse))} 
                    pagination={false}
                >
                </Table>
            </Modal>


            <Modal 
                style={{
                    maxHeight: '70vh',
                    overflowY: 'auto',
                }}
                className="cra-auth-modal"
                wrapClassName="cra-auth-modal-container"
                maskStyle={{ background: 'rgba(0, 0, 0, 0.8)' }}
                maskClosable={false}
                footer={null}
                mask={true}
                centered={true}
                visible={isShowHistoryModuleModal}
                title="Chi tiết kết quả thi"
                onOk={handleOkHistoryModuleModal}
                onCancel={handleOkHistoryModuleModal}
                width={1000}
            >   
                <Table className="table-striped-rows" columns={columnsHistory} 
                    dataSource={ 
                        examUser?.data?.studentExams?.filter((item) => item.hoc_vien_id === userId)?.filter((item) => item.khoa_hoc_id === Number(idCourse))}
                    pagination={false}>
                </Table>
            </Modal>

            
        </div>
    )
}

export default ClassesManagement
