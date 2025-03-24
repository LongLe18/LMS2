import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from 'react-router-dom';
// reactstrap components
import { Container, Row, Col } from "reactstrap";
import Hashids from 'hashids';
import { List, Skeleton, Avatar, Button } from 'antd';
import { DownloadOutlined } from "@ant-design/icons";

import * as setExamAction from '../../../../redux/actions/setExam';
// core components
import RankComponent from './rank/rank';
import InfoComponent from './info/info';
import SideBarComponent from "./sidebar/SideBar";
import LoadingCustom from "components/parts/loading/Loading";
import adope from 'assets/img/exam/adope.gif';
import docIcon from 'assets/img/exam/doc-icon.png';

// hooks
import useScrollToTop from "hooks/useScrollToTop";

const ExamSetOfUserPage = (props) => {
    const dispatch = useDispatch();
    const params = useParams();
    const hashids = new Hashids();

    const setExam = useSelector(state => state.setExam.item.result);
    const loading = useSelector(state => state.setExam.item.loading);
    const error = useSelector(state => state.setExam.item.error);

    useEffect(() => {
        dispatch(setExamAction.getSetExam({ id: hashids.decode(params.id), user: true }));
    }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

    useScrollToTop();
    
    // download File
    const downloadFileExam = async (file) => {
        try {
            const link = document.createElement("a");
            link.href = 'https://hsaplus.edu.vn:3003' + file.tep_tin.duong_dan;
            link.download = file.tep_tin.ten;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download error:', error);
        }
    }

    return (
        <>
        {loading && <LoadingCustom/>}
        <div className="section section-navbars">
            {/* <Slider /> */}
            <div className="title" style={{textAlign: "center"}}>
                <h3 className="blue-text bold">{setExam?.data?.ten_khoa_hoc}</h3>
            </div>
            <Row>
                
                {/* Danh mục và quảng cáo */}
                <Col md="3" style={{padding: "0", maxWidth: "22%"}}>
                    <SideBarComponent/>
                </Col>
                {/* Main content */}
                <Col md="9" style={{alignItems: 'baseline'}}>
                    <Container style={{padding: '0', margin: '0'}}>
                        
                        <Row id="row-content">
                            <div className="title" style={{width: "100%", textAlign: "center", margin:"20px 10px"}}>
                                <h4 className="blue-text bold">ĐỀ THI TRONG {setExam?.data?.ten_khoa_hoc}</h4>
                            </div>
                            <br />
                            <Col md="8" >
                                <List
                                    bordered
                                    dataSource={setExam?.data?.khoa_hoc_tep_tins}
                                    renderItem={(file, index) => (
                                        <List.Item
                                            actions={[
                                                <Button key={'button2' + index} shape="round" type="primary" onClick={() => downloadFileExam(file)}>
                                                    <DownloadOutlined />
                                                </Button>
                                            ]}
                                        >
                                            <Skeleton avatar loading={false} title={false} active>
                                                <List.Item.Meta
                                                    avatar={<Avatar src={file?.tep_tin?.ten.includes('pdf') ? adope : docIcon} />}
                                                    title={<span style={{fontWeight: 600, fontSize: 16}}>{file?.tep_tin?.ten}</span>}
                                                />
                                            </Skeleton>
                                        </List.Item>
                                )}
                                />
                            </Col>
                            
                            <Col md="4">
                                {/* Tài khoản */}
                                <InfoComponent {...props} ></InfoComponent>
                                
                                {/* Bảng xếp hạng */}
                                <RankComponent></RankComponent>
                            </Col>
                        </Row>
                    </Container>
                </Col>
                
            </Row>
            
        </div>
        {error && !loading && <p>{error}</p>}
        </>
    );
}

export default ExamSetOfUserPage;