import React, { useEffect, useState } from "react";
import './css/dashboard.css';
import config from '../../../../configs/index';
import axios from "axios";

// react plugin used to create charts
import { Link } from "react-router-dom";
// antd components
import { Row, Col, notification, Card, Avatar, Typography } from "antd";
import imageStudy from 'assets/img/image-study.png';
import imageBook from 'assets/img/image-book.png';
import imageNote from 'assets/img/image-note.png';
import imageUser from 'assets/img/image-user.png';
import { PieChart, Pie, Cell } from "recharts";

import { TeamOutlined, RightOutlined, AppstoreOutlined } from '@ant-design/icons';

// redux
import { useDispatch } from "react-redux";
import * as examActions from '../../../../redux/actions/exam';
import * as notificationAction from '../../../../redux/actions/notification';

const { Title, Text } = Typography

function Dashboard() {

  const dispatch = useDispatch();

  const [Notification, setNotification] = React.useState([]);
  const [teaching, setTeaching] = React.useState([]);
  const [number, setNumber] = React.useState(0);
  const [dashboardData, setDashboardData] = useState();
  const [statisticData, setStatisticData] = useState(null)

  const getTeaching = () => {
    axios({ url: config.API_URL + `/modun/teaching`, headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } })
        .then(
            res => {
                if (res.status === 200 && res.statusText === 'OK') {
                    setTeaching(res.data.data.map((item, index) => ({...item, key: index})));
                    let students = 0;
                    res.data.data.map((item, index) => {
                      students += item.so_luong;
                      return null;
                    })
                    setNumber(students)
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

  const getDashboardData = async () => {
      axios.get(config.API_URL + '/course/dashboard-by-teacher', {headers: {Authorization: `Bearer ${localStorage.getItem('userToken')}`}})
      .then(
          res => {
              if (res.status === 200 && res.statusText === 'OK') {
                  setDashboardData(res?.data?.data[0])
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
    dispatch(notificationAction.getNOTIFICATIONsByUser({}, (res) => {
      if (res.status === 'success') setNotification(res.data.filter(note => note.loai_quyen === 1));
    }));
    getTeaching();
    getDashboardData();
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

  const StatisticsCard = ({ data }) => {
    const pieData = data?.categories?.map((category) => ({
      name: category.label,
      value: category.value,
      color: category.color,
    }));

    return (
      <Card style={{ borderRadius: "8px", height: "100%" }}>
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

  return (
      <div className="content">
        <Row className="app-main home-screen" gutter={[30, 30]} style={{paddingLeft: 0}}>
          <Col span={24}>
            <div className="border-box-widget">
              <h2 className="font-weight-5">Thống kê chung</h2>
              <div className="border-box-body">
                <h1 className="welcome-text">CHÀO MỪNG BẠN ĐẾN VỚI HỆ THỐNG QUẢN LÝ THI</h1>
                <Row gutter={[16, 16]}>

                  {teaching.length > 0 && 
                  <>
                    <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                      <div className="dashboard-stat stat-user">
                        <div className="visual">
                          <TeamOutlined />
                        </div>
                        <div className="detail">
                          <div className="number">
                            <span>{teaching.length}</span>
                          </div>
                          <Link to="/teacher/course-management" className="dashboard-stat stat-user">
                            <div className="desc">
                              Số mô-đun <RightOutlined />
                            </div>
                            <span>Giảng dạy</span>
                          </Link>
                        </div>
                      </div>
                    </Col>

                    <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                      <div className="dashboard-stat stat-user">
                        <div className="visual">
                          <TeamOutlined />
                        </div>
                        <div className="detail">
                          <div className="number">
                            <span>{number}</span>
                          </div>
                          <Link to="/teacher/course-management" className="dashboard-stat stat-user">
                            <div className="desc">
                              Số học viên <RightOutlined />
                            </div>
                            <span>Giảng dạy</span>
                          </Link>
                        </div>
                      </div>
                    </Col>
                  </>
                  }

                    <Col xl={6} lg={6} md={12} sm={12} xs={24}>
                      <Link to="/teacher/reply" className="dashboard-stat stat-image">
                        <div className="visual">
                          <AppstoreOutlined />
                        </div>
                        <div className="detail">
                          <div className="number">
                            <span>{Notification.length}</span>
                          </div>
                          <div className="desc">
                            Thông báo <RightOutlined />
                          </div>
                          <span>Giáo viên</span>
                        </div>
                      </Link>
                    </Col>

                </Row>
                

              </div>
            </div>
          
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ background: '#fff', padding: 20, borderRadius: '8px' }}>
                <Col xs={24} sm={24} md={24}>
                  <Title level={4} style={{ marginBottom: "24px", marginTop: '24px', color: "#262626" }}>
                      Thống kê khóa học
                  </Title>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{ borderRadius: "8px", background: '#F2F4F5' }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar size={48} style={{ background: "linear-gradient(180deg, rgba(41, 43, 142, 0.1) 0%, rgba(41, 43, 142, 0.3) 100%)", marginRight: "12px" }} 
                            icon={<img src={imageStudy} alt="imageStudy"/>} 
                            />
                        <div>
                            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#262626" }}>{dashboardData?.so_khoa_hoc}</div>
                            <div style={{ color: "#8c8c8c", fontSize: "14px" }}>Số lượng khóa học</div>
                        </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{ borderRadius: "8px", background: '#F2F4F5' }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Avatar size={48} style={{ background: "linear-gradient(180deg, rgba(41, 43, 142, 0.1) 0%, rgba(41, 43, 142, 0.3) 100%)", marginRight: "12px" }} 
                                icon={<img src={imageBook} alt="imageBook"/>} 
                            />
                            <div>
                                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#262626" }}>{dashboardData?.so_modun}</div>
                                <div style={{ color: "#8c8c8c", fontSize: "14px" }}>Số lượng mô đun</div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{ borderRadius: "8px", background: '#F2F4F5' }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                            size={48}
                            style={{ background: "linear-gradient(180deg, rgba(41, 43, 142, 0.1) 0%, rgba(41, 43, 142, 0.3) 100%)", marginRight: "12px" }}
                            icon={<img src={imageNote} alt="imageNote"/>}
                        />
                        <div>
                            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#262626" }}>{dashboardData?.so_chuyen_de}</div>
                            <div style={{ color: "#8c8c8c", fontSize: "14px" }}>Số lượng chuyên đề</div>
                        </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{ borderRadius: "8px", background: '#F2F4F5' }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Avatar size={48} style={{ background: "linear-gradient(180deg, rgba(41, 43, 142, 0.1) 0%, rgba(41, 43, 142, 0.3) 100%)", marginRight: "12px" }} 
                                icon={<img src={imageUser} alt="imageUser" />} 
                            />
                            <div>
                                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#262626" }}>{dashboardData?.so_hoc_vien}</div>
                                <div style={{ color: "#8c8c8c", fontSize: "14px" }}>Số lượng học viên</div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
          
            <Row gutter={[24, 24]} style={{ marginBottom: "32px", marginTop: "32px", background: '#fff', padding: 20, borderRadius: '8px' }}>
              <Col xs={24} sm={24} md={24}>
                  <Title level={4} style={{ marginBottom: "24px", marginTop: '24px', color: "#262626" }}>
                      Thống kê điểm thi
                  </Title>
              </Col>
              {statisticData?.map((data, index) => (
                <Col xs={24} md={8} key={index}>
                  <StatisticsCard data={data} />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        
      </div>
  );
}

export default Dashboard;
