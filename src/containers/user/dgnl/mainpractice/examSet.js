import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from 'react-router-dom';
// reactstrap components
import { Container, Row, Col } from "reactstrap";
import Hashids from 'hashids';
import { List, Skeleton, Button, notification } from 'antd';
import { DownloadOutlined } from "@ant-design/icons";
import moment from "moment";

import config from '../../../../configs/index';
import * as setExamAction from '../../../../redux/actions/setExam';
// core components
import RankComponent from './rank/rank';
import InfoComponent from './info/info';
import SideBarComponent from "./sidebar/SideBar";
import LoadingCustom from "components/parts/loading/Loading";
import zipIcon from 'assets/img/exam/zip-icon.png';
import docIcon from 'assets/img/exam/adope.gif';

// hooks
import useScrollToTop from "hooks/useScrollToTop";

const ExamSetOfUserPage = (props) => {
    const dispatch = useDispatch();
    const params = useParams();
    const hashids = new Hashids();
    const [fileList, setFileList] = useState([]);
    
    const setExam = useSelector(state => state.setExam.item.result);
    const loading = useSelector(state => state.setExam.item.loading);
    const error = useSelector(state => state.setExam.item.error);

    useEffect(() => {
        dispatch(setExamAction.getUserSetExam({  }, (res) => {
            if (res.status === 'success' && res.data) {
                const pdfMap = new Map(res.data.map(item => {
                    const pdfName = item.khoa_hoc_tep_tin.tep_tin.ten.replace(/\.pdf$/, "");
                    return [pdfName, item.khoa_hoc_tep_tin.tep_tin];
                }));

                dispatch(setExamAction.getSetExam({ id: hashids.decode(params.id), user: true }, (res) => {
                    if (res.status === 'success' && res.data) {
                        const fileMap = {};
                        res?.data.khoa_hoc_tep_tins.forEach((file) => {
                            if (file.tep_tin.ten.endsWith(".zip") || file.tep_tin.ten.endsWith(".rar")) {
                                if (fileMap[file.tep_tin_id]) {
                                    fileMap[file.tep_tin.tep_tin_id].zip = file.tep_tin;
                                }
                                // fileMap[file.tep_tin.tep_tin_id] = { zip: file.tep_tin, pdf: null };
                            } else if (file.tep_tin.ten.endsWith(".pdf")) {
                                fileMap[file.tep_tin_cha_id] = { pdf: file.tep_tin, zip: null };
                                // if (fileMap[file.tep_tin_cha_id]) {
                                    // fileMap[file?.tep_tin_cha_id].pdf = file.tep_tin;
                                // }
                            }
                        });
                        const updatedA = Object.values(fileMap).map(item => {
                            const zipName = item.zip?.ten?.replace(/\.zip$/, "");
                            if (pdfMap.has(zipName)) {
                                return { ...item, isExist: true };
                            }
                            return item;
                        });
                        setFileList(Object.values(updatedA));
                    } 
                }));
            }
        }));
    }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

    useScrollToTop();
    
    // download File
    const downloadFileExam = async (file) => {
        try {
            if (file?.isExist) {
                const link = document.createElement("a");
                link.href = config.API_URL + file?.zip?.duong_dan;
                link.download = file?.zip?.ten;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                notification.warning({
                    message: 'Thông báo',
                    description: 'Bạn chưa đăng ký bộ đề thi này',
                });
                return;
            }
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
                                    dataSource={fileList}
                                    renderItem={(file, index) => (
                                        <>
                                            <List.Item
                                                actions={[
                                                    <Button key={'button2' + index} shape="round" type="primary" onClick={() => downloadFileExam(file)}>
                                                        <DownloadOutlined />
                                                    </Button>
                                                ]}
                                            >
                                                <Skeleton avatar loading={false} title={false} active>
                                                    <List.Item.Meta
                                                        avatar={<img style={{width: 50}} src={zipIcon} alt={'zip_' + index}/>}
                                                        description={
                                                            <Row>
                                                                Ngày upload: {moment(file?.zip?.ngay_tao).utc(7).format(config.DATE_FORMAT_SHORT)}
                                                                <span style={{marginLeft: 12}}>Người tạo: {file?.zip?.nguoi_tao ? file?.zip?.nguoi_tao : 'admin'}</span>
                                                                <span style={{color: file?.isExist ? 'green' : 'red', marginLeft: 12, fontWeight: 700}}>
                                                                    {file?.isExist ? 'File này bạn có thể tải' : 'Bạn chưa đăng ký bộ đề thi này'}
                                                                </span>
                                                            </Row>
                                                        }
                                                        title={<span 
                                                            style={{fontWeight: 600, fontSize: 16}}
                                                        >
                                                            {file?.zip?.ten}
                                                        </span>}
                                                    />
                                                </Skeleton>
                                            </List.Item>
                                            <List.Item
                                                actions={[
                                                    <a className="ant-btn ant-btn-round ant-btn-primary" target="_blank" rel="noopener noreferrer" 
                                                        style={{fontWeight: 600, fontSize: 16}}
                                                        href={config.API_URL + file?.pdf?.duong_dan} 
                                                    >
                                                        Xem trước
                                                    </a>
                                                ]}
                                            >
                                                <Skeleton avatar loading={false} title={false} active>
                                                    <List.Item.Meta
                                                        avatar={<img style={{width: 40, marginRight: 8}} src={docIcon} alt={'pdf_' + index}/>}
                                                        description={
                                                            <Row>
                                                                Ngày upload: {moment(file?.pdf?.ngay_tao).utc(7).format(config.DATE_FORMAT_SHORT)}
                                                                <span style={{marginLeft: 12}}>Người tạo: {file?.pdf?.nguoi_tao ? file?.pdf?.nguoi_tao : 'admin'}</span>
                                                            </Row>
                                                        }
                                                        title={<span 
                                                            style={{fontWeight: 600, fontSize: 16}}
                                                        >
                                                            {file?.pdf?.ten}
                                                        </span>}
                                                    />
                                                </Skeleton>
                                            </List.Item>
                                        </>
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