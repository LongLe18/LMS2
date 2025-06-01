import { Redirect } from 'react-router-dom';

import Dashboard from './views/dashboard/Dashboard';
import CourseManagement from './views/course-management/course-management';
import CreateCourse from './views/course-management/form-course';
import CourseDetail from './views/course-management/detail-course';
import ChapterDetail from './views/course-management/chapter-detail';
import TeachingPage from './views/teach/teach';
import DealerTeacherPage from './views/dealer/dealer';
import ReplyPage from './views/reply/reply';
import ProfilePage from './views/profile/profile';

import { shouldHaveAccessPermission } from "helpers/common.helper.js";

import {
    HomeOutlined,
    CloudOutlined,
    DiffOutlined,
    SoundOutlined,
    GlobalOutlined,
} from '@ant-design/icons';

const routes = [
    {
        id: "dashboard",
        path: "/teacher/dashboard",
        name: "Dashboard",
        hide: false,
        icon: <HomeOutlined/>,
        render: (props) => <Dashboard {...props}/>, // OK
    },
    {
        id: "courseManagement",
        path: "/teacher/course-management",
        name: "Quản lý khoá học",
        hide: false,
        icon: <GlobalOutlined />,
        render: (props) => <CourseManagement {...props}/>, // OK
    },
    {
        id: "courseManagement",
        path: "/teacher/create-course",
        name: "Tạo khoá học",
        hide: true,
        icon: <GlobalOutlined />,
        render: (props) => <CreateCourse {...props}/>, // OK
    },
    {
        id: "detailCourse",
        path: "/teacher/detail-course/:id",
        name: "Chi tiết khoá học",
        hide: true,
        icon: <GlobalOutlined />,
        render: (props) => <CourseDetail {...props}/>, // OK
    },
    {
        id: "detailChapter",
        path: "/teacher/detail-chapter/:idChapter",
        name: "Chi tiết khoá học",
        hide: true,
        icon: <GlobalOutlined />,
        render: (props) => <ChapterDetail {...props}/>, // OK
    },
    {
        id: "teaching",
        path: "/teacher/teaching",
        name: "Giảng dạy",
        hide: false,
        icon: <CloudOutlined/>,
        render: (props) => (shouldHaveAccessPermission('all', '/teacher/teaching') ? <TeachingPage {...props}/> : <Redirect to="/"/>) // OK
    },
    {
        id: "dealer",
        path: "/teacher/dealer",
        name: "Đại lý",
        hide: false,
        icon: <DiffOutlined/>,
        render: (props) => (shouldHaveAccessPermission('all', '/teacher/dealer') ? <DealerTeacherPage {...props}/> : <Redirect to="/"/>) // OK
    },
    {
        id: "reply",
        path: "/teacher/reply",
        name: "Hỏi đáp",
        hide: false,
        icon: <SoundOutlined/>,
        render: (props) => (shouldHaveAccessPermission('all', '/teacher/reply') ? <ReplyPage {...props}/> : <Redirect to="/"/>) // OK
    },
    {
        id: "profile",
        path: "/teacher/profile",
        hide: true,
        name: "Tài khoản cá nhân",  
        render: (props) => <ProfilePage {...props}/>
    },
];

export default routes;