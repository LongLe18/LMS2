import React from "react";
import { useLocation } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Container,
} from "reactstrap";
import { Avatar, Image, Badge, Row, Col, Tooltip, Menu, Dropdown, Breadcrumb } from "antd";
import { BellOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import AutoLaTeX from 'react-autolatex';
import './adminNavbar.css';
// helper
import { getUserInfo, cutString } from "helpers/common.helper.js";
// import routes from "../../../containers/admin/routes.js";
import jwt_decode from 'jwt-decode';
import config from '../../../configs/index';
import moment from 'moment';
import defaultImage from 'assets/img/avatar.png';
// import { BarsOutlined } from '@ant-design/icons';
//redux
import { useDispatch } from "react-redux";
import * as userAction from '../../../redux/actions/user';
import * as notificationAction from '../../../redux/actions/notification';

function Header(props) {

  const [isOpen, setIsOpen] = React.useState(false);
  // const [dropdownOpen, setDropdownOpen] = React.useState(false);
  // const [dropdownAlert, setDropdownAlert] = React.useState(false);
  const [color, setColor] = React.useState("white");
  const sidebarToggle = React.useRef();
  const [avatar, setAvatar] = React.useState(defaultImage);

  const location = useLocation();
  const toggle = () => {
    if (isOpen) {
      setColor("transparent");
    } else {
      setColor("dark");
    }
    setIsOpen(!isOpen);
  };
  // const dropdownToggle = (e) => {
  //   setDropdownOpen(!dropdownOpen);
  // };
  // const dropdownToggleAlert = (e) => {
  //   setDropdownAlert(!dropdownAlert);
  // };
  // const getBrand = () => {
  //   let brandName = "Default Brand";
  //   routes.map((prop, key) => {
  //     if (prop.sub !== undefined) {
  //       prop.sub.map((item, index) => {
  //         if (window.location.href.indexOf(item.path) !== -1) {
  //           brandName = item.name;
  //         }
  //         return null;
  //       })
  //     }
  //     else if (window.location.href.indexOf(prop.path) !== -1) {
  //       brandName = prop.name;
  //     } else {
  //       brandName = "Quản lý Luyện thi"
  //     }
  //     return null;
  //   });
  //   return brandName;
  // };

  // function that adds color dark/transparent to the navbar on resize (this is for the collapse)
  const updateColor = () => {
    if (window.innerWidth < 993 && isOpen) {
      setColor("dark");
    } else {
      setColor("transparent");
    }
  };
  React.useEffect(() => {
    window.addEventListener("resize", updateColor.bind(this));
  });
  React.useEffect(() => {
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      sidebarToggle.current.classList.toggle("toggled");
    }
  }, [location]);

  const [state, setState] = React.useState({
    isLogin: false,
    info: {},
    notification: '',
  });

  const dispatch = useDispatch();

  React.useEffect(() => {
    if (localStorage.getItem('userToken') !== null) {
        setState(state => ({ ...state, isLogin: true, info: JSON.parse(getUserInfo()) }));
        const json_token = jwt_decode(localStorage.getItem('userToken'));
        if (json_token.role === 1) { // giáo viên
          if (JSON.parse(getUserInfo()).anh_dai_dien !== null)
            setAvatar(config.API_URL + JSON.parse(getUserInfo()).anh_dai_dien)
        } else { // nhân viên
          if (JSON.parse(getUserInfo())[0].anh_dai_dien !== null)
            setAvatar(config.API_URL + JSON.parse(getUserInfo())[0].anh_dai_dien)
        }
    }
  }, [state.isLogin]);

  // gọi api lấy thông báo
  React.useEffect(() => {
    if (localStorage.getItem('userToken') !== null) {
      const json_token = jwt_decode(localStorage.getItem('userToken'));
      if (json_token.role === 1) { //giáo viên
        dispatch(notificationAction.getNOTIFICATIONsByUser({}, (res) => {
          if (res.status === 'success') setState({...state, notification: res.data.filter(note => note.loai_quyen === 1)});
        }));
      } else if (json_token.role === 2) { // nhân viên
        dispatch(notificationAction.getNOTIFICATIONs({}, (res) => {
          if (res.status === 'success') setState({...state, 
            notification: res.data.filter(note => note.loai_quyen === 2 && note.nguoi_nhan_id === JSON.parse(getUserInfo())[0].nhan_vien_id)});
        }));
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // sự kiện xử lý xem thông báo
  const handleSeenComment = (thong_bao_id, link) => {
    // cập nhật thông báo đã xem
    const callback = (res) => {
      if (res.status === 'success') {
        if (localStorage.getItem('userToken') !== null) {
          const json_token = jwt_decode(localStorage.getItem('userToken'));
          if (json_token.role === 1) { //giáo viên
            dispatch(notificationAction.getNOTIFICATIONsByUser({}, (res) => {
              if (res.status === 'success') {
                setState({...state, notification: res.data.filter(note => note.loai_quyen === 1)});
                window.location.href = config.BASE_URL + '/teacher/reply?binh_luan_id=' + link.split('/')[link.split('/').length - 1];
              };
            }));
          } else if (json_token.role === 2) { // nhân viên
            dispatch(notificationAction.getNOTIFICATIONs({}, (res) => {
              if (res.status === 'success') {
                setState({...state, notification: res.data.filter(note => note.loai_quyen === 2 && note.nguoi_nhan_id === JSON.parse(getUserInfo())[0].nhan_vien_id)})
                window.location.href = config.BASE_URL + '/admin/reply?binh_luan_id=' + link.split('/')[link.split('/').length - 1];
              };
            }));
          }
        }
        
      }
    }
    dispatch(notificationAction.changeStatusNOTIFICATION({ id: thong_bao_id }, callback));
  };

  const onLogout = () => {
    if (localStorage.getItem('userToken') !== null) {
      const json_token = jwt_decode(localStorage.getItem('userToken'));
      if (json_token.role === 0) { // user fail
        dispatch(userAction.getUserStudent({ hoc_vien_id: json_token.userId }));
      } else if (json_token.role === 1) {
        dispatch(userAction.getUserTeacher({ giao_vien_id: json_token.userId}));
      } else {
        dispatch(userAction.getUserStaff({ nhan_vien_id: json_token.userId }));
      }
      // dispatch(userAction.logoutUser({}, (res) => {
        // if (res.status === 200 && res.statusText === 'OK') {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('_grecaptcha');
        setState(state => ({ ...state, isLogin: false, info: {} }));
        if (json_token.role === 2) props.history.push('/auth/nhanvien');
        else if (json_token.role === 1) props.history.push('/auth/giaovien');
        // }
      // }));
    } 
  };

  const menuAvatar = (
    <Menu>
      <Menu.Item icon={<UserOutlined />} key={"profile"}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={(e) => {
            e.preventDefault();
            if (localStorage.getItem('userToken') !== null) {
              const json_token = jwt_decode(localStorage.getItem('userToken'));
              if (json_token.role === 1) { //giáo viên
                props.history.push('/teacher/profile')
              } else if (json_token.role === 2) { // nhân viên
                props.history.push("/admin/profile")
              }
            }
          }}
        >
          Tài khoản
        </button>
      </Menu.Item>
      <Menu.Item icon={<BellOutlined />} key={"notification"}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => {
            if (localStorage.getItem('userToken') !== null) {
              const json_token = jwt_decode(localStorage.getItem('userToken'));
              if (json_token.role === 1) { //giáo viên
                props.history.push('/teacher/reply')
              } else if (json_token.role === 2) { // nhân viên
                props.history.push('/admin/reply')
              }
          }
          }}
        >
          Thông báo
        </button>
      </Menu.Item>
      <Menu.Item icon={<LogoutOutlined />} key={"logout"}>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => onLogout()}
        >
          Đăng xuất
        </button>
      </Menu.Item>
    </Menu>
  );

  const menuNotification = (
    state.notification !== '' && <Menu>
      <Menu.Item key={"length"}>
        <a href="#">{state.notification.length} thông báo</a>
      </Menu.Item>
      <Menu.Item>
        {state.notification.map((note, index) => 
          <button key={index} onClick={() => handleSeenComment(note.thong_bao_id, note.link_lien_ket)} 
            style={{background: !note.trang_thai ? '#f4f2f2' : 'white', border: 'none', cursor: 'pointer'}}>
            <Row>
              <Col xs={2} md={2} xl={2}>
                <BellOutlined />
              </Col>
              
              <Col xs={20} md={20} xl={20}>
                <Tooltip title={<AutoLaTeX>{`${note.noi_dung} <br/> - Gửi lúc: ${moment(note.ngay_tao).isValid() ? moment(new Date(note.ngay_tao)).utc().format(config.DATE_FORMAT_SHORT) : '-'}`}</AutoLaTeX>} color="#2db7f5" placement="bottom">
                  {note.noi_dung.length > 50 ? cutString(note.noi_dung, 50) + ' ... ' : note.noi_dung}  
                </Tooltip>   
              </Col>
            </Row>
          </button>
        )}
      </Menu.Item>
      <Menu.Item>
        <button  style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => {
            if (localStorage.getItem('userToken') !== null) {
              const json_token = jwt_decode(localStorage.getItem('userToken'));
              if (json_token.role === 1) { //giáo viên
                props.history.push('/teacher/reply')
              } else if (json_token.role === 2) { // nhân viên
                props.history.push('/admin/reply')
              }
          }}}>Xem tất cả
        </button>
      </Menu.Item>
    </Menu>
  )

  return (
    <Navbar
      color={
        props.location.pathname.indexOf("full-screen-maps") !== -1
          ? "dark"
          : color
      }
      expand="lg" style={{maxHeight:"80px", zIndex: 1}}
      className={
        props.location.pathname.indexOf("full-screen-maps") !== -1
          ? "navbar-absolute fixed-top"
          : "navbar-absolute fixed-top " +
            (color === "transparent" ? "navbar-transparent " : "")
      }
    >   
      <Container fluid>
        <div className="navbar-wrapper">
          
          {/* <div className="navbar-toggle" style={{display: 'block'}}>
            <button style={{display: 'block', padding: '0'}}
              type="button"
              ref={sidebarToggle}
              className="navbar-toggler"
              onClick={() => props.onCollapse(!props.collapsed)}
            >
              <BarsOutlined />
            </button>
          </div> */}
          {/* <NavbarBrand href="/admin/dashboard">{getBrand()}</NavbarBrand> */}
          
          <Breadcrumb>
            {JSON.parse(localStorage.getItem('dataPath'))?.length > 0 &&
              JSON.parse(localStorage.getItem('dataPath')).map((item, index) => {
                const isLast = index === JSON.parse(localStorage.getItem('dataPath'))?.length - 1;

                return (
                  <Breadcrumb.Item key={index}>
                    {!isLast && item.path ? (
                      <a
                        href={item.path}
                        onClick={(e) => {
                          e.preventDefault(); // ngăn reload trang
                          const newPath = JSON.parse(localStorage.getItem('dataPath')).slice(0, index + 1);
                          localStorage.setItem('dataPath', JSON.stringify(newPath));
                          window.location.href = item.path; // điều hướng thủ công
                        }}
                      >
                        {item.title}
                      </a>
                    ) : (
                      <span style={{ fontWeight: 600 }}>{item.title}</span>
                    )}
                  </Breadcrumb.Item>
                );
              })}
          </Breadcrumb>
        </div>
        {/* <NavLink to="/admin/dashboard">
            <img alt="..."  style={{width:'90%'}}
            className="img-no-padding img-responsive"
            src={require("assets/rank/banner.png").default}
            />
        </NavLink> */}
        <NavbarToggler onClick={toggle}>
          <span className="navbar-toggler-bar navbar-kebab" />
          <span className="navbar-toggler-bar navbar-kebab" />
          <span className="navbar-toggler-bar navbar-kebab" />
        </NavbarToggler>

        {/* Alert */}
        <div style={{display: 'flex'}}>
          <Collapse isOpen={isOpen} navbar className="justify-content-end">
              {state.notification !== '' &&
                <Dropdown
                  overlay={menuNotification}
                >
                  <a href="# " style={{marginRight: '40px'}}
                   onClick={e => e.preventDefault()} className="ant-dropdown-link"
                  >
                    <Badge count={state.notification.filter(item => item.trang_thai === false).length} offset={[6, 0]} size="small">
                      <BellOutlined />
                    </Badge>
                  </a>
                
              </Dropdown>
              }
          </Collapse>

          <Collapse isOpen={isOpen} navbar className="justify-content-end">
            {/* <Nav navbar> */}
              <Dropdown
                overlay={menuAvatar}
              >
                  <div style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                    <span style={{fontWeight: 600, marginRight: '10px'}}>
                      {(localStorage.getItem('userToken') !== null && state?.info[0] !== undefined) ?
                        state?.info[0]?.ho_ten : state?.info?.ho_ten
                      }
                    </span>
                    <Avatar size={48} 
                      src={
                        <Image
                          src={avatar}
                          style={{
                            width: 48,
                          }}
                        />
                      }
                    ></Avatar>  
                  </div>
              </Dropdown>
            {/* </Nav> */}
          </Collapse>
        </div>
      </Container>
    </Navbar>
  );
}

export default Header;