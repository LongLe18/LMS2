import { Redirect } from 'react-router-dom';

import Dashboard from './views/dashboard/Dashboard';
import CourseManagement from './views/course-management/course-management';
import CreateCourse from './views/course-management/form-course';
import CourseDetail from './views/course-management/detail-course';
import ChapterDetail from './views/course-management/chapter-detail';
import ModuleDetail from './views/course-management/module-detail';
import CriteriaManagement from './views/criteria/criteria';
import DealerTeacherPage from './views/dealer/dealer';
import ReplyPage from './views/reply/reply';
import ReplyDetailPage from './views/reply/detail-reply';
import ProfilePage from './views/profile/profile';
import ExamScoreManagement  from './views/exam-score-management/exam-score-management'
import ExamDetailPage from './views/course-management/ExamDetail';
import ClassesManagement from './views/class-management/class-management';

import { shouldHaveAccessPermission } from "helpers/common.helper.js";

import {
    HomeOutlined,
    CloudOutlined,
    DiffOutlined,
    CommentOutlined,
    GlobalOutlined,
    BarChartOutlined,
    BookOutlined,
} from '@ant-design/icons';

const routes = [
    {
        id: "dashboard",
        path: "/teacher/dashboard",
        name: "Tổng quan",
        hide: false,
        icon: <HomeOutlined/>,
        render: (props) => <Dashboard {...props}/>
    },
    {
        id: "courseManagement",
        path: "/teacher/course-management",
        name: "Quản lý khoá học",
        hide: false,
        icon: <GlobalOutlined />,
        render: (props) => <CourseManagement {...props}/>
    },
    {
        id: "classManagement",
        path: "/teacher/class-management/:courseId", // Quản lý lớp học
        name: "Quản lý lớp học",
        hide: true,
        icon: <BookOutlined />,
        render: (props) => <ClassesManagement {...props}/> // OK
    },
    {
        id: "courseManagement",
        path: "/teacher/form-course/:idCourse",
        name: "Tạo khoá học",
        hide: true,
        icon: <GlobalOutlined />,
        render: (props) => <CreateCourse {...props}/>
    },
    {
        id: "detailCourse",
        path: "/teacher/detail-course/:idCourse", // chi tiết khoá học
        name: "Chi tiết khoá học", // Chương học
        hide: true,
        icon: <GlobalOutlined />,
        render: (props) => <CourseDetail {...props}/>
    },
    {
        id: "detailChapter",
        path: "/teacher/detail-chapter/:idChapter", // chi tiết Chương học
        name: "Chi tiết Chương học",
        hide: true,
        icon: <GlobalOutlined />,
        render: (props) => <ChapterDetail {...props}/>
    },
    {
        id: "detailModule",
        path: "/teacher/module-detail/:idThematic", // Chuyên đề
        name: "Chi tiết chuyên đề",
        hide: true,
        icon: <GlobalOutlined />,
        render: (props) => <ModuleDetail {...props}/>
    },
    {
        id: "examdetail",
        path: '/teacher/exam/detail/:id',
        hide: true,
        name: "Chi tiết đề thi",
        icon: "nc-icon nc-bank",
        render: (props) => <ExamDetailPage {...props} />
    },
    {
        "id": "scorEexam",
        'path': "/teacher/score-exam",
        "name": "Quản lý điểm thi",
        "hide": false,
        "icon":  <BarChartOutlined />,
        "render": (props) =>  <ExamScoreManagement {...props}/>
    },
    {
        id: "teaching",
        path: "/teacher/criteria",
        name: "Quản lý tiêu chí",
        hide: false,
        icon: <CloudOutlined/>,
        render: (props) => <CriteriaManagement {...props}/> 
    },
    {
        id: "dealer",
        path: "/teacher/dealer",
        name: "Đại lý",
        hide: true,
        icon: <DiffOutlined/>,
        render: (props) => (shouldHaveAccessPermission('all', '/teacher/dealer') ? <DealerTeacherPage {...props}/> : <Redirect to="/"/>) // OK
    },
    {
        id: "reply",
        path: "/teacher/reply",
        name: "Hỏi đáp",
        hide: false,
        icon: <CommentOutlined />,
        render: (props) => (shouldHaveAccessPermission('all', '/teacher/reply') ? <ReplyPage {...props}/> : <Redirect to="/"/>) // OK
    },
    {
        id: "replyDetail",
        path: "/teacher/detail-reply/:idReply",
        name: "Chi tiết hỏi đáp",
        hide: true,
        icon: <CommentOutlined />,
        render: (props) => <ReplyDetailPage {...props}/>  // OK
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