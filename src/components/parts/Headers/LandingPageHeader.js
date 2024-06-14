import React, { useState, useRef } from "react";
import 'assets/css/landingpage.css';

import { Button, Image, Row, Space, Avatar } from "antd";
import { NavLink } from 'react-router-dom';

import { BarsOutlined, CloseOutlined } from "@ant-design/icons";


function LandingPageHeader() {
  const sidebarToggle = useRef();

  const [collapsed, setCollapsed] = useState(false);
  const onCollapse = (collapsed) => {
    setCollapsed(collapsed);
  };

  return (
    <>
      <header className="landingPage">
        <nav className="nav-landingPage">
          <div className="logo">
            <NavLink to='/ielts'>
                <Image width={120} height={75} src={require('assets/img/logo/logo-2.png').default} />
            </NavLink>
          </div>
          <Row className="main-menu">
              <Space>
                <a href='/'>Trang chủ</a>
                <a href='/'>Khoá học</a>
                <a href='/'>Kiểm tra đầu vào</a>
                <a href='/'>Luyện đề</a>
                <a href='/'>Blog</a>
              </Space>
          </Row>
          <Row className="button-row">
            <Space>
              <Button id="login" type="button" >Đăng nhập</Button>
              <Button id="signup" type="primary">Đăng ký</Button>
            </Space>
          </Row>
        </nav>
        {/* Mobile */}
        <div className="navbar-wrapper navbar-mobile">

          <div className="navbar-toggle" style={{display: 'block'}}>
            <button style={{color: 'black'}}
              type="button"
              ref={sidebarToggle}
              className="navbar-toggler"
              onClick={() => onCollapse(!collapsed)}
            >
              <BarsOutlined />
            </button>
          </div>

          <div className="logo">
            <NavLink to='/ielts'>
                <Image width={120} height={75} src={require('assets/img/logo/logo-2.png').default} />
            </NavLink>
          </div>
          <div className="nav__overlay" style={{display: collapsed ? 'block' : 'none'}} onClick={() => onCollapse(!collapsed)}></div>

          <nav className="nav__mobile" style={{transform: collapsed ? 'translateX(0)' : 'translateX(-100%)'}}>
            <div className="nav__mobile-logo">
              <a
                href="/luyen-tap/kinh-doanh-khoa-hoc"
                className="simple-text logo-mini"
              >
                <Avatar src={require("assets/rank/Logo.png").default} alt="react-logo" size={40} />
              </a>
            </div>
            <div className="nav__mobile-close"><Button icon={<CloseOutlined />} onClick={() => onCollapse(!collapsed)}></Button></div>

            <ul className="header-nav header-bottom-nav nav-left  nav-divided nav-size-medium nav-spacing-medium nav-uppercase nav__mobile-list">
              <li ><a className="nav__mobile-link" href='/'>Trang chủ</a></li>
              <li ><a className="nav__mobile-link" href='/'>Khoá học</a></li>
              <li ><a className="nav__mobile-link" href='/'>Kiểm tra đầu vào</a></li>
              <li ><a className="nav__mobile-link" href='/'>Luyện đề</a></li>
              <li ><a className="nav__mobile-link" href='/'>Blog</a></li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}

export default LandingPageHeader;
