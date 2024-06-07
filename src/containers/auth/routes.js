import { lazy } from "react";
import Loadable from "components/parts/loading/Loadable";


// import LoginUserPage from './views/LoginUser';
// import RegisterPage from '';
// import ForgotPasswordPage from './views/ForgotPassword';
// import LoginTeacherPage from './views/login/LoginTeacher';
// import LoginAdminPage from './views/login/LoginAdmin';
// import RegisterContest from './views/RegisterContest';
// import RegisterContestB from './views/RegisterContestB';

const LoginUserPage = Loadable(lazy(() => import("./views/LoginUser")));
const RegisterPage = Loadable(lazy(() => import("./views/Register")));
const ForgotPasswordPage = Loadable(lazy(() => import("./views/ForgotPassword")));
const LoginTeacherPage = Loadable(lazy(() => import("./views/login/LoginTeacher")));
const LoginAdminPage = Loadable(lazy(() => import("./views/login/LoginAdmin")));
const RegisterContest = Loadable(lazy(() => import("./views/RegisterContest")));
const RegisterContestB = Loadable(lazy(() => import("./views/RegisterContestB")));


var routes = [
    {
        id: "register",
        path: "/auth/register",
        exact: true,
        hidden: true,
        component: RegisterPage,
    },
    {
        id: "registerContest",
        path: '/auth/dang-ky-bang-A',
        exact: false,
        hidden: true,
        component: RegisterContest,
    },
    {
        id: "registerContestB",
        path: '/auth/dang-ky-bang-B',
        exact: false,
        hidden: true,
        component: RegisterContestB,
    },
    {
        id: 'login',
        path: '/auth/hocvien',
        exact: false,
        hidden: true,
        component: LoginUserPage
    },
    {
        id: 'loginTeacher',
        path: '/auth/giaovien',
        exact: true,
        hidden: true,
        component: LoginTeacherPage
    },
    {
        id: 'loginAdmin',
        path: '/auth/nhanvien',
        exact: true,
        hidden: true,
        component: LoginAdminPage
    },
    {
        id: 'forgotpassword',
        path: '/auth/forgot-password',
        exact: false,
        hidden: true,
        component: ForgotPasswordPage
    },
]

export default routes;