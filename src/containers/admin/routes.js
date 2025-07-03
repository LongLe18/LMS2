import { Redirect } from 'react-router-dom';
import Dashboard from "./views/dashboard/Dashboard.js";
import DetailLesson from "./views/lesson/DetailLesson.js";
import DetailModule from "./views/module/DetailModule.js";
import Lesson from "./views/lesson/Lesson.js";
import LessonCate from "./views/lesson/LessonCate.js";
import ModuleCate from "./views/module/Module.js";
// import Thematic from "./views/thematic/Thematic.js";
import ThematicCate from "./views/thematic/ThematicCate.js";
import Course from "./views/course/Course";
import AccountPage from './views/account/Account.js';
import TeacherPage from './views/account/Teacher.js';
import StaffPage from './views/account/Staff.js';
import PermissionPage from './views/account/permission/Permission.js';
import ProfilePage from './views/account/profile.js';
import ExamAdminPage from './views/exam/Exam.js';
import ExamDGNLAdminPage from './views/exam/ExamDGNL.js';
import ExamDetailPage from './views/exam/ExamDetail.js';
import ExamSetPage from './views/exam/ExamSet.js';
import OnlineExamDetailPage from './views/exam/ExamDetailOnline.js';
import SampleQuestion from './views/exam/sampleQuestion.js';
import Criteria from './views/exam/criteria.js';
import Exceprt from './views/exam/Exceprt.js';
import BannerCoursePage from './views/banner/banner.js';
import ProgramPage from './views/program/program.js';
// import DocumentPage from './views/business/document.js';
import MenuPage from './views/banner/menu.js';
import BussinessCourses from './views/business/course.js';
import CourseStudentPage from './views/business/courseStudent.js';
import DiscountPage from './views/business/discount.js';
import DealerTeacherPage from './views/business/dealer.js';
import DealerPage from './views/business/dealer2.js';
import DetailDealerPage from './views/business/detaildealer';
import ReceiptPage from './views/business/receipt2.js';
import DetailReceiptPage from './views/business/detailreceipt.js';
import StatisticCourse from './views/statistic/course.js';
import StatisticTeacher from './views/statistic/teacher.js';
import StatisticStudent from './views/statistic/student.js';
import ReplyPage from './views/reply/reply.js'; 
import EvaluationPage from './views/exam/Evaluatation.js';
// system
import BankInfoPage from './views/system/bank.js';
import FooterPage from './views/system/footer.js';
import ContactPage from './views/system/contact.js';

import { shouldHaveAccessPermission, checkPermission } from "helpers/common.helper.js";

