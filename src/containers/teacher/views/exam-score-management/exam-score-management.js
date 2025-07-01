import { useState, useEffect } from "react"
import { Card, Row, Col, Typography, Table, Tag,
  Select, Button, Space, Progress, Pagination, Avatar, 
  Divider, Spin, notification} from "antd"
import { FileExcelTwoTone, UserOutlined } from "@ant-design/icons"
import './exam-score-management.css' // Assuming you have a CSS file for styles
import { PieChart, Pie, Cell } from "recharts";
import axios from "axios";
import config from "../../../../configs/index";

import * as courseAction from '../../../../redux/actions/course';
import * as examActions from '../../../../redux/actions/exam';
import { useSelector, useDispatch } from "react-redux"; 

const { Title, Text } = Typography
const { Option } = Select

const ExamScoreManagement = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("3")
  const [filter, setFilter] = useState({
    khoa_hoc_id: '',
    de_thi_id: '',
  })
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [statisticData, setStatisticData] = useState(null)
  const [spinning, setSpinning] = useState(false);

  const courses = useSelector(state => state.course.list.result);
  const exams = useSelector(state => state.exam.list.result);
  const examsUser = useSelector(state => state.exam.listExamsUser.result);

  useEffect(() => {
    dispatch(courseAction.getCoursesByTeacher({ status: '', search: '', lkh_id: '', pageIndex: 1, pageSize: 999999999 }));
    dispatch(examActions.getSyntheticExam({ idCourse: '', pageSize: 999999, pageIndex: 1 }));
    dispatch(examActions.getExamsUserV2({ idExam: filter.de_thi_id, idCourse: filter.khoa_hoc_id, 
      type: activeTab, pageIndex: pageIndex, pageSize: pageSize }));
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
            title: `Tổng lượt thi ${item.mo_ta.replace("Đề thi ", "")}`,
            total,
            categories
          };
        }))
      }
    }))
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getColumns = (tab) => [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 60,
      align: "center",
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Khóa học', 
      dataIndex: 'ten_khoa_hoc',
      key: 'ten_khoa_hoc',
      width: 250,
    },
    ...(tab !== "3"
    ? [{
        title: 'Chương học',
        dataIndex: 'ten_mo_dun',
        key: 'ten_mo_dun',
        width: 150,
      }]
    : []),
    {
      title: "Tên đề thi",
      dataIndex: "examName",
      key: "examName",
      width: 200,
      render: (examName) => <Text strong={!!examName}>{examName}</Text>,
    },
    {
      title: "Học viên",
      dataIndex: "studentName",
      key: "studentName",
      width: 180,
      render: (studentName, record) =>
        studentName ? (
          <div className="flex items-center gap-2">
            <Avatar size={32} icon={<UserOutlined />} style={{ backgroundColor: "#87d068", marginRight: 4 }} />
            <Text>{studentName}</Text>
          </div>
        ) : null,
    },
    {
      title: "Lần thi",
      dataIndex: "attemptNumber",
      key: "attemptNumber",
      width: 80,
      align: "center" ,
    },
    {
      title: "Ngày thi",
      dataIndex: "examDate",
      key: "examDate",
      width: 150,
    },
    {
      title: "Câu đúng",
      dataIndex: "correctAnswers",
      key: "correctAnswers",
      width: 120,
      align: "center" ,
      render: (correctAnswers, record) =>
        record.studentName ? (
          <div className="flex flex-col items-center gap-1">
            <Progress
              percent={Math.round((correctAnswers / record.totalAnswers) * 100)}
              size="small"
              strokeColor="#52c41a"
              showInfo={false}
              style={{ width: 80 }}
            />
            <br/>
            <Text style={{ fontSize: 12 }}>
              {correctAnswers}/{record.totalAnswers}
            </Text>
          </div>
        ) : null,
    },
    {
      title: "Xếp hạng",
      dataIndex: "ranking",
      key: "ranking",
      width: 100,
      align: "center",
      render: (ranking, record) =>
        record.studentName && ranking ? (
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Tag
              color={getRankingColor(ranking)}
              style={{
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              {ranking <= 3 ? getRankingIcon(ranking) : ranking}
            </Tag>
          {ranking}
          </div>
        ) : null,
    },
  ]

  useEffect(() => {
    if (activeTab === "3") { // Tổng hợp
      dispatch(examActions.getSyntheticExam({ idCourse: filter.khoa_hoc_id, pageSize: 999999, pageIndex: 1 }));
    } else if (activeTab === "2") { // Chương học
      dispatch(examActions.getSyntheticExamModule({ idCourse: filter.khoa_hoc_id, idModule: '', pageSize: 999999, pageIndex: 1 }));
    } else if (activeTab === "1") { // Chuyên đề
      dispatch(examActions.getSyntheticExamThematic({ idCourse: filter.khoa_hoc_id, idModule: '', idThematic: '', pageSize: 999999, pageIndex: 1 }));
    }
    dispatch(examActions.getExamsUserV2({ idExam: filter.de_thi_id, idCourse: filter.khoa_hoc_id, 
      type: activeTab, pageIndex: pageIndex, pageSize: pageSize }));
  }, [pageSize, pageIndex, filter, activeTab]) // eslint-disable-line react-hooks/exhaustive-deps
  
  const transformData = () => {
    const flatData = []
    let stt = 1

    examsUser?.data?.forEach((exam) => {
      if (exam.de_thi_hoc_viens.length === 0) {
        // Exam with no student results
        flatData.push({
          key: `exam-${exam.de_thi_id}`,
          stt: stt++,
          examName: exam.ten_de_thi,
          studentName: "",
          studentId: null,
          attemptNumber: "",
          examDate: "",
          correctAnswers: 0,
          totalAnswers: 0,
          score: 0,
          ranking: null,
          isFirstRow: true,
          examId: exam.de_thi_id,
          ten_khoa_hoc: exam?.khoa_hoc?.ten_khoa_hoc || "",
          ten_mo_dun: exam?.mo_dun?.ten_mo_dun || "",
        })
      } else {
        // Group by student and count attempts
        const studentAttempts = {}

        exam.de_thi_hoc_viens.forEach((result) => {
          const studentId = result.hoc_vien.hoc_vien_id.toString()
          if (!studentAttempts[studentId]) {
            studentAttempts[studentId] = []
          }
          studentAttempts[studentId].push(result)
        })

        // Sort attempts by date for each student
        Object.keys(studentAttempts).forEach((studentId) => {
          studentAttempts[studentId].sort((a, b) => new Date(a.ngay_tao).getTime() - new Date(b.ngay_tao).getTime())
        })

        let isFirstExamRow = true
        Object.keys(studentAttempts).forEach((studentId) => {
          studentAttempts[studentId].forEach((result, attemptIndex) => {
            const correctAnswers = result.so_cau_tra_loi_dung || 0
            const wrongAnswers = result.so_cau_tra_loi_sai || 0
            const totalAnswers = correctAnswers + wrongAnswers || 50 // Default to 50 if no data

            flatData.push({
              key: `${exam.de_thi_id}-${result.dthv_id}`,
              stt: isFirstExamRow ? stt++ : null,
              examName:  exam.ten_de_thi,
              studentName: result.hoc_vien.ho_ten,
              studentId: result.hoc_vien.hoc_vien_id,
              attemptNumber: `Lần ${attemptIndex + 1}`,
              examDate:
                new Date(result.ngay_tao).toLocaleDateString("vi-VN") +
                " - " +
                new Date(result.ngay_tao).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              correctAnswers,
              totalAnswers,
              score: result.ket_qua_diem || 0,
              ranking: result.xep_hang,
              isFirstRow: isFirstExamRow,
              examId: exam.de_thi_id,
              ten_khoa_hoc: exam?.khoa_hoc?.ten_khoa_hoc || "",
              ten_mo_dun: exam?.mo_dun?.ten_mo_dun,
            })
            isFirstExamRow = false
          })
        })
      }
    })
    return flatData
  }
  
  const getRankingColor = (ranking) => {
    if (ranking === 1) return "#faad14" // gold
    if (ranking === 2) return "#d9d9d9" // silver
    if (ranking === 3) return "#cd7f32" // bronze
    return "#f0f0f0" // default
  }

  const getRankingIcon = (ranking) => {
    if (ranking === 1) return "🥇"
    if (ranking === 2) return "🥈"
    if (ranking === 3) return "🥉"
    return ranking.toString()
  }

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
              setFilter({ ...filter, khoa_hoc_id: value });
            }}
            placeholder="Danh mục khóa học"
        >
            <Option key={''} value={''}>Tất cả khóa học</Option>
            {options}
        </Select>
    );
  };

  const renderExams = () => {
    let options = [];
    options = exams?.data?.map((exam) => (
        <Option key={exam.de_thi_id} value={exam.de_thi_id} >{exam.ten_de_thi}</Option>
    ));
    return (
        <Select style={{width: '100%'}}
            maxTagCount="responsive"
            showSearch={true}
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            allowClear={true}
            onChange={(value) => {
              setFilter({ ...filter, de_thi_id: value });
            }}
            placeholder="Danh mục đề thi"
        >
            <Option key={''} value={''}>Tất cả đề thi</Option>
            {options}
        </Select>
    );
  };

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


