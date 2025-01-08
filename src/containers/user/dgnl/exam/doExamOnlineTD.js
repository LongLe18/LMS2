import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Hashids from 'hashids';
import { Layout, Card, Button, Row, Progress, Tooltip, Tag, Space, Image, Col, Input, Checkbox,
    notification, Modal, Spin, Radio, Alert } from 'antd';
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { BookOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { getAnswerCols, secondsToMinutes, renderAnswerKeyV2 } from 'helpers/common.helper';
import './css/ExamDetailDGTD.scss';
import MathJax from 'react-mathjax';
import config from '../../../../configs/index';
import moment from 'moment';
import LoadingCustom from "components/parts/loading/Loading"
import axios from 'axios';
import useDebounce from 'hooks/useDebounce';

// redux
import { useSelector, useDispatch } from 'react-redux';
import * as examActions from '../../../../redux/actions/exam';
import * as questionActions from '../../../../redux/actions/question';
import * as courseActions from '../../../../redux/actions/course';
import * as answerActions from '../../../../redux/actions/answer';
import * as commentAction from '../../../../redux/actions/comment';
import * as evaluationActions from '../../../../redux/actions/evaluate';

const { Header, Sider, Content } = Layout;
const { TextArea } = Input;

export default function ExamOnlineDetaiDGTD() {
    const params = useParams();    
    const hashids = new Hashids();
    const userToken = localStorage.getItem('userToken');
    const dispatch = useDispatch();

    const regex = /\\begin{center}\\includegraphics\[scale = 0\.5\]{(.*?)}\\end{center}/;
    
    let timeOut = '';
    let answers = [];
    const timerId = useRef(null);
    const timeCount = useRef(null);
    const [help, setHelp] = useState([]);
    const [pause, setPause] = useState(false);
    const [results, setResults] = useState([]);
    const [isDoing, setIsDoing] = useState(true);
    const [startTime, setStartTime] = useState(0);
    const [timeToDo, setTimeToDo] = useState(null); // Thời gian làm bài
    // const [listQuestion, setListQuestion] = useState(); // danh sách câu hỏi
    const [PauseModal, contextHolder] = Modal.useModal();
    const [countSection, setCountSection] = useState(3600);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [timeToDoAllSection, setTimeToDoAllSection] = useState(null); // Thời gian làm bài các phần
    const [loadingExportFile, setLoadingExportFile] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [state, setState] = useState({
        time: 0,
        fileImg: '',
        isReplied: false,
        isEdit: false,
        idComment: 0,
        idSubcomment: 0,
        showSubcomment: false,
        sectionExam: 1,
    });

    const loading = useSelector(state => state.exam.item.loading);
    const examUser = useSelector(state => state.exam.examUser.result);
    const error = useSelector(state => state.exam.item.error);
    const exam = useSelector(state => state.exam.item.result);
    
    const textAnswer = useDebounce(localStorage.getItem('answerText'), 500);

    const [gaps, setGaps] = useState([
        { id: "gap-0" }, { id: "gap-1" },
        { id: "gap-2" }, { id: "gap-3" },
        { id: "gap-4" }, { id: "gap-5" },
        { id: "gap-6" }, { id: "gap-7" },
        { id: "gap-8" }, { id: "gap-9" },
        { id: "gap-10" }, { id: "gap-11" },
        { id: "gap-12" }, { id: "gap-13" },
        { id: "gap-14" }, { id: "gap-15" },
        { id: "gap-16" }, { id: "gap-17" },
        { id: "gap-18" }, { id: "gap-19" },
        { id: "gap-20" }, { id: "gap-21" },
        { id: "gap-22" }, { id: "gap-23" },
        { id: "gap-24" }, { id: "gap-25" },
    ])

    useEffect(() => {
        const callback = (res) => {
            
            const subCallBack = (subres) => {
                const handleExamCompletion = (info = {}) => {
                    clearInterval(timerId?.current);
                    setStartTime(0);
                    setIsDoing(false);
                    const startIndex = Array.from({ length: state.sectionExam - 1 }).reduce(
                        (sum, _, i) => sum + res?.data[`so_cau_hoi_phan_${i + 1}`],
                        0
                    );
                    const endIndex = startIndex + res?.data[`so_cau_hoi_phan_${state.sectionExam}`];
                    const partQuestions = res?.data?.cau_hoi_de_this?.slice(startIndex, endIndex);
                    
                    dispatch(
                        answerActions.getAnswersUser({ idDeThi: params.idExamUser, idQuestion: '' }, (resAnswered) => {
                            if (resAnswered.status === 'success' && resAnswered.data.length > 0) {
                                const filteredArray = resAnswered.data.filter(item1 =>
                                    partQuestions.some(item2 => item1.cau_hoi_id === item2.cau_hoi_id)
                                );
                                let temp = [];
                                filteredArray.map(item => {
                                    if ((item.ket_qua_chon !== null) && (item.ket_qua_chon !== '')) {// Câu trắc nghiệm
                                        temp.push({ cau_hoi_id: item.cau_hoi_id, dap_an: renderAnswerKeyV2(item.ket_qua_chon)[0], 
                                            loai_dap_an: true, gia_tri_dap_an: renderAnswerKeyV2(item.ket_qua_chon)[1],
                                            ket_qua_chon: item.ket_qua_chon });
                                    }
                                    else {// câu tự luận
                                        temp.push({ cau_hoi_id: item.cau_hoi_id, noi_dung: item.noi_dung_tra_loi, 
                                            loai_dap_an: false, gia_tri_dap_an: item.noi_dung_tra_loi,
                                            ket_qua_chon: item.noi_dung_tra_lo });
                                    }
                                    return null;
                                })
                                setResults([...results, ...temp.filter(item => item.dap_an?.length !== 0)]);
                                filteredArray.map(item => answers.push(item));
                            }
                        })
                    );

                    if (info.thoi_gian_lam_bai) {
                        dispatch(examActions.editExamDGTDUser({ idExam: params.idExamUser, formData: info }));
                    }
                };
            
                const handleSectionUpdate = (sectionIndex, remainingTimeExam, thoi_gian_lam_bai_phan) => {
                    setState({ ...state, sectionExam: sectionIndex });
                    setCountSection(Math.abs(remainingTimeExam));
                    setStartTime(new Date().getTime());
            
                    if (subres?.data?.thoi_gian_lam_phan) {
                        setTimeToDo(Number(thoi_gian_lam_bai_phan[phan_dang_lam - 1]));
                    }
            
                    const startIndex = Array.from({ length: sectionIndex - 1 }).reduce(
                        (sum, _, i) => sum + res?.data[`so_cau_hoi_phan_${i + 1}`],
                        0
                    );
                    const endIndex = startIndex + res?.data[`so_cau_hoi_phan_${sectionIndex}`];
                    const partQuestions = res?.data?.cau_hoi_de_this?.slice(startIndex, endIndex);
                    
                    dispatch(
                        answerActions.getAnswersUser({ idDeThi: params.idExamUser, idQuestion: '' }, (resAnswered) => {
                            if (resAnswered.status === 'success' && resAnswered.data.length > 0) {
                                const filteredArray = resAnswered.data.filter(item1 =>
                                    partQuestions.some(item2 => item1.cau_hoi_id === item2.cau_hoi_id)
                                );
                                let temp = [];
                                filteredArray.map(item => {
                                    if ((item.ket_qua_chon !== null) && (item.ket_qua_chon !== '')) {// Câu trắc nghiệm
                                        temp.push({ cau_hoi_id: item.cau_hoi_id, dap_an: renderAnswerKeyV2(item.ket_qua_chon)[0], 
                                            loai_dap_an: true, gia_tri_dap_an: renderAnswerKeyV2(item.ket_qua_chon)[1],
                                            ket_qua_chon: item.ket_qua_chon });
                                    }
                                    else {// câu tự luận
                                        temp.push({ cau_hoi_id: item.cau_hoi_id, noi_dung: item.noi_dung_tra_loi, 
                                            loai_dap_an: false, gia_tri_dap_an: item.noi_dung_tra_loi,
                                            ket_qua_chon: item.noi_dung_tra_lo });
                                    }
                                    return null;
                                })
                                setResults([...results, ...temp.filter(item => item.dap_an?.length !== 0)]);
                                filteredArray.map(item => answers.push(item));
                            }
                        })
                    );
                };
            
                if (subres.data.thoi_diem_ket_thuc !== null) {
                    ///// Xử lý trường hợp Khi đã nộp bài
                    // Nếu có thời gian kết thúc => đã nộp bài
                    handleExamCompletion();
                    return;
                }
            
                let phan_dang_lam = subres?.data?.phan_dang_lam;
                const thoi_gian_lam_bai_phan = subres?.data?.thoi_gian_lam_phan.split(',');
                setTimeToDoAllSection(thoi_gian_lam_bai_phan);
            
                for (let i = 0; i < res?.data.so_phan; i++) {
                    const remainingTimeExam = (
                        Number(res.data[`thoi_gian_phan_${phan_dang_lam}`]) -
                        thoi_gian_lam_bai_phan[phan_dang_lam - 1]
                    ) * 60;
                    // Nếu phần đang làm chưa tới phần cuối cùng
                    if (phan_dang_lam === res?.data.so_phan && remainingTimeExam <= 0) {
                        let info = {};
                        if (subres.data.thoi_diem_ket_thuc === null) {
                            info = {
                                "thoi_gian_lam_bai": secondsToMinutes(res.data.thoi_gian * 60),
                                "thoi_diem_ket_thuc": moment().toISOString(),
                            }
                        } else {
                            info = {
                                "thoi_gian_lam_bai": secondsToMinutes(res.data.thoi_gian * 60),
                            }
                        }
                        handleExamCompletion(info);
                        break;
                    } else if (phan_dang_lam < res?.data.so_phan && remainingTimeExam <= 0) {
                        phan_dang_lam += 1;
                        continue;
                    } else if (phan_dang_lam <= res?.data.so_phan && remainingTimeExam > 0) {
                        handleSectionUpdate(phan_dang_lam, remainingTimeExam, thoi_gian_lam_bai_phan);
                        break;
                    }
                }
            };

            if (res.status === 'success') {
                dispatch(evaluationActions.getEVALUATEsDGTD({ idCourse: hashids.decode(params.idExam), pageIndex: 1, pageSize: 1000 })); // lấy đánh giá
                dispatch(examActions.getExamUser({ id: params.idExamUser }, subCallBack)) // Gọi API để lấy thông tin (Thời gian bắt đầu, thời gian kết thúc)
            }
        }
        // remove value with text question
        localStorage.removeItem('answerText');
        localStorage.removeItem('question');

        dispatch(examActions.getExam({ id: hashids.decode(params.idExam), type: 'dgtd' }, callback));
        dispatch(commentAction.getCOMMENTs({ idCourse: '', idModule: '', type: 1 }));
        
        dispatch(courseActions.getCourse({ id: hashids.decode(params.idCourse) }));
    }, [params.idExam, params.idExamUser]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleDragEnd = (result) => {
        if (!result.destination) return
    
        const { source, destination } = result
    
        if (destination.droppableId === "word-bank") {
          if (source.droppableId.startsWith("gap")) {
            setGaps((prev) =>
                prev.map((gap) =>
                    gap.id === source.droppableId ? { ...gap, userWord: undefined } : gap
                )
            )
          }
          return
        }
        
        let index = 0;
        if (destination.droppableId.startsWith("gap")) {
            if (source.index !== 0) index = 1 * source?.index;
            const word = exam?.data?.cau_hoi_de_this?.find((w) => (w.cau_hoi_id + index).toString() === result.draggableId);
            if (!word) return;

            localStorage.setItem('question', null);
            localStorage.setItem('question', JSON.stringify(word));
    
            if (source.droppableId.startsWith("gap")) {
                setGaps((prev) =>
                    prev.map((gap) =>
                        gap.id === source.droppableId ? { ...gap, userWord: undefined } : gap
                    )
                )
            }
            const lua_chon = word?.cau_hoi?.lua_chon?.noi_dung?.replace(/\n/g, "").split(';').filter(item => item !== '');
            setGaps((prev) =>
                prev.map((gap) => 
                    gap.id === destination.droppableId ? { ...gap, userWord: lua_chon[source.index], questionId: Number(result.draggableId) - index } : gap
                )
            )
        }
    }

    // Hàm xử lý đếm ngược thời gian khi click "Phần tiếp theo"
    const countDown = () => {
        let secondsToGo = 30;
    
        const instance = PauseModal.success({
            title: 'Đã hết thời gian cho phần này',
            content: `Phần tiếp theo sẽ bắt đầu ngay sau ${secondsToGo} giây.`,
            okText: 'Làm ngay phần tiếp theo',
            onOk: () => {
                // Bắt đầu làm luôn phần thi mới
                clearTimeout(timeOut); // Huỷ chờ đếm ngược
                clearInterval(timerId?.current); // Dừng đếm thời gian section
                clearInterval(timeCount?.current); // Dừng đếm thời gian làm bài phần cũ

                sessionStorage.setItem('section', state.sectionExam + 1);
                sessionStorage.setItem('timeStartSection', new Date().getTime());
                setCountSection(exam.data[`thoi_gian_phan_${state.sectionExam + 1}`] * 60) // set biến đêm Thời gian = của phần tiếp theo
                setState(prevState => ({
                    ...prevState,
                    sectionExam: prevState.sectionExam + 1
                }));
                timerId.current = setInterval(() => {
                    setCountSection((preCount) => preCount - 1);
                }, 1000);
                setResults([]); 
                window.scrollTo({ top: 0, behavior: "smooth" });
                // thiết lập tiếp bộ đếm thời gian làm bài
                dispatch(examActions.getExamUser({ id: params.idExamUser }, (res) => {
                    if (res.status === 'success') {
                        // 1 phút cập nhật thời gian làm bài 1 lần
                        if (res?.data?.thoi_gian_lam_phan) setTimeToDo(Number(res?.data?.thoi_gian_lam_phan.split(',')[state.sectionExam])); // là số phút
                        timeCount.current = setInterval(() => {
                            setTimeToDo((preValue) => preValue + 1); // Mỗi lần tăng lên 1 phút
                        }, 60000)
                    }
                }));
                instance.destroy();
            }
        });
    
        const timer = setInterval(() => {
            secondsToGo -= 1;
            instance.update({
                content: `Phần tiếp theo sẽ bắt đầu ngay sau ${secondsToGo} giây.`,
            });
        }, 1000);
    
        setTimeout(() => {
            clearInterval(timer);
            instance.destroy();
        }, secondsToGo * 1000);
    };

    // Hàm kiểm tra câu hỏi trả lời đúng hay không
    const isCorrectAnswer = (question) => {
        let isRight = '';
        if (!isDoing && examUser.status === 'success') {
            if (examUser.data.dap_an_da_chons) {
                let currentSubmitAnswer = examUser.data.dap_an_da_chons.find((item) => (item.cau_hoi_id === question.cau_hoi_id && item.ket_qua_chon !== '0000'));
                if (question.dap_an_dungs && currentSubmitAnswer !== undefined) {
                    if (question.loai_cau_hoi === 1 || question.loai_cau_hoi === 2 || question.loai_cau_hoi === 3 || question.loai_cau_hoi === 4) { // Câu trắc nghiệm
                        let answerRight = convertAnswer(question.dap_an_dungs, currentSubmitAnswer?.ket_qua_chon);
                        if (currentSubmitAnswer && answerRight === currentSubmitAnswer.ket_qua_chon) {
                            isRight = 'right-answer';
                        } else if (currentSubmitAnswer && answerRight !== currentSubmitAnswer.ket_qua_chon) {
                            isRight = 'wrong-answer';
                        }
                    } else if (question.loai_cau_hoi === 0 || question.loai_cau_hoi === 5 || question.loai_cau_hoi === 6) { // Câu tự luận
                        if (currentSubmitAnswer && question?.dap_ans[0]?.noi_dung_dap_an
                            .replaceAll('<b>', '')
                            .replaceAll('</b>', '')
                            .replaceAll('<em>', '')
                            .replaceAll('</em>', '')
                            .replaceAll('<u>', '')
                            .replaceAll('</u>', '')
                            .trim()
                            .toLowerCase() === (currentSubmitAnswer.noi_dung_tra_loi).toLowerCase()) 
                        {
                            isRight = 'right-answer';
                        } else if (currentSubmitAnswer && question?.dap_ans[0]?.noi_dung_dap_an
                            .replaceAll('<b>', '')
                            .replaceAll('</b>', '')
                            .replaceAll('<em>', '')
                            .replaceAll('</em>', '')
                            .replaceAll('<u>', '')
                            .replaceAll('</u>', '')
                            .trim()
                            .toLowerCase() !== (currentSubmitAnswer.noi_dung_tra_loi).toLowerCase()) 
                        {
                            isRight = 'wrong-answer';
                        }
                    }
                }
            }
        }
        return isRight;
    };

    // check full screen
    useEffect(() => {
        const handleFullscreenChange = () => {
            const fullscreenElement = document.fullscreenElement
            setIsFullscreen(!!fullscreenElement)

            if (!fullscreenElement) {
                // Custom action when fullscreen is exited
                clearInterval(timerId?.current); // Dừng đếm thời gian section
                clearInterval(timeCount?.current); // Dừng đếm thời gian làm bài phần cũ
                }
        }
    
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, []);

    // 1 phút cập nhật thời gian làm bài 1 lần
    useEffect(() => {
        if (timeToDo && isDoing) {
            let temp = timeToDoAllSection; 
            temp[state.sectionExam - 1] = timeToDo; // cập nhật thời gian làm bài của phần tương ứng
            const thoi_gian_lam_bai = temp.reduce((partialSum, a) => Number(partialSum) + Number(a), 0) // tổng thời gian làm bài
            setTimeToDoAllSection(temp);
            let info = {
                thoi_gian_lam_bai: secondsToMinutes(timeToDo === 0 ? 60 : thoi_gian_lam_bai * 60),
                phan_dang_lam: Number(state.sectionExam),
                thoi_gian_lam_phan: timeToDoAllSection.join(','),
            }
            dispatch(examActions.editExamDGTDUser({ idExam: params.idExamUser, formData: info }))
        }
    }, [timeToDo]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        // Khi hết thời gian mà đang ở phần cuối => nộp bài
        if (countSection <= 0 && state.sectionExam === exam.data.so_phan) {
            setIsDoing(false);
            clearInterval(timerId?.current);
            Modal.warning({
                title: 'Hết giờ làm bài',
                content: 'Bài thi tự động kết thúc khi hết giờ làm bài.',
            });
            onSaveHistory();
        } else if (countSection <= 0 && state.sectionExam < exam.data.so_phan) { // Khi hết thời gian mà đang không phải phần cuối => chuyển sang phần tiếp theo
            countDown();
            clearInterval(timerId?.current); // Dừng đếm thời gian section
            clearInterval(timeCount?.current); // Dừng đếm thời gian làm bài phần cũ

            timeOut = setTimeout(() => { // Chờ 30s 
                sessionStorage.setItem('section', state.sectionExam + 1);
                sessionStorage.setItem('timeStartSection', new Date().getTime());
                setCountSection(exam.data[`thoi_gian_phan_${state.sectionExam + 1}`] * 60) // set biến đêm Thời gian = của phần tiếp theo
                setState(prevState => ({
                    ...prevState,
                    sectionExam: prevState.sectionExam + 1
                }));
                timerId.current = setInterval(() => {
                    setCountSection((preCount) => preCount - 1);
                }, 1000);
                setResults([]); 
                window.scrollTo({ top: 0, behavior: "smooth" });
                // thiết lập tiếp bộ đếm thời gian làm bài
                dispatch(examActions.getExamUser({ id: params.idExamUser }, (res) => {
                    if (res.status === 'success') {
                        // 1 phút cập nhật thời gian làm bài 1 lần
                        if (res?.data?.thoi_gian_lam_phan) setTimeToDo(Number(res?.data?.thoi_gian_lam_phan.split(',')[state.sectionExam])); // là số phút
                        timeCount.current = setInterval(() => {
                            setTimeToDo((preValue) => preValue + 1); // Mỗi lần tăng lên 1 phút
                        }, 60000)
                    }
                }));
            }, 30000);
        }     
    }, [countSection]); // eslint-disable-line react-hooks/exhaustive-deps

    // event chuyển full screen
    const enterFullscreen = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();

            if (isDoing) {
                timerId.current = setInterval(() => {
                    setCountSection((preCount) => preCount - 1);
                }, 1000);
                timeCount.current = setInterval(() => {
                    setTimeToDo((preValue) => preValue + 1); // Mỗi lần tăng lên 1 phút
                }, 60000)
            }
        }
    }

    // Xử lý lưu đáp án đã chọn của câu hỏi 'Kéo thả'
    useEffect(() => {
        let value;
        const question = localStorage.getItem('question');
        localStorage.setItem('answerText', null);
        const isAnswered = results.find((it) => it.cau_hoi_id === question.cau_hoi_id);
        if (isAnswered) {
            value = gaps.find((it) => it.cau_hoi_id === question.cau_hoi_id).filter(item => item.userWord).map(item => item.userWord).join(';');
        } else value = gaps.filter(item => item.userWord).map(item => item.userWord).join(';');
        localStorage.setItem('answerText', value);
    }, [gaps]); // eslint-disable-line react-hooks/exhaustive-deps

    // cập nhập đáp án câu hỏi tự luận
    useMemo(() => {
        if (textAnswer !== null && localStorage.getItem('question') !== null) {
            dispatch(answerActions.getAnswersUser({ idDeThi: params.idExamUser, idQuestion: '' }, 
                (res) => {
                    if (res.status === 'success') {
                        // eslint-disable-next-line react-hooks/exhaustive-deps
                        answers = res.data;
                        onChangeAnswerText(textAnswer, JSON.parse(localStorage.getItem('question')))
                    }
                }
            ))
        }
    }, [textAnswer]); // eslint-disable-line react-hooks/exhaustive-deps

    // Xử lý lưu đáp án tự luận
    const onChangeAnswerText = (value, question) => {
        if (isDoing && localStorage.getItem('question') !== null) {
            const isAnswered = answers.find((item) => item.cau_hoi_id === question.cau_hoi_id);
            if (isAnswered) {
                // Biến này để lưu vào state results
                const newAnsers2 = results.map((item) => (item.cau_hoi_id === question.cau_hoi_id ? { ...item, noi_dung: value, gia_tri_dap_an: value, loai_dap_an: false, ket_qua_chon: value } : item));
                setResults(newAnsers2);

                const submit = {
                    "ket_qua_chon": "",
                    "noi_dung_tra_loi": value?.trim().toLowerCase(),
                    "dthv_id": params.idExamUser,
                    "cau_hoi_id": question.cau_hoi_id
                }
                dispatch(answerActions.editAnswerUser({ id: isAnswered.dadc_id, formData: submit }));
            } else {
                setResults([...results, { cau_hoi_id: question.cau_hoi_id, noi_dung: value, gia_tri_dap_an: value, loai_dap_an: false }]);
                
                const tu_luan = [{
                    "noi_dung": value?.trim().toLowerCase(),
                    "cau_hoi_id": question.cau_hoi_id
                }]
                const submit = {
                    "ket_qua_chons": [],
                    "noi_dung_tra_lois": tu_luan,
                    "dthv_id": params.idExamUser
                }
                dispatch(answerActions.createAnswerUser(submit));
            }
        }
    };

    // hàm xử lý đánh dấu câu hỏi
    const handleMarkQuestion = (question) => {
        dispatch(questionActions.getQuestionExam({ idQuestion: question.chdt_id }, (res) => {
            if (res.status === 'success') {
                const data = {"danh_dau": res.data.danh_dau === 0};
                dispatch(questionActions.editQuestionExam(
                    { idQuestionExam: question.chdt_id, formData: data, type: 'v2' }, (res) => {
                        if (res.status === 'success') {
                            dispatch(examActions.getExam({ id: hashids.decode(params.idExam), type: 'dgtd' }));
                        }
                    }
                ));
            }
        }))
    }

    const getTypeQuestion = (type) => {
        switch (type) {
            case 0:
                return 'Tự luận';
            case 1:
                return 'Trắc nghiệm';
            case 2:
                return 'Trắc nghiệm nhiều lựa chọn';
            case 3:
                return 'Nhiều lựa chọn đúng sai';
            case 4:
                return 'Đúng sai';
            case 5:
                return 'Tự luận nhiều vị trí'
            default:
                return 'Kéo thả';
        }
    }

    // hàm xử lý chọn đáp án
    const onChooseAnswer = (question, answerKey, index, answered, value) => {
        if (isDoing) { // Nếu đang làm bài
            let isAnswered = answered.find((item) => item.cau_hoi_id === question.cau_hoi_id);
            if (isAnswered) { // Nếu đã trả lời
                // Cập nhật lại đáp án đã chọn
                const choosed = results.find((it) => it.cau_hoi_id === question.cau_hoi_id)?.dap_an.includes(renderAnswerKey(index));
                if (question.cau_hoi.loai_cau_hoi === 1) isAnswered.ket_qua_chon = "0".repeat(question?.cau_hoi?.dap_ans?.length);

                if (question?.cau_hoi?.loai_cau_hoi === 3 || question?.cau_hoi?.loai_cau_hoi === 4) {
                    isAnswered.ket_qua_chon = isAnswered.ket_qua_chon.substring(0, index) + (value === true ? '1' : '0') + isAnswered.ket_qua_chon.substring(index + 1);
                }
                else isAnswered.ket_qua_chon = isAnswered.ket_qua_chon.substring(0, index) + (choosed ? '0' : '1') + isAnswered.ket_qua_chon.substring(index + 1); // Thay 1 vào vị trí index của ket_qua
                
                let newAnsers2;
                if (renderAnswerKeyV2(isAnswered?.ket_qua_chon)[0]?.length === 0 && question.cau_hoi.loai_cau_hoi === 1) {
                    // Xóa phần tử có id tương ứng trong results
                    newAnsers2 = results.filter(item => item.cau_hoi_id !== question.cau_hoi_id);
                } else {
                    const dap_an_ton_tai = results.find((item) => item.cau_hoi_id === question.cau_hoi_id)
                    newAnsers2 = dap_an_ton_tai ? results.map((item) => 
                        (
                            item.cau_hoi_id === question.cau_hoi_id ? { ...item, 
                            dap_an: renderAnswerKeyV2(isAnswered?.ket_qua_chon)[0], 
                            gia_tri_dap_an: renderAnswerKeyV2(isAnswered?.ket_qua_chon)[1], 
                            loai_dap_an: true,
                            ket_qua_chon: isAnswered?.ket_qua_chon } : item
                        )
                    )
                    : [
                        ...results, {
                            cau_hoi_id: question.cau_hoi.cau_hoi_id,
                            dap_an: renderAnswerKeyV2(isAnswered?.ket_qua_chon)[0], 
                            gia_tri_dap_an: renderAnswerKeyV2(isAnswered?.ket_qua_chon)[1], 
                            loai_dap_an: true,
                            ket_qua_chon: isAnswered.ket_qua_chon
                        }
                    ]
                }
                setResults(newAnsers2);
                
                const submit = {
                    "ket_qua_chon": isAnswered.ket_qua_chon,
                    "noi_dung_tra_loi": "",
                    "dthv_id": params.idExamUser,
                    "cau_hoi_id": question.cau_hoi_id
                }
                dispatch(answerActions.editAnswerUser({ id: isAnswered.dadc_id, formData: submit }, (res) => {
                    if (res.status === 200 && res.statusText === 'OK') setPause(false);
                }));
            } else {
                let ket_qua = question?.cau_hoi?.dap_ans?.length === 4 ? '0000' : "0".repeat(question?.cau_hoi?.dap_ans?.length);
                if (question?.cau_hoi?.loai_cau_hoi === 3 || question?.cau_hoi?.loai_cau_hoi === 4) {
                    ket_qua = ket_qua.substring(0, index) + (value === true ? '1' : '0') + ket_qua.substring(index + 1); // Thay 1 vào vị trí index của ket_qua
                }
                else ket_qua = ket_qua.substring(0, index) + '1' + ket_qua.substring(index + 1); // Thay 1 vào vị trí index của ket_qua
                setResults([...results, { cau_hoi_id: question.cau_hoi_id, dap_an: [answerKey], gia_tri_dap_an: [index], loai_dap_an: true, ket_qua_chon: ket_qua }]);
                
                let trac_nghiem_submit = [];
                trac_nghiem_submit.push({
                    "ket_qua":ket_qua,
                    "cau_hoi_id": question.cau_hoi_id
                });

                const submit = {
                    "ket_qua_chons":trac_nghiem_submit,
                    "noi_dung_tra_lois": '',
                    "dthv_id": params.idExamUser
                }
                dispatch(answerActions.createAnswerUser(submit, (res) => {
                    if (res.status === 200 && res.statusText === 'OK') setPause(false);
                }));
            }
        }
    };

    // Hàm UI hiển thi đáp án đúng
    const renderAnswerResult = (question) => {
        let regex = /\\begin{center}\\includegraphics\[scale = 0\.5\]{(.*?)}\\end{center}/;

        if (!isDoing && exam.status === 'success') {
            return (
                <p className="result-exam-item">
                    {(question.cau_hoi.loai_cau_hoi === 1 || question.cau_hoi.loai_cau_hoi === 2 || question.cau_hoi.loai_cau_hoi === 3) ?
                        <span className="right-answer">Đáp án đúng {question?.cau_hoi?.dap_an_dungs?.map((item) => renderAnswerKey(item)).join(', ')}</span> 
                        : <span className="right-answer">Đáp án đúng: 
                            <MathJax.Provider>
                                {question?.cau_hoi?.dap_ans[0]?.noi_dung_dap_an.split('\n').map((item, index_cauhoi) => {
                                    return (
                                        <div key={index_cauhoi}> 
                                        {
                                            (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                <Image src={config.API_URL + `/${item.match(regex)[1]}`} alt={`img_cauhoi_${index_cauhoi}`}></Image>
                                            ) : (
                                                item.split('$').map((item2, index2) => {
                                                    return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                        <MathJax.Node key={index2} formula={item2} />
                                                    ) : (
                                                        <span dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                    )
                                                })
                                            )
                                        }
                                        </div>
                                    )}
                                )}
                            </MathJax.Provider>
                        </span>
                    }
                </p>
            );
        }
    };

    // Tải báo cáo đánh giá TD
    const exportEvaluationDGTD = async () => {
        try {
            setLoadingExportFile(true);
            const response = await axios({
                url: `${config.API_URL}/evaluate-dgtd/${params.idExamUser}/export-report`, 
                method: 'GET',
                responseType: 'blob', 
                headers: {
                    Authorization: `Bearer ${userToken}`,
                }
            });

            // Create a URL for the file
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const fileName = `DG_${userInfo.hoc_vien_id}_${userInfo.ho_ten}.pdf`
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); // Replace with your file name and extension
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            setLoadingExportFile(false);
        } catch (error) {
            console.error('Download error:', error);
            setLoadingExportFile(false);
        }
    }

    const renderTitleQuestion = (question) => {
        const isAnswered = results.find((it) => it.cau_hoi_id === question.cau_hoi_id);
        let answerTemp = [];
        if (isAnswered) answerTemp = isAnswered?.noi_dung?.split(';');

        let indexOfEmptyBox = 0; // Số thứ tự ô trống    
        return (
            <div className="title-exam">
                <MathJax.Provider>
                    {question.cau_hoi?.noi_dung.split('\n').filter(item => item !== '').map((item, index_cauhoi) => {
                        const partQuestion = item.split('{ENTER}');

                        return (
                            <div className="title-exam-content" key={item.cau_hoi_id}>
                                {
                                    (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                        <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                                            <Image src={config.API_URL + `/${item?.match(regex)[1]}`} alt={`img_question4_${index_cauhoi}`}></Image>
                                        </div>
                                    ) : 
                                    (
                                        <div style={{textAlign: 'justify'}}>
                                            {partQuestion.map((item2, index2) => {
                                                const partCauhoi = item2.split('$');
                                                return (
                                                    <div key={index2}>
                                                        {partCauhoi.map((chi_tiet, index_2) => {
                                                            return (item.indexOf('$' + chi_tiet + '$') !== -1 && (chi_tiet.includes('{') || chi_tiet.includes('\\')) && (!chi_tiet.includes('\\underline') && !chi_tiet.includes('\\bold') && !chi_tiet.includes('\\italic'))) ? (
                                                                <MathJax.Node key={index_2} formula={chi_tiet} />
                                                            ) : (
                                                                <span dangerouslySetInnerHTML={{ __html: chi_tiet }}></span>
                                                            )
                                                        })}
                                                        {index2 < partQuestion.length - 1 && (<span style={{display: 'none'}}>{indexOfEmptyBox += 1}</span>)}
                                                        {index2 < partQuestion.length - 1 && (
                                                            <Input className={`empty-box`} id={indexOfEmptyBox} style={{maxWidth: 120}} placeholder='Nhập đáp án' rows={1} disabled={!isDoing} 
                                                                defaultValue={(isAnswered !== undefined) ? answerTemp[indexOfEmptyBox - 1] : null}
                                                                onChange={(e) => {
                                                                    // Xử lý lưu đáp án đã nhập
                                                                    while (answerTemp.length < partQuestion.length - 1) {
                                                                        answerTemp.push('');
                                                                    }
                                                                    answerTemp[e.target.id - 1] = e.target.value;
                                                                    
                                                                    localStorage.setItem('answerText', null);
                                                                    localStorage.setItem('question', null);
                                                                    localStorage.setItem('answerText', answerTemp.join(';'));
                                                                    localStorage.setItem('question', JSON.stringify(question));   
                                                                }
                                                            }/>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )
                                }
                            </div>
                        )}
                    )}
                </MathJax.Provider>
            </div>
        )
    }

    const renderAnswerKey = (index) => {
        if (index === 9) return 'K';
        else if (index === 8) return 'J';
        else if (index === 7) return 'H';
        else if (index === 6) return 'G';
        else if (index === 5) return 'F';
        else if (index === 4) return 'E';
        else if (index === 3) return 'D';
        else if (index === 2) return 'C';
        else if (index === 1) return 'B';
        else if (index === 0) return 'A'
    };

    const convertAnswer = (dap_an_dungs, ket_qua_chons) => {
        let answered = "0".repeat(ket_qua_chons?.length);
        let chars = answered.split('');
        dap_an_dungs.map((answer, index) => {
            chars[answer] = '1';
            return null;
        })
        return chars.join('');
    };

    const renderAnswer = (question, answer, index) => {
        // Render lựa chọn (A hoặc B hoặc C hoặc D)
        // Khi nộp bài => Check lựa chọn đã nộp là đúng hay sai;
        // - Đáp án đúng của câu hỏi => màu xanh
        // - Lựa chọn đúng với đáp án => màu xanh
        // - Lựa chọn sai với đáp án => màu đỏ
        let regex = /\\begin{center}\\includegraphics\[scale = 0\.5\]{(.*?)}\\end{center}/;
        let isWrong = false;
        let currentSubmitAnswer = results.find((item) => item.cau_hoi_id === question.cau_hoi_id);
        if (currentSubmitAnswer?.gia_tri_dap_an && question?.dap_an_dungs) {
            if (convertAnswer(currentSubmitAnswer?.gia_tri_dap_an, currentSubmitAnswer?.ket_qua_chon)[index] !== convertAnswer(question?.dap_an_dungs, currentSubmitAnswer?.ket_qua_chon)[index]) {
                isWrong = true;  
            }
        }
        
        return (
            <div className={`answer ${!isDoing && (isWrong && !answer.dap_an_dung) ? 'incorrect' : ''} ${!isDoing && answer.dap_an_dung ? 'correct' : ''}`}>
                <span className="answer-label">{renderAnswerKey(index)}</span>
                <div className="answer-content">             
                    <MathJax.Provider>
                        {answer.noi_dung_dap_an.split('\n').map((item, index_cauhoi) => {
                            return (
                                <div className="help-answer-content" key={index_cauhoi}> 
                                {
                                    (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                        <Image src={config.API_URL + `/${item.match(regex)[1]}`} alt={`img_cauhoi_${index_cauhoi}`}></Image>
                                    ) : (
                                        item.split('$').map((item2, index2) => {
                                            return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                <MathJax.Node key={index2} formula={item2} />
                                            ) : (
                                                <span style={{fontFamily: 'MJXc-TeX-main-R, MJXc-TeX-main-Rw'}} key={index2} dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                            )
                                        })
                                    )
                                }
                                </div>
                            )}
                        )}
                    </MathJax.Provider>
                </div>
            </div>
        );
    };

    // Hàm UI câu hỏi kéo thả
    const questionDragAndDrop = (question, key) => {
        // localStorage.setItem('question', null);
        // localStorage.setItem('question', JSON.stringify(question));

        const isAnswered = results.find((it) => it.cau_hoi_id === question.cau_hoi_id);  
        let lua_chons = ''
        if (isAnswered) lua_chons = isAnswered?.noi_dung?.replace(/\n/g, "").split(';').filter(item => item !== '');
        
        let selectedGaps = gaps.filter(item => item.questionId === question.cau_hoi_id);
        return (
            <>
                <div style={{fontSize: 20}}>Kéo thả các đáp án vào vị trí thích hợp:</div>
                    
                <div className='fill-box-question'>
                    <Droppable droppableId="word-bank" direction="horizontal" >
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} style={{margin: 12}}>
                                <Space wrap >
                                    {question?.cau_hoi?.lua_chon?.noi_dung?.split(';').map((lua_chon, index) => (
                                        <Draggable key={`${question?.cau_hoi_id + index}`}
                                            draggableId={(question?.cau_hoi_id + index).toString()} index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <Tag style={{fontSize: 20, padding: '7px 14px'}} key={`${question?.cau_hoi_id + index}`} 
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`cursor-move ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                                    color="blue"
                                                >   
                                                    <MathJax.Provider>
                                                        {lua_chon.split('\n').filter(item => item !== '').map((item, index_cauhoi) => {
                                                            return (
                                                                <div className="title-exam-content" key={index_cauhoi}>
                                                                    {
                                                                        (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                                            <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}><Image src={config.API_URL + `/${item.match(regex)[1]}`} alt={`img_question2_${index_cauhoi}`}></Image></div>
                                                                        ) : 
                                                                        (
                                                                            <div style={{textAlign: 'justify'}}>{item.split('$').map((item2, index2) => {
                                                                                return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                                                    <MathJax.Node key={index2} formula={item2} />
                                                                                ) : (
                                                                                    <span dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                                                )
                                                                            })}</div>
                                                                        )
                                                                    }
                                                                </div>
                                                            )}
                                                        )}
                                                    </MathJax.Provider>
                                                </Tag>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </Space>
                            </div>
                        )}
                    </Droppable>

                    {question?.cau_hoi?.cau_hoi_chi_tiets?.map((cau_hoi, index) => {
                        const partCauhoi = cau_hoi?.noi_dung?.split('{ENTER}');
                        return (
                            <Row key={index}>
                                <div style={{fontSize: 18, marginBottom: 8, marginRight: 12}}>
                                    {index + 1}. 
                                </div>
                                {lua_chons.length > 0 && <div style={{fontSize: 18, color: 'red'}}>
                                    Đáp án đã chọn: {lua_chons?.map((lua_chon, indexLuaChon) => {
                                        return (
                                            `${indexLuaChon + 1}. ${lua_chon}; `
                                        )
                                    })}
                                </div>
                                }
                                {
                                    partCauhoi.map((chi_tiet, index_2) => {
                                        return (
                                            <div style={{fontSize: 18, marginBottom: 8}} key={index_2}>
                                                {chi_tiet.split('\n').map((item, index) => {
                                                    return (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                        <div style={{display: 'flex', justifyContent: 'center', width: '100%'}} key={index}>
                                                            <Image src={config.API_URL + `/${item?.match(regex)[1]}`} alt={`img_question4_${index}`}></Image>
                                                        </div>
                                                    ) : 
                                                    (
                                                        <span key={index}>{item.split('$').map((item2, index2) => {
                                                            return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                                <MathJax.Node key={index2} formula={item2} />
                                                            ) : (
                                                                <span key={index2} dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                            )
                                                        })}</span>
                                                    )
                                                })}

                                                {(isDoing && index_2 < partCauhoi.length - 1) && (
                                                    <Droppable droppableId={`gap-${index + index_2}`}>
                                                        {(provided, snapshot) => (
                                                            <div ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                                className={`empty-box ${
                                                                    snapshot.isDraggingOver ? 'bg-gray-50' : ''
                                                                } ${selectedGaps[index + index_2]?.userWord ? 'border-solid border-blue-500' : ''}`}
                                                            >
                                                                {selectedGaps[index + index_2]?.userWord && (
                                                                    <Draggable draggableId={`gap-${index + index_2}-word`} index={index + index_2}>
                                                                        {(provided) => (
                                                                            <Tag
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                className="cursor-move m-0"
                                                                                color="blue"
                                                                            >
                                                                                {selectedGaps[index + index_2]?.userWord}
                                                                            </Tag>
                                                                        )}
                                                                    </Draggable>
                                                                )}
                                                                {provided.placeholder}
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                )}
                                                {(!isDoing && index_2 < partCauhoi.length - 1) && (
                                                    <div className={`empty-box`}></div>
                                                )}
                                            </div>
                                        )
                                    })
                                }
                            </Row>
                        )
                    })}
                </div>
            </>
        )
    };

    // Hàm UI câu hỏi trắc nghiệm
    const renderChoiceQuestion = (question, key) => {
        return (
            <div className="content-answer-question">
                <Row gutter={[20, 10]} className="multi-choice" style={{rowGap: 0}}>
                    {question.cau_hoi.dap_ans.map((answer, index) => {
                        const isAnswered = results.find((it) => it.cau_hoi_id === question.cau_hoi_id);
                        return (
                            <Col xs={24} sm={24} md={12} key={answer.dap_an_id}>
                                <ul>
                                    <li className={`item ${isAnswered && isAnswered.dap_an[0] === renderAnswerKey(index) ? 'active' : ''}`}>
                                        <button style={{width:"100%"}} disabled={pause || !isDoing}
                                            className="btn-onClick"
                                            onClick={() => {   
                                                setPause(true); // Tạm dừng để ngăn chặn việc thay đổi đáp án quá nhanh
                                                dispatch(answerActions.getAnswersUser({ idDeThi: params.idExamUser, idQuestion: '' }, 
                                                    (res) => {
                                                        if (res.status === 'success') {
                                                            answers = res.data;
                                                            onChooseAnswer(question, renderAnswerKey(index), index, res.data, '')   
                                                        }
                                                    }
                                                ))
                                            }}
                                        >
                                            {renderAnswer(question.cau_hoi, answer, index)}
                                        </button>
                                    </li>
                                </ul>
                            </Col>
                        )
                    })}
                </Row>
            </div>
        );
    };
    
    // Hàm UI câu hỏi tự luận
    const renderEssayQuestion = (question, key) => {
        const isAnswered = results.find((it) => it.cau_hoi_id === question.cau_hoi_id);
        return (
            <div className="title-exam">
                <TextArea placeholder='Nhập đáp án' rows={1} style={{width:"100%"}} disabled={!isDoing} 
                    defaultValue={isAnswered !== undefined ? isAnswered.noi_dung : null}
                    onChange={(e) => {
                        localStorage.setItem('answerText', null);
                        localStorage.setItem('question', null);
                        localStorage.setItem('answerText', e.target.value);
                        localStorage.setItem('question', JSON.stringify(question));                            
                    }
                }/>
            </div>
        );
    };  

    // Hàm UI câu hỏi đúng sai
    const renderRightWrongQuestion = (question, key) => {
        const isAnswered = results.find((it) => it.cau_hoi_id === question.cau_hoi_id);
        return (
            <div className="content-answer-question">
                <Row style={{marginTop: 12}}>
                    <div className="option-answer"></div>
                    <div style={{fontWeight: 700, width: '12%', fontSize: 16}}>ĐÚNG</div>
                    <div style={{fontWeight: 700, width: '12%', fontSize: 16}}>SAI</div>
                </Row>
                <Row gutter={[20, 10]} className="multi-choice" style={{rowGap: 0}}>
                    {question.cau_hoi.dap_ans.map((answer, index) => {
                        return (
                            <Col xs={24} sm={24} md={24} key={index}>
                                <div className='wrongrightAnswer'>
                                    <div className="option-answer">
                                        {/* <MathJax.Provider>
                                            {answer.noi_dung_dap_an.split('\n').map((item, index_cauhoi) => {
                                                return (
                                                    <div className="option-answer-content" key={index_cauhoi}>
                                                        {
                                                            (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                                <Image src={config.API_URL + `/${item?.match(regex)[1]}`} alt={`img_question3_${index_cauhoi}`}></Image>
                                                            ) : 
                                                            (
                                                                <div style={{textAlign: 'justify'}}>{item.split('$').map((item2, index2) => {
                                                                    return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                                        <MathJax.Node key={index2} formula={item2} />
                                                                    ) : (
                                                                        <span dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                                    )
                                                                })}</div>
                                                            )
                                                        }
                                                    </div>
                                                )}
                                            )}
                                        </MathJax.Provider> */}
                                    </div>
                                    <div style={{width: '12%'}}>
                                        <button id={`button-Right-${index}`} disabled={!isDoing}
                                            className={`btn-DS ${isAnswered && isAnswered.ket_qua_chon[index] === '1' ? 'active' : '' }`}
                                            onClick={() => {
                                                dispatch(answerActions.getAnswersUser({ idDeThi: params.idExamUser, idQuestion: '' }, 
                                                    (res) => {
                                                        if (res.status === 'success') {
                                                            answers = res.data;
                                                            onChooseAnswer(question, renderAnswerKey(index), index, res.data, true)   
                                                        }
                                                    }
                                                ))
                                            }}
                                        >
                                            <span className="answer-label">Đ</span>
                                        </button>
                                    </div>
                                    <div style={{width: '12%'}}>
                                        <button id={`button-Wrong-${index}`} disabled={!isDoing}
                                            className={`btn-DS ${isAnswered && isAnswered.ket_qua_chon[index] === '0' ? 'active' : '' }`}
                                            onClick={() => {
                                                dispatch(answerActions.getAnswersUser({ idDeThi: params.idExamUser, idQuestion: '' }, 
                                                    (res) => {
                                                        if (res.status === 'success') {
                                                            answers = res.data;
                                                            onChooseAnswer(question, renderAnswerKey(index), index, res.data, false);
                                                        }
                                                    }
                                                ))
                                            }}
                                        >
                                            <span className="answer-label">S</span>
                                        </button>
                                    </div>
                                </div>
                            </Col>
                        )
                    })}
                </Row>
            </div>
        );
    }

    // giao diện câu hỏi đúng sai chọn nhiều
    const renderMultiChoiceRightWrongQuestion = (question, key) => {
        const isAnswered = results.find((it) => it.cau_hoi_id === question.cau_hoi_id);
        return (
            <div className="content-answer-question">
                <span style={{marginRight: 8, fontSize: 20}}>Đúng</span>
                <span style={{ fontSize: 20 }}>Sai</span>
                <Row gutter={[20, 10]} className="multi-choice" style={{rowGap: 0}}>
                    {question.cau_hoi.dap_ans.map((answer, index) => {
                        return (
                            <Row className={`answer`} style={{alignItems: 'center', width: '100%'}} key={index}>
                                <Col span={3}>
                                    <Radio.Group name="groupRightWrong" disabled={!isDoing}
                                        defaultValue={isAnswered !== undefined ? isAnswered.ket_qua_chon[index] === '1' : false}
                                        onChange={(e) => {
                                            setPause(true); // Tạm dừng để ngăn chặn việc thay đổi đáp án quá nhanh
                                            dispatch(answerActions.getAnswersUser({ idDeThi: params.idExamUser, idQuestion: '' }, 
                                                (res) => {
                                                    if (res.status === 'success') {
                                                        answers = res.data;
                                                        onChooseAnswer(question, renderAnswerKey(index), index, res.data, e.target.value)   
                                                    }
                                                }
                                            ))
                                        }}
                                    >
                                        <Radio value={true}>Đ</Radio>
                                        <Radio value={false}>S</Radio>
                                    </Radio.Group>
                                </Col>
                                <Col span={21}>
                                    <div className="answer-content" style={{flexDirection: 'row', alignItems: 'center', paddingLeft: 0}}>
                                        <span style={{marginRight: 6}}>{renderAnswerKey(index)}. </span>
                                        <MathJax.Provider>
                                            {answer.noi_dung_dap_an.split('\n').filter((item) => item !== '').map((item, index_cauhoi) => {
                                                return (
                                                    <div className="help-answer-content" key={index_cauhoi}>
                                                    {
                                                        (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                            <Image src={config.API_URL + `/${item?.match(regex)[1]}`} alt={`img_answer_question_${index_cauhoi}`}></Image>
                                                        ) : (
                                                            item.split('$').map((item2, index2) => {
                                                                return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                                    <MathJax.Node key={index2} formula={item2} />
                                                                ) : (
                                                                    <span dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                                )
                                                            })
                                                        )
                                                    }
                                                    </div>
                                                )}
                                            )}
                                        </MathJax.Provider>
                                    </div>
                                </Col>
                            </Row>
                        )
                    })}
                </Row>
            </div>
        )
    }

    // Hàm UI câu hỏi Chọn nhiều đáp án
    const renderMultipleChoiceQuestion = (question, key) => {
        const isAnswered = results.find((it) => it.cau_hoi_id === question.cau_hoi_id);
        return (
            <div className="content-answer-question">
                <Row gutter={[20, 10]} className="multi-choice" style={{rowGap: 0}}>
                        {question.cau_hoi.dap_ans.map((answer, index) => {
                            return (
                                <Col xs={24} sm={24} md={getAnswerCols(question.cau_hoi.cot_tren_hang)} key={index}>
                                    <ul>
                                        <li className={`item ${isAnswered && isAnswered.dap_an === renderAnswerKey(index) ? 'active' : ''}`}>
                                            <div className={`answer `}>
                                                <Checkbox value={`${index}`} 
                                                    checked={isAnswered !== undefined && isAnswered?.gia_tri_dap_an.includes(Number(index))} 
                                                    disabled={pause || !isDoing}
                                                    onChange={(e) => {
                                                        setPause(true); // Tạm dừng để ngăn chặn việc thay đổi đáp án quá nhanh
                                                        dispatch(answerActions.getAnswersUser({ idDeThi: params.idExamUser, idQuestion: '' }, 
                                                            (res) => {
                                                                if (res.status === 'success') {
                                                                    answers = res.data;
                                                                    onChooseAnswer(question, renderAnswerKey(index), index, res.data, '')   
                                                                }
                                                            }
                                                        ))
                                                    }}
                                                >
                                                    <Row className="answer-content" style={{flexDirection: 'row'}}>       
                                                        <div style={{marginRight: 6}}>{renderAnswerKey(index)}. </div>      
                                                        <MathJax.Provider>
                                                            {answer.noi_dung_dap_an.split('\n').map((item, index_cauhoi) => {
                                                                return (
                                                                    <div className="help-answer-content" key={index_cauhoi}> 
                                                                    {
                                                                        (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                                            <Image src={config.API_URL + `/${item.match(regex)[1]}`} alt={`img_cauhoi_${index_cauhoi}`}></Image>
                                                                        ) : (
                                                                            item.split('$').map((item2, index2) => {
                                                                                return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                                                    <MathJax.Node key={index2} formula={item2} />
                                                                                ) : (
                                                                                    <span style={{fontFamily: 'MJXc-TeX-main-R, MJXc-TeX-main-Rw'}} key={index2} dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                                                )
                                                                            })
                                                                        )
                                                                    }
                                                                    </div>
                                                                )}
                                                            )}
                                                        </MathJax.Provider>
                                                    </Row>
                                                </Checkbox>
                                            </div>
                                        </li>
                                    </ul>
                                </Col>
                            )
                        })}
                </Row>
            </div>
        );
    }

    // Event hỏi nộp bài thi
    const submitExam = () => {
        const timeLeftInMinutes = Math.floor(countSection / 60);
        const timeLeftInSeconds = Math.floor(countSection - timeLeftInMinutes * 60);
        const questionRemain = exam.data[`so_cau_hoi_phan_${state.sectionExam}`] - results.length;

        Modal.confirm({
            title: 'Xác nhận nộp bài',
            maskStyle: { background: 'rgba(0, 0, 0, 0.8)' },
            wrapClassName: 'cra-confirm-modal-container',
            content: (
                <div className="cra-confirm-body">
                    {questionRemain > 0 && (
                        <div>Bạn còn <b>{questionRemain} câu chưa trả lời</b>.</div>
                    )}
                    {questionRemain === 0 && (
                        <div>
                            <b>Bạn đã hoàn thiện {exam.data[`so_cau_hoi_phan_${state.sectionExam}`]} câu hỏi.</b>
                        </div>
                    )}

                    <div>
                        Thời gian còn<b>({timeLeftInMinutes} phút {timeLeftInSeconds} giây)</b>.
                    </div>
                    <div>Bạn đồng ý nộp bài?</div>
                </div>
            ),
            okText: 'Nộp bài',
            cancelText: 'Làm bài tiếp',
            onOk: () => onSaveHistory(),
        });
    }

    const onSaveHistory = () => {
        const callbackSub = (res) => {
            if (res.status === 200 && res.statusText === 'OK') {
                setIsDoing(false); 
                notification.success({
                    message: 'Thành công',
                    description: 'Nộp bài thành công', 
                });
                clearInterval(timerId?.current);
                sessionStorage.removeItem('section');
                sessionStorage.removeItem('timeStartSection');
                setStartTime(0);

                dispatch(
                    answerActions.getAnswersUser({ idDeThi: params.idExamUser, idQuestion: '' }, (resAnswered) => {
                        if (resAnswered.status === 'success' && resAnswered.data.length > 0) {
                            let temp = [];
                            if (resAnswered.data.length > 0) {
                                resAnswered.data.map(item => {
                                    if ((item.ket_qua_chon !== null) && (item.ket_qua_chon !== '')) {// Câu trắc nghiệm
                                        temp.push({ cau_hoi_id: item.cau_hoi_id, dap_an: renderAnswerKeyV2(item.ket_qua_chon)[0], 
                                            loai_dap_an: true, gia_tri_dap_an: renderAnswerKeyV2(item.ket_qua_chon)[1],
                                            ket_qua_chon: item.ket_qua_chon });
                                    }
                                    else {// câu tự luận
                                        temp.push({ cau_hoi_id: item.cau_hoi_id, noi_dung: item.noi_dung_tra_loi, 
                                            loai_dap_an: false, gia_tri_dap_an: item.noi_dung_tra_loi,
                                            ket_qua_chon: item.noi_dung_tra_lo });
                                    }
                                    return null;
                                })
                                setResults([...results, ...temp.filter(item => item.dap_an?.length !== 0)]);
                            }
                            resAnswered.data.map(item => answers.push(item));
                        }
                    })
                );

            } else {
                clearInterval(timerId?.current);
                setStartTime(0);
            };

            dispatch(examActions.getExamUser({ id: params.idExamUser }, (response) => {
                if (response.status === 'success') {
                    const points = Array.from({ length: exam.data.so_phan }).map((_, index) => {
                        const startIndex = index === 0 ? 0 : Array.from({ length: index }).reduce((sum, _, i) => sum + exam.data[`so_cau_hoi_phan_${i + 1}`], 0);
                        const endIndex = startIndex + exam.data[`so_cau_hoi_phan_${index + 1}`];
                        const partQuestions = exam.data.cau_hoi_de_this.slice(startIndex, endIndex);
                        const number = partQuestions.map((question, index) => {
                            let number = 0;
                            if (response.data.dap_an_da_chons) {
                                let currentSubmitAnswer = response.data.dap_an_da_chons.find((item) => item.cau_hoi_id === question.cau_hoi.cau_hoi_id);
                                if (question?.cau_hoi?.dap_an_dungs && currentSubmitAnswer !== undefined) {
                                    if ((currentSubmitAnswer && currentSubmitAnswer?.ket_qua_chon) && 
                                        (question?.cau_hoi?.loai_cau_hoi === 1 || question?.cau_hoi?.loai_cau_hoi === 2 ||
                                        question?.cau_hoi?.loai_cau_hoi === 3 || question?.cau_hoi?.loai_cau_hoi === 4)
                                    ) { // Câu trắc nghiệm
                                        let answerRight = convertAnswer(question?.cau_hoi?.dap_an_dungs, currentSubmitAnswer?.ket_qua_chon);
                                        if (answerRight === currentSubmitAnswer?.ket_qua_chon) {
                                            number = number + 1;
                                        } 
                                    } else if (currentSubmitAnswer && (question?.cau_hoi?.loai_cau_hoi === 0 || question?.cau_hoi?.loai_cau_hoi === 5 || question?.cau_hoi?.loai_cau_hoi === 6)) { // Câu tự luận
                                        if (question?.cau_hoi?.dap_ans[0]?.noi_dung_dap_an
                                            .replaceAll('<b>', '')
                                            .replaceAll('</b>', '')
                                            .replaceAll('<em>', '')
                                            .replaceAll('</em>', '')
                                            .replaceAll('<u>', '')
                                            .replaceAll('</u>', '')
                                            .trim()
                                            .toLowerCase() === (currentSubmitAnswer.noi_dung_tra_loi).toLowerCase()) 
                                        {
                                            number = number + 1;
                                        } 
                                    }
                                }
                            }
                            return number;
                        })
                        return number.reduce((partialSum, a) => partialSum + a, 0)
                    })
                    const info = {
                        "diem_cac_phan": points.join(',')
                    }
                    dispatch(examActions.editExamDGTDUser({ idExam: params.idExamUser, formData: info }, (a) => {
                        if (a.status === 200 && a.statusText === 'OK') {
                            window.location.reload();
                        }
                    }))
                }
            }))};

        const thoi_gian_lam_bai = timeToDoAllSection.reduce((partialSum, a) => Number(partialSum) + Number(a), 0) // tổng thời gian làm bài

        const info = {
            "thoi_gian_lam_bai": secondsToMinutes(timeToDo === 0 ? 60 : thoi_gian_lam_bai * 60),
            "thoi_diem_ket_thuc": moment().toISOString()
        }
        dispatch(examActions.editExamDGTDUser({ idExam: params.idExamUser, formData: info }, callbackSub))
    };

    // Xử lý khi chuyển phần thi
    const handleNextSectionExam = () => {
        const timeLeftInMinutes = Math.floor(countSection / 60);
        const timeLeftInSeconds = Math.floor(countSection - timeLeftInMinutes * 60);
        const questionRemain = exam.data[`so_cau_hoi_phan_${state.sectionExam}`] - results.length;

        if (isDoing) {
            Modal.confirm({
                title: 'CHÚC MỪNG BẠN ĐÃ HOÀN THÀNH PHẦN THI',
                maskStyle: { background: 'rgba(0, 0, 0, 0.8)' },
                wrapClassName: 'cra-confirm-modal-container',
                content: (
                    <div className="cra-confirm-body">
                        {questionRemain > 0 && (
                            <div> Bạn còn <span style={{fontWeight: 700}}>{questionRemain} câu chưa trả lời</span>.</div>
                        )}
                        {questionRemain === 0 && (
                            <div><span style={{fontWeight: 700}}>Bạn đã hoàn thiện {exam.data[`so_cau_hoi_phan_${state.sectionExam}`]} câu hỏi.</span></div>
                        )}
                        <div>
                            Thời gian còn <span style={{fontWeight: 700}}>({timeLeftInMinutes} phút {timeLeftInSeconds} giây)</span>.
                        </div>
                        
                        <div>Đề thi phần tiếp theo sẽ hiện thị sau 30 giây. Bạn hãy sẵn có thể để vào làm bài</div>
                        <div style={{color: 'red', fontWeight: 700}}>
                            Lưu ý: Bài làm phần này sẽ tự động nộp và bạn không thể sửa được nữa
                        </div>
                    </div>
                ),
                okText: 'Phần tiếp theo',
                cancelText: 'Làm bài tiếp',
                onOk: () => {
                        if (state.sectionExam === exam.data.so_phan) return;
                        else {
                            countDown();
                            clearInterval(timerId?.current); // Dừng đếm thời gian section
                            clearInterval(timeCount?.current); // Dừng đếm thời gian làm bài
    
                            // sau 30s chờ => sẽ thực hiện hàm bên trong
                            timeOut = setTimeout(() => { 
                                sessionStorage.setItem('section', state.sectionExam + 1);
                                sessionStorage.setItem('timeStartSection', new Date().getTime());
                                setCountSection(exam.data[`thoi_gian_phan_${state.sectionExam + 1}`] * 60) // set biến đêm Thời gian = của phần tiếp theo
                                setState(prevState => ({
                                    ...prevState,
                                    sectionExam: prevState.sectionExam + 1
                                }));
                                timerId.current = setInterval(() => {
                                    setCountSection((preCount) => preCount - 1);
                                }, 1000);
                                setResults([]); 
                                setCurrentQuestion(0);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                                // thiết lập tiếp bộ đếm thời gian làm bài
                                dispatch(examActions.getExamUser({ id: params.idExamUser }, (res) => {
                                    if (res.status === 'success') {
                                        // 1 phút cập nhật thời gian làm bài 1 lần
                                        if (res?.data?.thoi_gian_lam_phan) setTimeToDo(Number(res?.data?.thoi_gian_lam_phan.split(',')[state.sectionExam])); // là số phút
                                        timeCount.current = setInterval(() => {
                                            setTimeToDo((preValue) => preValue + 1); // Mỗi lần tăng lên 1 phút
                                        }, 60000)
                                    }
                                }));
                            }, 30000);
                        }
                },
            });
        } else {
            if (state.sectionExam === exam.data.so_phan) return;
            else {
                setState(prevState => ({
                    ...prevState,
                    sectionExam: prevState.sectionExam + 1
                }));

                const startIndex = Array.from({ length: state.sectionExam }).reduce(
                    (sum, _, i) => sum + exam?.data[`so_cau_hoi_phan_${i + 1}`],
                    0
                );
                const endIndex = startIndex + exam?.data[`so_cau_hoi_phan_${state.sectionExam + 1}`];
                const partQuestions = exam?.data?.cau_hoi_de_this?.slice(startIndex, endIndex);
                dispatch(
                    answerActions.getAnswersUser({ idDeThi: params.idExamUser, idQuestion: '' }, (resAnswered) => {
                        if (resAnswered.status === 'success' && resAnswered.data.length > 0) {
                            const filteredArray = resAnswered.data.filter(item1 =>
                                partQuestions.some(item2 => item1.cau_hoi_id === item2.cau_hoi_id)
                            );
                            let temp = [];
                            filteredArray.map(item => {
                                if ((item.ket_qua_chon !== null) && (item.ket_qua_chon !== '')) {// Câu trắc nghiệm
                                    temp.push({ cau_hoi_id: item.cau_hoi_id, dap_an: renderAnswerKeyV2(item.ket_qua_chon)[0], 
                                        loai_dap_an: true, gia_tri_dap_an: renderAnswerKeyV2(item.ket_qua_chon)[1],
                                        ket_qua_chon: item.ket_qua_chon });
                                }
                                else {// câu tự luận
                                    temp.push({ cau_hoi_id: item.cau_hoi_id, noi_dung: item.noi_dung_tra_loi, 
                                        loai_dap_an: false, gia_tri_dap_an: item.noi_dung_tra_loi,
                                        ket_qua_chon: item.noi_dung_tra_lo });
                                }
                                return null;
                            })
                            setResults([...results, ...temp.filter(item => item.dap_an?.length !== 0)]);
                            filteredArray.map(item => answers.push(item));
                        }
                    })
                );

                setCurrentQuestion(0);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
    }

    // XỬ lý khi chuyển về phần thi trước
    const handlePrevSectionExam = () => {
        if (state.sectionExam <= 1) return;
        else {
            setState(prevState => ({
                ...prevState,
                sectionExam: prevState.sectionExam - 1
            }));
        }
    }

    // Hàm hiển thị giao diện Lời giải của câu hỏi
    const renderSoluntionUI = (question) => {
        return (
            <>
                <Button style={{marginBottom: 12}}
                    type="default"
                    shape="round"
                    icon={<InfoCircleOutlined />}
                    onClick={() => {
                        if (!help.includes(question.cau_hoi_id)) {
                            setHelp([question.cau_hoi_id]);
                        } else {
                            setHelp(help.filter((cau_hoi_id) => cau_hoi_id !== question.cau_hoi_id));
                        }
                    }}
                >
                    Xem lời giải
                </Button>
                {help.includes(question.cau_hoi_id) && (
                    <Alert
                        message=""
                        type="warning"
                        description={
                            <div className="help-answer">
                                <MathJax.Provider>
                                    {question.cau_hoi.loi_giai.split('\n').map((item, index_cauhoi) => {
                                        return (
                                            <div className="help-answer-content" key={index_cauhoi}> 
                                            {
                                                (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                    <Image src={config.API_URL + `/${item.match(regex)[1]}`} alt={`img_question6_${index_cauhoi}`}></Image>
                                                ) : (
                                                    item.split('$').map((item2, index2) => {
                                                        return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                            <MathJax.Node key={index2} formula={item2} />
                                                        ) : (
                                                            <span dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                        )
                                                    })
                                                )
                                            }
                                            </div>
                                        )}
                                    )}
                                </MathJax.Provider>
                            </div>
                        }
                        closable
                        onClose={() => setHelp(help.filter((cau_hoi_id) => cau_hoi_id !== question.cau_hoi_id))}
                    />
                )}
            </>
        )
    }

    if (!isFullscreen) {
        return (
            <div className='full-screen'>
                <div>Bạn phải vào chế độ toàn màn hình (fullscreen) mới làm được bài thi.</div>
                <Button onClick={enterFullscreen} type='primary'>
                    Vào chế độ Full screen
                </Button>
            </div>
        )
    }

    return (
        <Spin spinning={loadingExportFile}>
            {loading && <LoadingCustom />}
            {(exam?.status === 'success' && (examUser?.status === 'success' || examUser?.data?.status === 'success')) && 
                <Layout style={{ minHeight: '100vh' }}>
                    <Header className='header-dgtd'>
                        <h5 style={{textTransform: 'uppercase'}} >{exam.data.ten_de_thi}</h5>
                        <h6 style={{marginBottom: 0, fontWeight: 700, display: isDoing ? 'block' : 'none'}}>
                            Phần thi: {
                                (() => {
                                    if (state.sectionExam === 1 || examUser.data.phan_dang_lam === 1) return 'Tư duy Toán học';
                                    else if (state.sectionExam === 2 || examUser.data.phan_dang_lam === 2) return 'Tư duy Đọc hiểu';
                                    else return 'Tư duy khoa học/Giải quyết vấn đề';
                                })()
                            }
                        </h6>
                    </Header>
                    <Layout className={`${isDoing ? 'doing-exam' : 'history-exam'}`}>
                        <Content className='body-dgtd'>
                            {!isDoing && 
                                <div className="history-header">
                                    <div className="summury-result">
                                        <div className="head-result">
                                            <p className="size-18 color-blue">
                                                <b>
                                                Chúc mừng bạn đã hoàn thành <span>{exam.data.ten_de_thi}</span>
                                                </b>
                                            </p>
                                            <p className="size-18">
                                                Thí sinh kiểm tra lại toàn bộ đề thi đã trả lời, ghi nhớ 
                                                <span style={{color: 'red', margin: '0 4px'}}>
                                                    ĐIỂM BÀI THI
                                                </span>
                                                trước khi rời phòng thi
                                            </p>
                                        </div>
                                        <div style={{fontSize: 22, textAlign: 'center', marginBottom: 12}}>Click
                                            <Button type="text" onClick={() => exportEvaluationDGTD()}
                                                style={{fontSize: 22, color: 'red'}}
                                            >
                                                VÀO ĐÂY
                                            </Button> 
                                            để xem thông tin nhận xét, đánh giá chung
                                        </div>
                                    </div>
                                </div>
                            }
                            {Array.from({ length: exam.data.so_phan }).map((_, index) => {
                                if (index + 1 === state.sectionExam) {
                                    const startIndex = index === 0 ? 0 : Array.from({ length: index }).reduce((sum, _, i) => sum + exam.data[`so_cau_hoi_phan_${i + 1}`], 0);
                                    const endIndex = startIndex + exam.data[`so_cau_hoi_phan_${index + 1}`];
                                    const sectionQuestions = exam.data.cau_hoi_de_this.slice(startIndex, endIndex);
                                    let partQuestions = ''
                                    let exceprt = '';
                                    return (
                                        <>
                                            {sectionQuestions.map((question, indexQuestion) => {
                                                if (indexQuestion === currentQuestion) {
                                                    if (question.cau_hoi.trich_doan && question.cau_hoi.exceprtFrom !== undefined && question.cau_hoi.exceprtTo !== undefined) {
                                                        partQuestions = exam?.data?.cau_hoi_de_this.slice(question.cau_hoi.exceprtFrom, question.cau_hoi.exceprtTo + 1);
                                                        exceprt = <Col md={12} style={{overflowY: 'scroll', maxHeight: 800}}>
                                                            {(question.cau_hoi?.trich_doan?.loai_trich_doan_id !== 0) &&
                                                                <>
                                                                    <span className="exceprt-label">
                                                                        {`${question.cau_hoi?.trich_doan?.loai_trich_doan?.noi_dung} ${indexQuestion + 1}`} 
                                                                        {question.cau_hoi.chuyen_nganh_id === 5 ? ' to ' : ' đến '}    
                                                                        {indexQuestion + 1 + (question.cau_hoi.exceprtTo - question.cau_hoi.exceprtFrom)}
                                                                    </span>
                                                                    <br/>
                                                                </>
                                                            }
                                                            <div className="answer-content" style={{paddingLeft: '0px', fontSize: 18}}> 
                                                                <MathJax.Provider>
                                                                    {question.cau_hoi?.trich_doan?.noi_dung?.split('\n').filter((item) => item !== '').map((item, index_cauhoi) => {
                                                                        return (
                                                                            <div className="title-exam-content" key={index_cauhoi}>
                                                                                {
                                                                                    (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                                                        <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}><Image src={config.API_URL + `/${item.match(regex)[1]}`} alt={`img_question_${index_cauhoi}`}></Image></div>
                                                                                    ) : 
                                                                                    (
                                                                                        <div style={{textAlign: 'justify'}}>{item.split('$').map((item2, index2) => {
                                                                                            return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                                                                <MathJax.Node key={index2} formula={item2} />
                                                                                            ) : (
                                                                                                <span dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                                                            )
                                                                                        })}</div>
                                                                                    )
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    )}
                                                                </MathJax.Provider>
                                                            </div>
                                                        </Col>   
                                                    }

                                                    if (partQuestions !== '' && exceprt !== '') {
                                                        return (
                                                            <Row gutter={12} key={question.cau_hoi.cau_hoi_id} style={{background: '#fff', borderRadius: 8}}>
                                                                {exceprt}
                                                                <Col md={12} style={{overflowY: 'scroll', maxHeight: 800, overflowX: 'hidden'}}>
                                                                    {partQuestions.map((subQuestion, indexSubQuestion) => {
                                                                        let questionComponent;
                                                                        switch (subQuestion?.cau_hoi?.loai_cau_hoi) {
                                                                            case 1: // Trắc nghiệm
                                                                                questionComponent = 
                                                                                <>
                                                                                    {renderChoiceQuestion(subQuestion, indexSubQuestion)}
                                                                                    {!isDoing && renderAnswerResult(subQuestion)}
                                                                                    {!isDoing && renderSoluntionUI(subQuestion)}
                                                                                </>
                                                                                break;
                                                                            case 6: // Kéo thả
                                                                                questionComponent = 
                                                                                <DragDropContext onDragEnd={handleDragEnd} key={question.cau_hoi.cau_hoi_id}>
                                                                                    {questionDragAndDrop(subQuestion, indexSubQuestion)}
                                                                                    {!isDoing && renderAnswerResult(subQuestion)}
                                                                                    {!isDoing && renderSoluntionUI(subQuestion)}
                                                                                </DragDropContext>
                                                                                break;
                                                                            case 5: // Tự luận nhiều vị trí
                                                                                questionComponent = 
                                                                                <>
                                                                                    {!isDoing && renderAnswerResult(subQuestion)}
                                                                                    {!isDoing && renderSoluntionUI(subQuestion)}
                                                                                </>
                                                                                break;
                                                                            case 0: // Tự luận
                                                                                questionComponent = 
                                                                                <>
                                                                                    {renderEssayQuestion(subQuestion, indexSubQuestion)}
                                                                                    {!isDoing && renderAnswerResult(subQuestion)}
                                                                                    {!isDoing && renderSoluntionUI(subQuestion)}
                                                                                </>
                                                                                break;
                                                                            case 2: // Trắc nghiệm nhiều lựa chọn
                                                                                questionComponent = 
                                                                                <>
                                                                                    {renderMultipleChoiceQuestion(subQuestion, indexSubQuestion)}
                                                                                    {!isDoing && renderAnswerResult(subQuestion)}
                                                                                    {!isDoing && renderSoluntionUI(subQuestion)}
                                                                                </>
                                                                                break;
                                                                            case 3:  // Đúng sai chọn nhiều 
                                                                                questionComponent = 
                                                                                <>
                                                                                    {renderMultiChoiceRightWrongQuestion(subQuestion, indexSubQuestion)}
                                                                                    {!isDoing && renderAnswerResult(subQuestion)}
                                                                                    {!isDoing && renderSoluntionUI(subQuestion)}
                                                                                </>
                                                                                break;
                                                                            case 4: // Đúng sai 
                                                                                questionComponent = 
                                                                                <>
                                                                                    {renderRightWrongQuestion(subQuestion, indexSubQuestion)}
                                                                                    {!isDoing && renderAnswerResult(subQuestion)}
                                                                                    {!isDoing && renderSoluntionUI(subQuestion)}
                                                                                </>
                                                                                break;
                                                                            default:
                                                                                questionComponent = null;
                                                                        }

                                                                        return (
                                                                            <>
                                                                                <div style={{fontSize: 20, fontWeight: 700}}>Câu {indexSubQuestion + 1} [{getTypeQuestion(subQuestion.cau_hoi.loai_cau_hoi)}]</div>
                                                                                {renderTitleQuestion(subQuestion)}
                                                                                {questionComponent}
                                                                            </>
                                                                        )
                                                                    })}
                                                                </Col>
                                                            </Row>
                                                        )
                                                    } else {
                                                        if (question?.cau_hoi?.loai_cau_hoi === 1) { // Trắc nghiệm
                                                            return (
                                                                <Card key={question.cau_hoi.cau_hoi_id} 
                                                                    title={
                                                                        <span>Câu {currentQuestion + 1} [{getTypeQuestion(question.cau_hoi.loai_cau_hoi)}]</span>
                                                                    }
                                                                    extra={
                                                                        <Tooltip title="Đánh dấu câu hỏi">
                                                                            <Button shape="circle" icon={<BookOutlined />} onClick={() => handleMarkQuestion(question)}/>
                                                                        </Tooltip>
                                                                    } 
                                                                    style={{ width: '100%', borderRadius: 8 }}
                                                                >
                                                                    {renderTitleQuestion(question)}
                                                                    {renderChoiceQuestion(question, index)}
                                                                    {!isDoing && renderAnswerResult(question)}
                                                                    {!isDoing && renderSoluntionUI(question)}
                                                                </Card>
                                                            )
                                                        } else if (question?.cau_hoi?.loai_cau_hoi === 6) { // Kéo thả
                                                            return (
                                                                <DragDropContext onDragEnd={handleDragEnd} key={question.cau_hoi.cau_hoi_id}>
                                                                    <Card title={
                                                                        <span>Câu {currentQuestion + 1} [{getTypeQuestion(question.cau_hoi.loai_cau_hoi)}]</span>
                                                                    }
                                                                        extra={
                                                                            <Tooltip title="Đánh dấu câu hỏi">
                                                                                <Button shape="circle" icon={<BookOutlined />} onClick={() => handleMarkQuestion()}/>
                                                                            </Tooltip>
                                                                        } 
                                                                        style={{ width: '100%', borderRadius: 8 }}
                                                                    >
                                                                        {renderTitleQuestion(question)}
                                                                        {questionDragAndDrop(question, index)}
                                                                        {!isDoing && renderAnswerResult(question)}
                                                                        {!isDoing && renderSoluntionUI(question)}
                                                                    </Card>
                                                                </DragDropContext>
                                                            )
                                                        } else if (question?.cau_hoi?.loai_cau_hoi === 5) { // Tự luận nhiều vị trí
                                                            return (
                                                                <Card key={question.cau_hoi.cau_hoi_id} 
                                                                    title={
                                                                        <span>Câu {currentQuestion + 1} [{getTypeQuestion(question.cau_hoi.loai_cau_hoi)}]</span>
                                                                    }
                                                                    extra={
                                                                        <Tooltip title="Đánh dấu câu hỏi">
                                                                            <Button shape="circle" icon={<BookOutlined />} onClick={() => handleMarkQuestion(question)}/>
                                                                        </Tooltip>
                                                                    } 
                                                                    style={{ width: '100%', borderRadius: 8 }}
                                                                >
                                                                    {renderTitleQuestion(question)}
                                                                    {!isDoing && renderAnswerResult(question)}
                                                                    {!isDoing && renderSoluntionUI(question)}
                                                                </Card>
                                                            )
                                                        } else if (question?.cau_hoi?.loai_cau_hoi === 0) { // Tự luận
                                                            return (
                                                                <Card key={question.cau_hoi.cau_hoi_id} 
                                                                    title={
                                                                        <span>Câu {currentQuestion + 1} [{getTypeQuestion(question.cau_hoi.loai_cau_hoi)}]</span>
                                                                    }
                                                                    extra={
                                                                        <Tooltip title="Đánh dấu câu hỏi">
                                                                            <Button shape="circle" icon={<BookOutlined />} onClick={() => handleMarkQuestion(question)}/>
                                                                        </Tooltip>
                                                                    } 
                                                                    style={{ width: '100%', borderRadius: 8 }}
                                                                >
                                                                    {renderTitleQuestion(question)}
                                                                    {renderEssayQuestion(question, index)}
                                                                    {!isDoing && renderAnswerResult(question)}
                                                                    {!isDoing && renderSoluntionUI(question)}
                                                                </Card>
                                                            )
                                                        }  else if (question?.cau_hoi?.loai_cau_hoi === 2) { // Trắc nghiệm nhiều lựa chọn
                                                            return (
                                                                <Card key={question.cau_hoi.cau_hoi_id} 
                                                                    title={
                                                                        <span>Câu {currentQuestion + 1} [{getTypeQuestion(question.cau_hoi.loai_cau_hoi)}]</span>
                                                                    }
                                                                    extra={
                                                                        <Tooltip title="Đánh dấu câu hỏi">
                                                                            <Button shape="circle" icon={<BookOutlined />} onClick={() => handleMarkQuestion(question)}/>
                                                                        </Tooltip>
                                                                    } 
                                                                    style={{ width: '100%', borderRadius: 8 }}
                                                                >
                                                                    {renderTitleQuestion(question)}
                                                                    {renderMultipleChoiceQuestion(question, index)}
                                                                    {!isDoing && renderAnswerResult(question)}
                                                                    {!isDoing && renderSoluntionUI(question)}
                                                                </Card>
                                                            )
                                                        } else if (question?.cau_hoi?.loai_cau_hoi === 3) { // Nhiều lựa chọn đúng sai
                                                            return (
                                                                <Card key={question.cau_hoi.cau_hoi_id} 
                                                                    title={
                                                                        <span>Câu {currentQuestion + 1} [{getTypeQuestion(question.cau_hoi.loai_cau_hoi)}]</span>
                                                                    }
                                                                    extra={
                                                                        <Tooltip title="Đánh dấu câu hỏi">
                                                                            <Button shape="circle" icon={<BookOutlined />} onClick={() => handleMarkQuestion(question)}/>
                                                                        </Tooltip>
                                                                    } 
                                                                    style={{ width: '100%', borderRadius: 8 }}
                                                                >
                                                                    {renderTitleQuestion(question)}
                                                                    {renderMultiChoiceRightWrongQuestion(question, index)}
                                                                    {!isDoing && renderAnswerResult(question)}
                                                                    {!isDoing && renderSoluntionUI(question)}
                                                                </Card>
                                                            )
                                                        } else if (question?.cau_hoi?.loai_cau_hoi === 4) { // Đúng sai
                                                            return (
                                                                <Card key={question.cau_hoi.cau_hoi_id} 
                                                                    title={
                                                                        <span>Câu {currentQuestion + 1} [{getTypeQuestion(question.cau_hoi.loai_cau_hoi)}]</span>
                                                                    }
                                                                    extra={
                                                                        <Tooltip title="Đánh dấu câu hỏi">
                                                                            <Button shape="circle" icon={<BookOutlined />} onClick={() => handleMarkQuestion(question)}/>
                                                                        </Tooltip>
                                                                    } 
                                                                    style={{ width: '100%', borderRadius: 8 }}
                                                                >
                                                                    {renderTitleQuestion(question)}
                                                                    {renderRightWrongQuestion(question, index)}
                                                                    {!isDoing && renderAnswerResult(question)}
                                                                    {!isDoing && renderSoluntionUI(question)}
                                                                </Card>
                                                            )
                                                        }
                                                    }
                                                }
                                                return null;
                                            })}
                                        </>
                                    )
                                }
                                return null;
                            })}
                            
                            <Row style={{marginTop: 16}} align={'middle'} justify={'space-between'}>
                                <Row  align={'middle'}>
                                    <Button type="primary" className='btn-chinh' style={{ marginRight: 12 }} 
                                        onClick={() => {
                                            if (currentQuestion <= 0) return; 
                                            else setCurrentQuestion(currentQuestion - 1);
                                        }}
                                    >
                                        Câu trước
                                    </Button>
                                    <Button type="primary" className='btn-chinh' style={{ marginRight: 12 }} 
                                        onClick={() => {
                                            if (currentQuestion >= exam.data[`so_cau_hoi_phan_${state.sectionExam}`] - 1) return; 
                                            else setCurrentQuestion(currentQuestion + 1);
                                        }}
                                    >
                                        Câu tiếp
                                    </Button>
                                    <h6 style={{marginBottom: 0}}>Thời gian còn lại: <b>{secondsToMinutes(countSection)}</b></h6>
                                </Row>
                                <div>
                                    <Button 
                                        type="primary" 
                                        onClick={() => setSidebarVisible(!sidebarVisible)} 
                                        style={{ marginLeft: 'auto', background: '#f26725', borderColor: '#f26725' }}
                                    >
                                        {sidebarVisible ? 'Ẩn menu' : 'Hiện menu'}
                                    </Button>
                                </div>
                            </Row>
                        </Content>
                        {sidebarVisible && (
                            <Sider width={500} className='list-question-side' style={{maxHeight: 500}}>
                                <div style={{ display: !isDoing ? 'block' : 'none', padding: 16 }}>
                                    <h6>Kết quả điểm: <b>{examUser.data.ket_qua_diem}</b></h6> 
                                </div>
                                <div style={{ padding: 16 }}>
                                    <h6>Thời gian còn lại: <b>{secondsToMinutes(countSection)}</b></h6> 
                                </div>
                                <Row style={{ padding: 16, paddingTop: 0 }} justify={'center'}>
                                    {(state.sectionExam === exam.data.so_phan) ?
                                        <Button type="primary" onClick={() => submitExam()}
                                            style={{ display: isDoing ? 'block' : 'none', marginBottom: 16, marginRight: 12, background: '#ff6a00', 
                                                borderColor: '#ff6a00', width: '25%', borderRadius: 20 }}
                                        >
                                            Nộp bài
                                        </Button>
                                        :
                                        <>
                                            <Button type="primary" onClick={() => handlePrevSectionExam()}
                                                style={{ marginBottom: 16, marginRight: 12, background: '#ff6a00', 
                                                    borderColor: '#ff6a00', width: '25%', borderRadius: 20, 
                                                    display: !isDoing ? 'block' : 'none', }}
                                            >
                                                Phần trước
                                            </Button>
                                            <Button type="primary" onClick={() => handleNextSectionExam()}
                                                style={{ marginBottom: 16, marginRight: 12, background: '#ff6a00', 
                                                    borderColor: '#ff6a00', width: '25%', borderRadius: 20 }}
                                            >
                                                Phần tiếp theo
                                            </Button>
                                        </> 
                                    }   
                                </Row>
                                <Row align={'middle'} style={{ padding: 16, paddingTop: 0, display: isDoing ? 'flex' : 'none' }}>
                                    <h6 style={{margin: 0}}>Chỉ thị màu sắc: </h6>
                                    <button className='a-tag' style={{borderRadius: 8, marginLeft: 6}}>0</button>
                                    <button className='a-tag selected' style={{borderRadius: 8, marginLeft: 6}}>0</button>
                                    <button className='a-tag marked' style={{borderRadius: 8, marginLeft: 6}}>0</button>
                                </Row>
                                <Row align={'middle'} style={{ padding: 16, paddingTop: 0, display: !isDoing ? 'flex' : 'none' }}>
                                    <h6 style={{margin: 0}}>Chỉ thị màu sắc: </h6>
                                    <button className='a-tag right-answer' style={{borderRadius: 8, marginLeft: 6}}>Đ</button>
                                    <button className='a-tag wrong-answer' style={{borderRadius: 8, marginLeft: 6}}>S</button>
                                </Row>
                                <div className='list-question-area'>
                                    {Array.from({ length: exam.data.so_phan }).map((_, index) => {
                                        if (index + 1 === state.sectionExam) {
                                            const startIndex = index === 0 ? 0 : Array.from({ length: index }).reduce((sum, _, i) => sum + exam.data[`so_cau_hoi_phan_${i + 1}`], 0);
                                            const endIndex = startIndex + exam.data[`so_cau_hoi_phan_${index + 1}`];
                                            const sectionQuestions = exam.data.cau_hoi_de_this.slice(startIndex, endIndex);
                                            return (
                                                <>
                                                    {sectionQuestions.map((question, indexQuestion) => {
                                                        return (
                                                            <button className={`a-tag ${!isDoing ? isCorrectAnswer(question.cau_hoi) : ''} 
                                                                    ${results.find((it) => it.cau_hoi_id === question.cau_hoi.cau_hoi_id) ? 'selected' : ''} ${currentQuestion === indexQuestion ? 'selected' : ''}
                                                                    ${question?.danh_dau === 1 ? 'marked' : ''}`
                                                                }
                                                                key={indexQuestion} 
                                                                style={{ margin: '4px' }}
                                                                onClick={() => {
                                                                    setCurrentQuestion(indexQuestion)
                                                                }}
                                                            >
                                                                {indexQuestion + 1}
                                                            </button>
                                                        )
                                                    })}
                                                </>
                                            )
                                        }
                                        return null;
                                    })}
                                    
                                </div>
                                <div style={{ padding: 16, display: isDoing ? 'block' : 'none' }}>
                                    <h6>Bạn đã hoàn thành {results.length}/{exam.data[`so_cau_hoi_phan_${state.sectionExam}`]}</h6> 
                                    <Progress percent={(results.length/exam.data[`so_cau_hoi_phan_${state.sectionExam}`]) * 100} />
                                </div>
                            </Sider>
                        )}
                    </Layout>
                </Layout>
            }
            {error && notification.error({
                message: 'Thông báo',
                description: 'Lấy dữ liệu đề thi thất bại',
            })}
            {contextHolder}
        </Spin>
    );
}