import {
  BookOutlined,
  HomeOutlined,
  TeamOutlined,
  SoundOutlined,
  FolderViewOutlined,
  CalendarOutlined,
  ContainerOutlined,
  OrderedListOutlined,
  FolderOutlined,
  SettingOutlined,
  MenuOutlined,
  FileSearchOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  CloudOutlined,
  UserOutlined,
  RedditOutlined,
  DiffOutlined,
  CopyOutlined,
  MoneyCollectOutlined,
  HddOutlined,
  ReconciliationOutlined,
  DesktopOutlined,
  BankOutlined,
  StockOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  FileOutlined,
  FileDoneOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';
import StatisticExam from './views/statistic/exam.js';
import QuestionPage from './views/exam/Question.js';
// import GenerateExam from './views/exam/GenerateExam.js';

const routes = [
  {
    id: "dashboard",
    path: "/admin/dashboard",
    name: "Dashboard",
    hide: false,
    icon: <HomeOutlined/>,
    render: (props) => <Dashboard {...props}/>, // OK
  },
  {
    id: "statistic",
    path: "/admin/statistic/course",
    name: "Thống kê",
    hide: false,
    icon: <StockOutlined />,
    sub: [{
      parent: "account",
      path: "/admin/statistic/course",
      name: "Khóa học",
      icon: <BookOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/statistic/course') ? <StatisticCourse {...props}/> : <Redirect to="/"/>) // OK
    },{
      parent: "account",
      path: "/admin/statistic/teacher",
      name: "Giáo viên",
      icon: <CopyOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/statistic/teacher') ? <StatisticTeacher {...props}/> : <Redirect to="/"/>) // OK
    },{
      parent: "account",
      path: "/admin/statistic/student",
      name: "Học viên",
      icon: <UserOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/statistic/student') ? <StatisticStudent {...props}/> : <Redirect to="/"/>) // OK
    }, {
      parent: "account",
      path: "/admin/statistic/exam",
      name: "Kết quả thi",
      icon: <FileTextOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/statistic/exam') ? <StatisticExam {...props}/> : <Redirect to="/" />)
    }]
  },
  {
    id: "account",
    path: "/admin/account/student",
    name: "Thành viên",
    hide: false,
    icon: <TeamOutlined />,
    sub: [{
      parent: "account",
      path: "/admin/account/student",
      hide: checkPermission('student') === true ? false : true,
      name: "Học viên",
      icon: <OrderedListOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/account/student') ? <AccountPage {...props}/> : <Redirect to="/"/>) // OK
    },
    {
      parent: "account",
      path: "/admin/account/teacher",
      hide: checkPermission('teacher') === true ? false : true,
      name: "Giáo viên",
      icon: <UserOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/account/teacher') ? <TeacherPage {...props}/> : <Redirect to="/"/>) // OK
    },
    {
      parent: "account",
      path: "/admin/account/admin",
      hide: checkPermission('staff') === true ? false : true,
      name: "Nhân viên",
      icon: <UserOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/account/admin') ? <StaffPage {...props}/> : <Redirect to="/"/>) // OK
    }, 
    {
      parent: "account",
      path: "/admin/account/permission",
      hide: checkPermission('position') === true ? false : true,
      name: "Quản lý quyền",
      icon: <SecurityScanOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/account/permission') ? <PermissionPage {...props}/> : <Redirect to="/"/>) // OK
    }]
  },
  {
    id: "educate",
    path: "/admin/thematic/course",
    name: "Đào tạo",
    hide: false,
    icon: <FolderViewOutlined />,
    sub: [{
      parent: "educate",
      path: "/admin/thematic/program",
      hide: checkPermission('program') === true ? false : true,
      name: "Khung chương tình",
      icon: <DiffOutlined />,
      render: (props) => <ProgramPage {...props}/>
    },
    {
      parent: "educate",
      path: "/admin/thematic/course",
      name: "Khóa học",
      hide: checkPermission('course') === true ? false : true,
      icon: <BookOutlined />,
      render: (props) => <Course {...props}/>
    }, {
      parent: "thematic",
      path: "/admin/thematic/cate",
      hide: checkPermission('modun') === true ? false : true,
      name: "Chương học",
      icon: <FolderOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/thematic/cate') ? <ModuleCate {...props}/> : <Redirect to="/"/>)
    }, {
      parent: "thematic",
      path: "/admin/thematic/thematic",
      hide: checkPermission('thematic') === true ? false : true,
      name: "Chuyên đề",
      icon: <MenuOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/thematic/thematic') ? <ThematicCate {...props}/> : <Redirect to="/"/>)
    }, {
      parent: "lesson",
      path: "/admin/lesson/lesson",
      hide: checkPermission('lesson') === true ? false : true,
      name: "Bài giảng",
      icon: <CalendarOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/lesson/lesson') ? <Lesson {...props}/> : <Redirect to="/"/>)
    }, {
      parent: "educate",
      path: "/admin/educate/course",
      hide: checkPermission('courseDescription') === true ? false : true,
      name: "Thông tin Khóa học",
      icon: <FolderOutlined />,
      render: (props) => <BussinessCourses {...props}/>
    }, ]
  },
  {
    id: "question",
    path: "/admin/question/exam",
    name: "Danh mục đề thi",
    hide: false,
    icon: <QuestionCircleOutlined />,
    sub: [{
      parent: "question",
      path: "/admin/question/criteria",
      name: "Tiêu chí đề thi",
      hide: checkPermission('syntheticCriteria') === true ? false : true,
      icon: <CloudOutlined />,
      render: (props) => <Criteria {...props}/>
    }, {
      parent: "question",
      path: "/admin/question/excerpt",
      hide: checkPermission('exceprt') === true ? false : true,
      name: "Trích đoạn đề thi",
      icon: <FileSearchOutlined />,
      render: (props) => <Exceprt {...props}/>
    }, {
      parent: "question",
      path: "/admin/question/exam",
      hide: checkPermission('exam') === true ? false : true,
      name: "Đề luyện thi",
      icon: <FileTextOutlined />,
      render: (props) => <ExamAdminPage {...props}/>
    }, {
      parent: "question",
      path: "/admin/question/examDgnl",
      hide: checkPermission('exam') === true ? false : true,
      name: "Đề mẫu ĐGNL/ĐGTD",
      icon: <FileOutlined />,
      render: (props) => <ExamDGNLAdminPage {...props}/>
    }, {
      parent: "question",
      path: "/admin/question/evaluation",
      hide: checkPermission('evaluate') === true ? false : true,
      name: "Đánh giá",
      icon: <FileDoneOutlined />,
      render: (props) => <EvaluationPage {...props}/>
    }, {
      parent: "question",
      path: "/admin/question/question",
      hide: checkPermission('question') === true ? false : true,
      name: "Danh mục câu hỏi",
      icon: <QuestionCircleOutlined />,
      render: (props) => <QuestionPage {...props}/>
    },
    {
      parent: "question",
      path: "/admin/question/exam-set",
      hide: checkPermission('examSet') === true ? false : true,
      name: "Bộ đề thi",
      icon: <FileTextOutlined />,
      render: (props) => <ExamSetPage {...props}/>
    }
  ]
  },
  {
    id: "business",
    path: "/admin/business/course",
    name: "Kinh doanh",
    hide: false,
    icon: <ContainerOutlined/>,
    sub: [{
      parent: "business",
      path: "/admin/business/courseStudent",
      hide: checkPermission('courseStudent') === true ? false : true,
      name: "Học viên - Khóa học",
      icon: <BookOutlined />,
      render: (props) => <CourseStudentPage {...props}/>
    },
    // {
    //   parent: "business",
    //   path: "/admin/business/book",
    //   name: "Tài liệu",
    //   icon: <FileTextOutlined />,
    //   render: (props) => (shouldHaveAccessPermission('all', '/admin/business/book') ? <DocumentPage {...props}/> : <Redirect to="/"/>)
    // }, 
    {
      parent: "business",
      path: "/admin/business/discount",
      name: "Khuyến mãi",
      hide: checkPermission('discountCode') === true ? false : true,
      icon: <MoneyCollectOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/business/discount') ? <DiscountPage {...props}/> : <Redirect to="/"/>)
    }, {
      parent: 'business',
      path: '/admin/business/dealer',
      name: 'Chiết khấu',
      hide: checkPermission('dealerDiscount') === true ? false : true,
      icon:  <HddOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/business/dealer') ? <DealerPage {...props}/> : <Redirect to="/"/>)
    }, {
      parent: 'business',
      path: '/admin/business/receipt',
      name: 'Hóa đơn',
      hide: checkPermission('invoice') === true ? false : true,
      icon: <ReconciliationOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/business/receipt') ? <ReceiptPage {...props}/> : <Redirect to="/"/>)
    }, {
      parent: 'business',
      path: '/admin/business/dealerTeacher',
      hide: checkPermission('dealerDiscount') === true ? false : true,
      name: 'Đại lý',
      icon: <DesktopOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/business/dealerTeacher') ? <DealerTeacherPage {...props}/> : <Redirect to="/"/>)
    }]
  },
  {
    id: "reply",
    path: "/admin/reply",
    name: "Hỏi đáp",
    hide: checkPermission('comment') === true ? false : true,
    icon: <SoundOutlined />,
    render: (props) => (shouldHaveAccessPermission('all', '/admin/reply') ? <ReplyPage {...props}/> : <Redirect to="/"/>)
  },    
  {
    id: "banner",
    path: "/admin/banner/banner",
    name: "Banner",
    hide: false,
    icon: <RedditOutlined />,
    sub: [{
      parent: "banner",
      path: "/admin/banner/banner",
      name: "Quảng cáo",
      icon: <OrderedListOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/banner/banner') ? <BannerCoursePage {...props}/> : <Redirect to="/"/>) // OK
    },
    {
      parent: "banner",
      path: "/admin/banner/menu",
      hide: checkPermission('menu') === true ? false : true,
      name: "Menu",
      icon: <CopyOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/banner/menu') ? <MenuPage {...props}/> : <Redirect to="/"/>) // OK
    }]
  },
  {
    id: "system",
    path: '/admin/system',
    name: 'Hệ thống',
    hide: false,
    icon: <SettingOutlined />,
    sub: [{
      parent: 'system',
      path: '/admin/system/bank',
      name: 'Ngân hàng',
      icon: <BankOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/system/bank') ? <BankInfoPage {...props}/> : <Redirect to="/"/>)
    }, {
      parent: 'system',
      path: '/admin/system/footer',
      hide: checkPermission('footer') === true ? false : true,
      name: 'Footer',
      icon: <InfoCircleOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/system/footer') ? <FooterPage {...props}/> : <Redirect to="/"/>)
    }, {
      parent: 'system',
      path: '/admin/system/contact',
      hide: checkPermission('contact') === true ? false : true,
      name: 'Liên hệ',
      icon: <PhoneOutlined />,
      render: (props) => (shouldHaveAccessPermission('all', '/admin/system/contact') ? <ContactPage {...props}/> : <Redirect to="/"/>)
    }]
  },
  ///// hide component
  {
    id: "system",
    path: "/admin/system",
    name: <SettingOutlined />,
    hide: true,
    icon: "nc-icon nc-sound-wave",
    render: (props) => (shouldHaveAccessPermission('all', '/admin/lesson/addcate') ? <LessonCate {...props}/> : <Redirect to="/"/>)
  },
  {
    id: "lessonadd",
    path: "/admin/lesson/addcate",
    hide: true,
    name: "Thêm mới", // thêm mới bài giảng
    icon: "nc-icon nc-simple-add",
    render: (props) => (shouldHaveAccessPermission('all', '/admin/lesson/addcate') ? <LessonCate {...props}/> : <Redirect to="/"/>)
  },
  {
    id: "lessoncate",
    path: "/admin/lesson/cate",
    hide: true,
    name: "Thêm mới", // danh mục chuyên đề (có thêm mới chuyên đề)
    icon: "nc-icon nc-simple-add",
    render: (props) => (shouldHaveAccessPermission('all', '/admin/lesson/cate') ? <ThematicCate {...props}/> : <Redirect to="/"/>)
  },
  {
    id: "lesson",
    path: "/admin/lesson/cate/:id",
    hide: true,
    name: "Danh mục", // danh mục chuyên đề (có thêm mới chuyên đề)
    icon: "nc-icon nc-map-big",
    render: (props) => (shouldHaveAccessPermission('all', '/admin/lesson/cate/:id') ? <ThematicCate {...props}/> : <Redirect to="/"/>), // OK
  },
  {
    id: "detailModule",
    path: "/admin/detailModule/:id",
    hide: true,
    name: "Chi tiết module",
    icon: "nc-icon nc-bank",
    render: (props) => (shouldHaveAccessPermission('all', '/admin/detailModule/:id') ? <DetailModule {...props}/> : <Redirect to="/"/>)
  },
  {
    id: "detailLesson",
    path: "/admin/detailLesson/:id",
    hide: true,
    name: "Chi tiết Bài giảng",
    icon: "nc-icon nc-bank",
    render: (props) => (shouldHaveAccessPermission('all', '/admin/detailLesson/:id') ? <DetailLesson {...props}/> : <Redirect to="/"/>)
  },
  {
    id: "profile",
    path: "/admin/profile",
    hide: true,
    name: "Tài khoản cá nhân",  
    render: (props) => <ProfilePage {...props}/>
  },
  {
    id: "examdetail",
    path: '/admin/exam/detail/:id',
    hide: true,
    name: "Chi tiết đề thi",
    icon: "nc-icon nc-bank",
    render: (props) => <ExamDetailPage {...props} />
  },
  {
    id: "onlineexamdetail",
    path: '/admin/onlineExam/detail/:id',
    hide: true,
    name: "Chi tiết đề thi online",
    icon: "nc-icon nc-bank",
    render: (props) => <OnlineExamDetailPage {...props} />
  },
  {
    id: "samplequestion",
    path: '/admin/sample/question/:id',
    hide: true,
    name: "Chi tiết đề thi",
    icon: "nc-icon nc-bank",
    render: (props) => <SampleQuestion {...props} />
  },
  {
    id: "account2",
    path: "/admin/account/student/:id",
    hide: true,
    name: "Học viên 2",
    icon: 'nc-icon nc-tablet-2',
    render: (props) => (shouldHaveAccessPermission('all', '/admin/account/student/:id') ? <AccountPage {...props}/> : <Redirect to="/"/>) // OK
  },
  {
    id: "business",
    path: "/admin/business/detaildealer/:id",
    hide: true,
    name: "Chi tiết chiết khấu",
    icon: 'nc-icon nc-tablet-2',
    render: (props) => (shouldHaveAccessPermission('all', '/admin/business/detaildealer/:id') ? <DetailDealerPage {...props}/> : <Redirect to="/"/>) // OK
  },
  {
    id: "business",
    path: "/admin/business/detailreceipt/:id",
    hide: true,
    name: "Chi tiết hóa đơn",
    icon: 'nc-icon nc-tablet-2',
    render: (props) => (shouldHaveAccessPermission('all', '/admin/business/detailreceipt/:id') ? <DetailReceiptPage {...props}/> : <Redirect to="/"/>) // OK
  },
  /////////////////////////////
];
export default routes;
