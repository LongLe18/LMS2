import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import config from '../../../../configs/index';
import { useParams } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import './css/ExamDetail2.scss'
import Latex from 'react-latex-next';

// component
import LoadingCustom from 'components/parts/loading/Loading';
import { Layout, Row, Col, Button, notification, Input, Alert } from 'antd';
import NoRecord from 'components/common/NoRecord';
import { InfoCircleOutlined } from '@ant-design/icons';

// redux
import { useSelector, useDispatch } from 'react-redux';
import * as examActions from '../../../../redux/actions/exam';
import * as answerActions from '../../../../redux/actions/answer';

const { Content } = Layout;
const { TextArea } = Input;

const HistoryExam = () => {
    const params = useParams();
    const dispatch = useDispatch();

    const exam = useSelector(state => state.exam.item.result);
    const examUser = useSelector(state => state.exam.examUser.result);
    const loading = useSelector(state => state.exam.item.loading);
    const error = useSelector(state => state.exam.item.error);

    const [results, setResults] = useState([]);
    const [help, setHelp] = useState([]);

    useEffect(() => {
        dispatch(examActions.getExam({ id: params.idExam }));
        dispatch(examActions.getExamUser({ id: params.idDTHV }));
        dispatch(answerActions.getAnswersUser({ idDeThi: params.idDTHV, idQuestion: '' }, 
            (res) => {
                if (res.status === 'success') {
                    if (res.data.length > 0) {
                        let temp = [];
                        res.data.map(item => {
                            if ((item.ket_qua_chon !== null) && (item.ket_qua_chon !== '')) {// Câu trắc nghiệm
                                temp.push({ cau_hoi_id: item.cau_hoi_id, dap_an: renderAnswerKeyV2(item.ket_qua_chon)[0], 
                                    loai_dap_an: true, gia_tri_dap_an: renderAnswerKeyV2(item.ket_qua_chon)[1] });
                            }
                            else {// câu tự luận
                                temp.push({ cau_hoi_id: item.cau_hoi_id, noi_dung: item.noi_dung_tra_loi, 
                                    loai_dap_an: false, gia_tri_dap_an: item.noi_dung_tra_loi });
                            }
                            return null;
                        })
                        setResults([...results, ...temp]);
                    };
                }
            }
        ));
    }, [params.idExam]); // eslint-disable-line react-hooks/exhaustive-deps
    
    const renderAnswerKeyV2 = (dap_an) => {
        if (dap_an === '0001') return ['D', 3];
        else if (dap_an === '0010') return ['C', 2];
        else if (dap_an === '0100') return ['B', 1];
        else if (dap_an === '1000') return ['A', 0];
    };

    const renderHistoryExamSidebar = () => {
        return (
            <Col span={6}>
                {exam.status === 'success' &&
                    <div className="exam-right-content" style={{ position: 'sticky', top: '0px' }}>
                        <div className="topbar-exam">
                            <p className="mg-0">
                            <b style={{fontSize: 18}}>Số câu hỏi</b>
                            <span className="white-spread-under"></span>
                                <b style={{ color: '#fff', fontSize: 24 }}>
                                <span style={{ color: '#373636' }}>{exam.data.cau_hoi_de_this.length}</span>
                                </b>
                            </p>
                        </div>
                        <div className="exam-right-info">
                            <p className="mg-0 color-blue text-center title-list-q">
                                <b>Câu hỏi</b>
                            </p>
                            <ul>
                                {exam.status === 'success' && exam.data.cau_hoi_de_this.map((question, index) => {
                                    return (
                                        <li key={index + 1} className={isCorrectAnswer(question.cau_hoi)[0]}>
                                            <a href={`#${index + 1}`}>{index + 1}</a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                }
            </Col>
        );
    };

    const renderAnswerKey = (index) => {
        if (index === 3) return 'D';
        else if (index === 2) return 'C';
        else if (index === 1) return 'B';
        else if (index === 0) return 'A';
        else return '';
    };
    
    const convertAnswer = (answersRight) => {
        let A = '0';
        let B = '0'
        let C = '0'
        let D = '0'
        answersRight.map((answer, index) => {
            if (answer === 0) A = '1';
            else if (answer === 1) B = '1';
            else if (answer === 2) C = '1';
            else if (answer === 3) D = '1';
            return null;
        })
        return A + B + C + D;
    };

    const findIndex = (dap_an_da_chon) => {
        if (dap_an_da_chon === '1000') return 0;
        else if (dap_an_da_chon === '0100') return 1;
        if (dap_an_da_chon === '0010') return 2;
        if (dap_an_da_chon === '0001') return 3;
    };  

    const isCorrectAnswer = (question) => {
        let isRight = '';
        let index = 0;
            if (examUser.status === 'success') {
                if (examUser.data.dap_an_da_chons.length !== 0) {
                    let currentSubmitAnswer = examUser.data.dap_an_da_chons.find((item) => item.cau_hoi_id === question.cau_hoi_id);
                    if (question.dap_an_dungs && currentSubmitAnswer !== undefined) {
                        if (question.loai_cau_hoi) {
                            let answerRight = convertAnswer(question.dap_an_dungs);
                            if (currentSubmitAnswer && answerRight === currentSubmitAnswer.ket_qua_chon) {
                                isRight = 'right-answer';
                            } else if (currentSubmitAnswer && answerRight !== currentSubmitAnswer.ket_qua_chon) {
                                isRight = 'wrong-answer';
                            }
                        } else {
                            if (currentSubmitAnswer && currentSubmitAnswer.noi_dung_tra_loi === question.dap_ans[0].noi_dung_dap_an) {
                                isRight = 'right-answer';
                            } else if (currentSubmitAnswer && currentSubmitAnswer.noi_dung_tra_loi !== question.dap_ans[0].noi_dung_dap_an) {
                                isRight = 'wrong-answer';
                            }
                        }
                    }
                    if (currentSubmitAnswer !== undefined) index = findIndex(currentSubmitAnswer.ket_qua_chon);
            }
        }
        return [isRight, index];
    };
    
    const renderAnswer = (question, answer, index) => {
        let isWrong = false;
        if (isCorrectAnswer(question)[0] === 'wrong-answer') {
            if (index === isCorrectAnswer(question)[1])
                isWrong = true;    
        }

        return (
            <div className={`answer ${answer.dap_an_dung === true ? 'correct' : ''} ${ isWrong ? 'incorrect' : ''}`}>
                <span className="answer-label">{renderAnswerKey(index)}</span>
                <div className="answer-content">             
                    <Latex>{answer.noi_dung_dap_an}</Latex>
                </div>
            </div>
        );
    };

    const renderAnswerResult = (question) => {
        if (exam.status === 'success') {
            return (
                <p className="result-exam-item">
                    {question.cau_hoi.loai_cau_hoi ?
                        <span className="right-answer">Đáp án đúng {renderAnswerKey(question.cau_hoi.dap_an_dungs[0])}</span>
                        : <span className="right-answer">Đáp án đúng: {question.cau_hoi.dap_ans[0].noi_dung_dap_an}</span>
                    }
                </p>
            );
        }
    };

    const getAnswerCols = (type) => {
        if (type === 1) return 24;
        else if (type === 2) return 12;
        else if (type === 3) return 8;
        else if (type === 4) return 6;
        else return 24;
    };
    
    const renderExam = () => {
        if (error) return <NoRecord subTitle="Không tìm thấy đề thi." />;
        return (
            <Row className="question-content">
                <Col span={18}>
                    {(exam.status === 'success') &&(
                        <div className="history-header">
                            <div className="summury-result">
                                <div className="head-result">
                                    <p className="size-18 color-blue">
                                        <b>
                                        Xem lại toàn bộ đề thi <span>{exam.data.ten_de_thi}</span>
                                        </b>
                                    </p>
                                </div>
                                <div className="body-result">
                                    <div className="total_point">
                                        <p>
                                        <label className="point-label"> ĐIỂM SỐ</label>
                                        <b className="point font-weight-5">{exam.data.tong_diem}</b>
                                        </p>
                                    </div>
                                    <div className="total_point">
                                        <p className='font-weight-5'>
                                            Thời gian làm:{' '}
                                            <b>
                                                {exam.data.thoi_gian} phút
                                            </b>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>   
                    )}
                    {exam.status === 'success' && exam.data.cau_hoi_de_this.map((question, ParentIndex) => {
                        const inputString = question.cau_hoi.noi_dung;
                        const regex2 = /\\begin{center}\s*\\includegraphics(?:\[[^\]]*\])?\{([^}]*)\}\s*\\end{center}/g;
                        let urls = [];
                        let match;
                        while ((match = regex2.exec(inputString)) !== null) {
                            urls.push(match[1]); // Capture the content inside {}
                        }
                        const matches = inputString.replace(regex2, '');

                        return (
                            <>
                                {(question.cau_hoi.trich_doan && question.cau_hoi.exceprtFrom !== undefined && question.cau_hoi.exceprtTo !== undefined) &&
                                    <>
                                        {(question.cau_hoi.exceprtFrom === question.cau_hoi.exceprtTo) 
                                        ? <span className="exceprt-label">Đọc đoạn trích sau đây và trả lời cho câu hỏi {question.cau_hoi.exceprtFrom + 1}</span>
                                        : <span className="exceprt-label">Đọc đoạn trích sau đây và trả lời cho câu hỏi từ {question.cau_hoi.exceprtFrom + 1} đến {question.cau_hoi.exceprtTo + 1}</span>
                                        }
                                        <br/>
                                        <div className="answer-content" style={{paddingLeft: '20px'}}>             
                                            <Latex>{question.cau_hoi.trich_doan.noi_dung}</Latex>
                                        </div>
                                    </>
                                }
                            
                                <div className="question-list" key={ParentIndex}>
                                    
                                    <div className="question-info" id={`${ParentIndex + 1}`}>
                                        <b style={{fontSize: "22px", color: "#2e66ad"}}>Câu {ParentIndex + 1} 
                                            <span className="point">[{question.cau_hoi.diem} điểm]</span>
                                        </b>
                                        <ul className="action-links"></ul>
                                    </div>

                                    <div className="title-exam">
                                        <Latex>{matches}</Latex>
                                        {urls.length > 0 && urls.map((url, idx) => (
                                            <img src={config.API_URL + `/${url}`} alt='img'/>
                                        ))}
                                    </div>

                                    <div className="content-answer-question">
                                        <Row gutter={[20, 10]} className="multi-choice">
                                            {question.cau_hoi.dap_ans.map((answer, index) => {
                                                const isAnswered = results.find((it) => it.cau_hoi_id === question.cau_hoi_id);
                                                return (
                                                    <Col xs={24} sm={24} md={getAnswerCols(question.cau_hoi.cot_tren_hang)} key={index}>
                                                        <ul key={index}>
                                                            <li className={`item ${isAnswered && isAnswered.dap_an === renderAnswerKey(index) ? 'active' : ''}`}>
                                                                {question.cau_hoi.loai_cau_hoi ?
                                                                    <button  style={{width:"100%"}}
                                                                        className="btn-onclick"
                                                                    >
                                                                        {renderAnswer(question.cau_hoi, answer, index)}
                                                                    </button>
                                                                : <button  style={{width:"100%"}}
                                                                    className="btn-onclick"
                                                                >
                                                                    <TextArea rows={4} style={{width:"100%"}} disabled defaultValue={isAnswered !== undefined ? isAnswered.noi_dung : null}/>
                                                                </button>
                                                                }
                                                            </li>
                                                        </ul>
                                                    </Col>
                                                )
                                            })}
                                        </Row>
                                        {renderAnswerResult(question)}
                                    </div>

                                    <div className="question-actions">
                                        <Button
                                            type="default"
                                            shape="round"
                                            icon={<InfoCircleOutlined />}
                                            onClick={() => {
                                                if (!help.includes(question.cau_hoi_id)) {
                                                    setHelp([...help, question.cau_hoi_id]);
                                                } else {
                                                    setHelp(help.filter((cau_hoi_id) => cau_hoi_id !== question.cau_hoi_id));
                                                }
                                            }}
                                        >
                                            Xem lời giải
                                        </Button>
                                        <div className="question-toggle">
                                        
                                        {help.includes(question.cau_hoi_id) &&(
                                            <Alert
                                                message=""
                                                type="warning"
                                                description={
                                                    <div className="help-answer">
                                                        <Latex>{ question.cau_hoi.loi_giai }</Latex>
                                                    </div>
                                                }
                                                closable
                                                onClose={() => setHelp(help.filter((cau_hoi_id) => cau_hoi_id !== question.cau_hoi_id))}
                                            />
                                        )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    })}
                </Col>
                {renderHistoryExamSidebar()}
            </Row>
        )
    };

    return (
        <>
            {loading && <LoadingCustom/>}
            {(exam.status === 'success' && examUser.status === 'success') && 
                <Layout className={`main-app history-exam`}>
                <Helmet>
                    <title>{exam.data.ten_de_thi}</title>
                </Helmet>
                <Content className="app-content">
                    <div className="header-exam">
                        <h1>{exam.data.ten_de_thi}</h1>
                    </div>
                    <div className="wraper" style={{ padding: '0 48px' }}>{renderExam()}</div>
                </Content>
                </Layout>
            }
            {error && notification.error({
                message: 'Thông báo',
                description: 'Lấy dữ liệu đề thi thất bại',
            })}
        </>
    )
};

export default HistoryExam;