// import { Redirect } from 'react-router-dom';

import LandingPage from './landing/landingPage';

var routes = [
    {
        id: "ielts",
        path: "/ielts",
        exact: true,
        hidden: true,
        render: (props) => <LandingPage {...props}/>,
    },
]

export default routes;