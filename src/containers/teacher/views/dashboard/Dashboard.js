import React, { useEffect, useState } from "react";
import './css/dashboard.css';
import config from '../../../../configs/index';
import axios from "axios";

// react plugin used to create charts
import { Link } from "react-router-dom";
// antd components
import { Row, Col, notification, Card, Avatar, Typography, Divider } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import imageStudy from 'assets/img/image-study.png';
import imageBook from 'assets/img/image-book.png';
import imageNote from 'assets/img/image-note.png';
import imageUser from 'assets/img/image-user.png';
import { PieChart, Pie, Cell } from "recharts";

// redux
import { useDispatch } from "react-redux";
import * as examActions from '../../../../redux/actions/exam';
import * as notificationAction from '../../../../redux/actions/notification';

const { Title, Text } = Typography

function Dashboard() {

  const dispatch = useDispatch();

  const [dashboardData, setDashboardData] = useState();
  const [statisticData, setStatisticData] = useState(null)

  const getTeaching = () => {
    axios({ url: config.API_URL + `/modun/teaching`, headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } })
        .then(
            res => {
                if (res.status === 200 && res.statusText === 'OK') {
                    let students = 0;
                    res.data.data.map((item, index) => {
                      students += item.so_luong;
                      return null;
                    })
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
      console.log(res);
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

  return (
      <div className="content" style={{ marginTop: 12}}>
        <Row className="app-main home-screen" gutter={[30, 30]} style={{paddingLeft: 0}}>
          <Col span={24}>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ background: '#fff', padding: '20px 20px 32px 20px', borderRadius: '16px' }}>
                <Col xs={12} sm={12} md={12}>
                  <Title level={4} style={{ marginTop: '12px', color: "#242424", fontWeight: 700 }}>
                      Thống kê khóa học
                  </Title>
                </Col>
                <Col xs={12} sm={12} md={12} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Link to="/teacher/course-management" style={{ float: 'right', color: '#292B8E', fontSize: '16px', fontWeight: 500 }}>
                      Xem danh sách khóa học <ArrowRightOutlined style={{marginLeft: 6}}/>
                  </Link>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{ borderRadius: "8px", background: '#F2F4F5' }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Avatar size={48} style={{ background: "linear-gradient(180deg, rgba(41, 43, 142, 0.1) 0%, rgba(41, 43, 142, 0.3) 100%)", 
                            marginRight: "12px" }} 
                            icon={<img src={imageStudy} alt="imageStudy" style={{width: '100%'}}/>} 
                          />
                          <div>
                              <div style={{ fontSize: "24px", fontWeight: 500, color: "#242424" }}>{dashboardData?.so_khoa_hoc}</div>
                              <div style={{ color: "#242424", fontSize: "14px", fontWeight: 400 }}>Số lượng khóa học</div>
                          </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{ borderRadius: "8px", background: '#F2F4F5' }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Avatar size={48} style={{ background: "linear-gradient(180deg, rgba(41, 43, 142, 0.1) 0%, rgba(41, 43, 142, 0.3) 100%)", marginRight: "12px" }} 
                                icon={<img src={imageBook} alt="imageBook" style={{width: '100%'}}/>} 
                            />
                            <div>
                                <div style={{ fontSize: "24px", fontWeight: 500, color: "#242424" }}>{dashboardData?.so_modun}</div>
                                <div style={{ color: "#242424", fontSize: "14px", fontWeight: 400 }}>Số lượng chương học</div>
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
                            icon={<img src={imageNote} alt="imageNote" style={{width: '100%'}}/>}
                        />
                        <div>
                            <div style={{ fontSize: "24px", fontWeight: 500, color: "#242424" }}>{dashboardData?.so_chuyen_de}</div>
                            <div style={{ color: "#242424", fontSize: "14px", fontWeight: 400 }}>Số lượng chuyên đề</div>
                        </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{ borderRadius: "8px", background: '#F2F4F5' }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Avatar size={48} style={{ background: "linear-gradient(180deg, rgba(41, 43, 142, 0.1) 0%, rgba(41, 43, 142, 0.3) 100%)", marginRight: "12px" }} 
                                icon={<img src={imageUser} alt="imageUser" style={{width: '100%'}}/>} 
                            />
                            <div>
                                <div style={{ fontSize: "24px", fontWeight: 500, color: "#242424" }}>{dashboardData?.so_hoc_vien}</div>
                                <div style={{ color: "#242424", fontSize: "14px", fontWeight: 400 }}>Số lượng học viên</div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
          
            <Row gutter={[24, 24]} style={{ marginTop: "32px", background: '#fff', padding: '20px 20px 32px 20px', borderRadius: '16px' }}>
              <Col xs={12} sm={12} md={12}>
                  <Title level={4} style={{ marginTop: '12px', color: "#262626" }}>
                      Thống kê điểm thi
                  </Title>
              </Col>
              <Col xs={12} sm={12} md={12} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Link to="/teacher/score-exam" style={{ float: 'right', color: '#292B8E', fontSize: '16px', fontWeight: 500 }}>
                      Xem danh sách điểm thi <ArrowRightOutlined style={{marginLeft: 6}}/>
                  </Link>
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