// event thay đổi trang
  const onChange = (page) => {
    setPageIndex(page);
  };

  // event đổi pageSize
  const onShowSizeChange = (current, pageSize) => {
    setPageSize(pageSize)
  };

  // Export report function
  const exportReport = async () => {
    try {
        setSpinning(true)
        const response = await axios({
            url: `${config.API_URL}/student_exam/export/?de_thi_id=${filter.de_thi_id}&loai_de_thi_id=&khoa_hoc_id=${filter.khoa_hoc_id}&search`, 
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
        link.setAttribute('download', `report_diemthi.xlsx`); // Replace with your file name and extension
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setSpinning(false);
    } catch (error) {
        notification.warn({
            message: 'Cảnh báo',
            description: 'Chưa có dữ liệu đánh giá của khóa học',
        })
        console.error('Download error:', error);
        setSpinning(false);
    }
  }

  return (
    <Spin spinning={spinning} tip="Đang tải dữ liệu...">
      <div style={{  marginTop: 24, padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
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
              onClick={() => setActiveTab("3")}
            >
              Điểm thi tổng hợp
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
              onClick={() => setActiveTab("2")}
            >
              Điểm thi chương học
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
              onClick={() => setActiveTab("1")}
            >
              Điểm thi chuyên đề
            </Button>
          </Space>
        </div>

        {/* Main Content */}
        <Card style={{ borderRadius: "8px" }}>
          <Title level={4} style={{ marginBottom: "24px", color: "#262626" }}>
            {activeTab === '3' && "Danh sách điểm thi tổng hợp"}
            {activeTab === '2' && "Danh sách điểm thi chương học"}
            {activeTab === '1' && "Danh sách điểm thi chuyên đề"}
          </Title>

          {/* Filters */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }} align="middle">
            <Col xs={24} sm={8} md={6}>
              {renderCourses()}
            </Col>
            <Col xs={24} sm={8} md={6}>
              {renderExams()}
            </Col>
            <Col xs={24} sm={8} md={6}>
            </Col>
            <Col xs={24} sm={24} md={6}>
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button icon={<FileExcelTwoTone />} onClick={() => exportReport()}>Xuất báo cáo</Button>
              </Space>
            </Col>
          </Row>

          {/* Data Table */}
          <Table
            columns={getColumns(activeTab)}
            dataSource={transformData()}
            pagination={false}
            bordered
            size="middle"
            className="exam-results-table"
            rowClassName={(record, index) => {
              return record.isFirstRow ? "first-exam-row" : "student-row"
            }}
          />
          <Pagination showSizeChanger style={{marginTop: 8}}
            onShowSizeChange={onShowSizeChange} 
            current={pageIndex} 
            pageSize={pageSize} 
            onChange={onChange} 
            total={examsUser?.totalCount}
          />
        </Card>
      </div>
    </Spin>
  )
}

export default ExamScoreManagement
