import { Route, Switch } from "react-router-dom";
import routes from "./routes";
import { Layout, Col, Row } from 'antd';

const { Content } = Layout;

const AuthLayout = (props) => {
    return(
        <Layout className="app-auth">
            <Content>
                <Row>
                    <Col xs={{ span: 22, offset: 1 }} lg={{ span: 7, offset: 9 }}>
                        <Switch>
                            {routes.map((prop, key) => {
                                return (
                                <Route
                                    path={prop.path}
                                    component={prop.component}
                                    key={key}
                                />
                                );
                            })}
                        </Switch>
                    </Col>
                </Row>
            </Content>
            
        </Layout>
    )
}

export default AuthLayout;