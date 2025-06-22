import React, { useState, useRef } from 'react';
import { Modal, Row, Col, Button, Space, Divider, Alert, Image, Typography, Radio,
    Input, Checkbox, Tag
 } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, EyeOutlined, 
    EyeInvisibleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import MathJax from 'react-mathjax';
import config from '../../../../configs/index';

const { Title, Text } = Typography
const { TextArea } = Input

const ViewExam = (props) => {
    // props: 
    // exam, isExamViewModalVisible, setIsExamViewModalVisible,
    const regex = /\\begin{center}\\includegraphics\[scale = 0\.5\]{(.*?)}\\end{center}/;
    const scrollContainerRef = useRef(null);
    const [results, setResults] = useState([]);
    const [help, setHelp] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Tính tổng số điểm của đề thi
    const calSum = () => {
        let sum = 0;
        if (props?.exam) {
            props?.exam?.cau_hoi_de_this?.map((question, index) => {
                sum += parseInt(question.cau_hoi.diem);
                return null;
            });
        }
        return sum;
    };  

    const renderAnswerKey = (index) => {
        if (index === 4) return 'E';
        if (index === 5) return 'F';
        if (index === 6) return 'G';
        if (index === 3) return 'D';
        else if (index === 2) return 'C';
        else if (index === 1) return 'B';
        else if (index === 0) return 'A';
        else return '';
    };

    const getAnswerCols = (type) => {
        if (type === 1) return 24;
        else if (type === 2) return 12;
        else if (type === 3) return 8;
        else if (type === 4) return 6;
        else return 24;
    };

    const renderAnswer = (question, answer, index) => {
        return (
            <div className={`answer ${answer.dap_an_dung === true ? 'correct' : ''} `}>
                <span className="answer-label">{renderAnswerKey(index)}</span>
                <div className="answer-content">             
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
            </div>
        );
    };

    // giao diện câu hỏi Tự luận
    const renderUIEssay = (question) => {
        return (
            <button  style={{width:"100%"}}
                className="btn-onclick"
            >
                <TextArea rows={4} style={{width:"100%"}} onChange={(e) => {
                    const isAswered = results.find((item) => item.cau_hoi_id === question.cau_hoi_id);
                    if (isAswered) {
                        const newAnsers = results.map((item) => (item.cau_hoi_id === question.cau_hoi_id ? { ...item, noi_dung: e.target.value, gia_tri_dap_an: e.target.value, loai_dap_an: false } : item));
                        setResults(newAnsers);
                    } else {
                        setResults([...results, { cau_hoi_id: question.cau_hoi_id, noi_dung: e.target.value, gia_tri_dap_an: e.target.value, loai_dap_an: false }]);
                    }
                }}/>
            </button>
        )
    }
    
    const isCorrectQuestionDungSai = (question, index, boolCheck) => {
        // return true / false
        // boolCheck: true => Lựa chọn option đúng
        // boolCheck: false => Lựa chọn option sai
    
        if (question?.dap_ans) {
            if (boolCheck) {
                return question?.dap_ans[0]?.noi_dung_dap_an === 'Đúng';
            } else {
                return question?.dap_ans[0]?.noi_dung_dap_an === 'Sai';
            }
        }
    }   
    
    // giao diện câu hỏi Đúng sai
    const renderRightWrongQuestion = (isAnswered, index, question, answer) => {
        return (
          <div>
              <Row style={{marginTop: 12}}>
                  <div className="option-answer"></div>
                  <div style={{fontWeight: 700, width: '12%', fontSize: 16}}>ĐÚNG</div>
                  <div style={{fontWeight: 700, width: '12%', fontSize: 16}}>SAI</div>
              </Row>
              <Row>
                  <div className="option-answer"></div>
                  <div className='wrongrightAnswer' style={{width: '24%'}}>
                      <div style={{width: '50%'}}>
                          <button id={`button-Right-${index}`}
                              className={`btn-DS ${isAnswered && isAnswered.ket_qua_chon[index] === '1' ? 'active' : '' } 
                                  ${!isCorrectQuestionDungSai(question.cau_hoi, index, true)  ? 'no-thing' : ''}
                                  ${isCorrectQuestionDungSai(question.cau_hoi, index, true) ? 'correct' : ''}`
                              }
                          >
                              <span style={{color: 'white'}}></span>
                          </button>
    
                      </div>
                      <div style={{width: '50%'}}>
                          <button id={`button-Wrong-${index}`}
                              className={`btn-DS ${isAnswered && isAnswered.ket_qua_chon[index] === '0' ? 'active' : '' }
                                  ${!isCorrectQuestionDungSai(question.cau_hoi, index, false) ? `no-thing` : ''}
                                  ${isCorrectQuestionDungSai(question.cau_hoi, index, false) ? 'correct' : ''}`
                              }
                          >
                              <span style={{color: 'white'}}></span>
                          </button>
                      </div>
                  </div>
              </Row>
          </div>
        )
    }
      
    // giao diện câu hỏi Kéo thả
    const renderDragDropQuestion = (question, index) => {
        return (
            <>
                <div style={{fontSize: 20, color: 'rgb(153, 153, 153)'}}>Chú ý: Kéo thả đáp án phù hợp vào chổ trống</div>
                    
                <div className='fill-box-question'>
                    <div style={{margin: 12}}>
                        <Space wrap >
                            {question?.cau_hoi?.lua_chon?.noi_dung?.split(';').map((lua_chon, index) => (
                                <Tag style={{fontSize: 20, padding: '7px 14px'}}
                                    key={'tag_' + index}
                                    className={`cursor-move`}
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
                            ))}
                        </Space>
                    </div>
                    
                    {question?.cau_hoi?.cau_hoi_chi_tiets?.map((cau_hoi, index) => {
                        const partCauhoi = cau_hoi?.noi_dung?.split('{ENTER}');
                        return (
                            <div key={'cau_hoi_chi_tiet_' + index} style={{fontSize: 20, marginBottom: 8, display:'-webkit-box'}}>
                                {index + 1}. 
                                <MathJax.Provider>
                                    {partCauhoi.map((chi_tiet, index_2) => {
                                        const contentQuestion_1 = chi_tiet.split('\n').filter(item => item !== '').map((item, index) => {
                                            return (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                <div style={{display: 'flex', justifyContent: 'center', width: '100%'}} key={index}>
                                                    <Image src={config.API_URL + `/${item?.match(regex)[1]}`} alt={`img_question4_${index}`}></Image>
                                                </div>
                                            ) : 
                                            (
                                                <>{item.split('$').map((item2, index2) => {
                                                    return (item.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
                                                        <MathJax.Node key={index2} formula={item2} />
                                                    ) : (
                                                        <span style={{marginLeft: 6, marginRight: 6}} key={index2} dangerouslySetInnerHTML={{ __html: item2 }}></span>
                                                    )
                                                })}</>
                                        )})
                                        
                                        let contentQuestion2;
                                        if (index_2 < partCauhoi.length - 1) {
                                            contentQuestion2 = <div className={`empty-box`}></div>;
                                        }
                                            return contentQuestion_1.concat(contentQuestion2);
                                        })
                                    }
                                </MathJax.Provider>
                            </div>
                        )
                    })}
                </div>
            </>
        )
    }
      
    // giao diện câu hỏi chọn nhiều đáp án
    const renderMultiChoiceQuestion = (question, answer, index) => {
        return (
            <button  style={{width:"100%"}}
                className="btn-onclick"
            >
                <div className={`answer`}>
                    <Checkbox checked={answer.dap_an_dung}>
                        <div className="answer-content">
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
                    </Checkbox>
                </div>
            </button>
        );
    };
      
    // giao diện câu hỏi đúng sai chọn nhiều
    const renderMultiChoiceRightWrongQuestion = (question, answer, index) => {
        return (
            <Row className={`answer`} style={{alignItems: 'center', width: '100%', marginBottom: 12}}>
                <Col span={21}>
                    <div className="answer-content" style={{flexDirection: 'row', marginTop: 0, paddingLeft: 0}}>
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
                <Col span={3}>
                    <Radio.Group name="groupRightWrong" defaultValue={answer.dap_an_dung} 
                        style={{display: 'flex', justifyContent: 'space-around'}}
                    >
                        <Radio value={true}></Radio>
                        <Radio value={false}></Radio>
                    </Radio.Group>
                </Col>
            </Row>
        );
    }

    // Hiện thị đáp án đúng
      const renderAnswerResult = (question) => {
        if (props?.exam) {
          return (
              <p className="result-exam-item">
                  {(() => {
                      if (question?.cau_hoi?.loai_cau_hoi === 1 || question?.cau_hoi?.loai_cau_hoi === 2 || question?.cau_hoi?.loai_cau_hoi === 3) {
                          return <span className="right-answer">Đáp án đúng: {question?.cau_hoi.dap_an_dungs?.map((item) => renderAnswerKey(item)).join(', ')}</span>;
                      } else if (question?.cau_hoi?.loai_cau_hoi === 6) {
                          return (
                              <span className="right-answer">
                                  Đáp án đúng: {
                                      question?.cau_hoi.dap_ans[0]?.noi_dung_dap_an.split(';').map((item, index) => {
                                          return (
                                              <MathJax.Provider key={index}>
                                                  {item.split('\n').map((subitem, index_cauhoi) => {
                                                      return (
                                                          <div className="title-exam-content" key={index_cauhoi} style={{display: 'flex'}}>
                                                              <span style={{fontSize: 16, marginRight: 6}}>{index + 1}.</span>
                                                              {
                                                                  (subitem.indexOf('includegraphics') !== -1 && subitem?.match(regex) !== null) ? (
                                                                      <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}><Image src={config.API_URL + `/${item.match(regex)[1]}`} alt={`img_question2_${index_cauhoi}`}></Image></div>
                                                                  ) : 
                                                                  (
                                                                      <div style={{textAlign: 'justify'}}>{subitem.split('$').map((item2, index2) => {
                                                                          return (subitem.indexOf('$' + item2 + '$') !== -1 && (item2.includes('{') || item2.includes('\\')) && (!item2.includes('\\underline') && !item2.includes('\\bold') && !item2.includes('\\italic'))) ? (
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
                                          )
                                      })
                                  }
                              </span>
                          );
                      } else {
                          return <span className="right-answer" dangerouslySetInnerHTML={{ __html: `Đáp án đúng: ${question?.cau_hoi.dap_ans[0]?.noi_dung_dap_an}` }}></span>;
                      }
                  })()}
              </p>
          );
        }
    };

    return (
        <Modal
            title={props?.exam?.ten_de_thi || "Xem đề thi tổng hợp"}
            open={props?.isExamViewModalVisible}
            onCancel={() => {
                props?.setIsExamViewModalVisible(false)
            }}
            footer={null}
            width={1200}
            centered
            className="exam-view-modal"
            bodyStyle={{
            }}
        >
          {props?.exam && (
            <div >
              {/* Exam Info Header */}
              <Row gutter={24}>
                <Col span={8}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#fff3cd",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileTextOutlined style={{ color: "#856404" }} />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: "24px", display: "block" }}>
                        {calSum()} điểm
                      </Text>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Điểm số
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#e6f7ff",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ClockCircleOutlined style={{ color: "#1890ff" }} />
                    </div>
                    <div>
                      <Text strong style={{ fontSize: "24px", display: "block" }}>
                        {props?.exam?.thoi_gian} phút
                      </Text>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Thời gian làm
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={8} style={{display: 'flex', justifyContent: 'flex-end'}}>
                  <Space>
                    <Button icon={!props?.exam?.trang_thai ? <EyeOutlined /> : <EyeInvisibleOutlined />} style={{ borderRadius: "6px" }}
                      onClick={() => props?.handlePublishExam(props?.exam)} // done
                    >
                      {!props?.exam?.trang_thai ? "Xuất bản" : "Ngừng xuất bản"}
                    </Button>
                    
                  </Space>
                </Col>
              </Row>
              <Divider style={{ margin: "16px 0" }} />

              <Row gutter={24} className="wraper-exam" >
            
                <Col span={20} className="question-content" style={{maxHeight: '70vh', overflowY: 'auto'}} ref={scrollContainerRef}>
                  {/* Question Content */}
                    {props?.exam?.cau_hoi_de_this?.map((question, ParentIndex) => {
                        return (
                            <>
                                {((question?.cau_hoi?.trich_doan && question?.cau_hoi?.exceprtFrom !== undefined && question?.cau_hoi?.exceprtTo !== undefined) || (question.cau_hoi?.trich_doan?.loai_trich_doan_id === 0)) &&
                                    <>  
                                        {(question.cau_hoi?.trich_doan?.loai_trich_doan_id !== 0) &&
                                            <>
                                                <span className="exceprt-label">
                                                    {`${question.cau_hoi?.trich_doan?.loai_trich_doan?.noi_dung} ${question.cau_hoi.exceprtFrom + 1}`} 
                                                    {question.cau_hoi.chuyen_nganh_id === 5 ? ' to ' : ' đến '} 
                                                    {question.cau_hoi.exceprtTo + 1}
                                                </span>
                                                <br/>
                                            </>
                                        } 
                                        <div className="answer-content" style={{paddingLeft: '0px'}}>             
                                            <MathJax.Provider>
                                                {question.cau_hoi?.trich_doan?.noi_dung?.split('\n').filter((item) => item !== '').map((item, index_cauhoi) => {
                                                    return (
                                                        <div className="title-exam-content" key={index_cauhoi}>
                                                            {
                                                                (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                                    <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}><Image src={config.API_URL + `/${item?.match(regex)[1]}`} alt={`img_cauhoi_${index_cauhoi}`}></Image></div>
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
                                    </>
                                }               
                                <div className="question-list" key={ParentIndex}>
                                    <div className="question-info" id={`${ParentIndex + 1}`}>
                                        <b style={{fontSize: "22px", color: "#fff", backgroundColor: 'green'}}>Câu {ParentIndex + 1}. 
                                            {/* <span className="point">[{question?.cau_hoi?.diem} điểm]</span> */}
                                            {/* <span style={{display: question.cau_hoi.loai_cau_hoi === 4 ? 'block' : 'none'}} className="point">[Câu trắc nghiệm đúng sai]</span> */}
                                        </b>
                                        <ul className="action-links"></ul>
                                    </div>

                                    <div className="title-exam">
                                        <MathJax.Provider>
                                            {question.cau_hoi.noi_dung.split('\n').filter(item => item !== '').map((item, index_cauhoi) => {
                                                const partQuestion = item.split('{ENTER}');

                                                return (
                                                    <div className="title-exam-content" key={index_cauhoi}>
                                                        {
                                                            (item.indexOf('includegraphics') !== -1 && item?.match(regex) !== null) ? (
                                                                <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                                                                    <Image src={config.API_URL + `/${item.match(regex)[1]}`} alt={`img_question2_${index_cauhoi}`}></Image>
                                                                </div>
                                                            ) : 
                                                            (
                                                                <div style={{textAlign: 'justify'}}>{partQuestion.map((item2, index2) => {
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
                                                                            {index2 < partQuestion.length - 1 && (
                                                                                <div className={`empty-box`}></div>
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
                                                         
                                    <div className="content-answer-question">
                                        {question.cau_hoi.loai_cau_hoi === 3 &&
                                            <Row>
                                                <Col span={21}></Col>
                                                <Col span={3} style={{display: 'flex', justifyContent: 'space-around'}}>
                                                    <span style={{ fontSize: 20, fontWeight: 600 }}>Đúng</span>
                                                    <span style={{ fontSize: 20, fontWeight: 600 }}>Sai</span>
                                                </Col>
                                            </Row>
                                        }

                                        <Row gutter={[20, 10]} className="multi-choice">
                                            {question.cau_hoi.dap_ans.map((answer, index) => {
                                                const isAnswered = results.find((it) => it.cau_hoi_id === question.cau_hoi_id);
                                                return (
                                                    <Col xs={24} sm={24} md={getAnswerCols(question.cau_hoi.cot_tren_hang)} key={index}>
                                                        <ul key={'key_' + index}>
                                                            <li className={`item ${isAnswered && isAnswered.dap_an === renderAnswerKey(index) ? 'active' : ''}`}>
                                                                {(question.cau_hoi.loai_cau_hoi === 1) ?
                                                                    <button  style={{width:"100%"}}
                                                                        className="btn-onclick"
                                                                    >
                                                                        {renderAnswer(question.cau_hoi, answer, index)}
                                                                    </button>
                                                                : (question.cau_hoi.loai_cau_hoi === 0) ?
                                                                    renderUIEssay(question)
                                                                : (question.cau_hoi.loai_cau_hoi === 4) ?
                                                                    renderRightWrongQuestion(isAnswered, index, question, answer) 
                                                                : (question.cau_hoi.loai_cau_hoi === 6) ?
                                                                    renderDragDropQuestion(question, index)
                                                                : (question.cau_hoi.loai_cau_hoi === 2) ? 
                                                                    renderMultiChoiceQuestion(question, answer, index)
                                                                : (question.cau_hoi.loai_cau_hoi === 3) ?
                                                                    renderMultiChoiceRightWrongQuestion(question, answer, index)
                                                                : null
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
                                                        <MathJax.Provider>
                                                            {question?.cau_hoi?.loi_giai?.split('\n').filter((item) => item !== '').map((item, index_cauhoi) => {
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
                <Col span={4} >
                    <Title level={5} style={{ marginBottom: "12px" }}>
                        Câu hỏi
                    </Title>
                    <div
                        style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: "2px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        }}
                    >
                    {props?.exam?.cau_hoi_de_this?.map((_, index) => (
                        <Button
                            key={index}
                            size="small"
                            type={currentQuestionIndex === index ? "primary" : "default"}
                            onClick={() => {
                                setCurrentQuestionIndex(index);
                                const container = scrollContainerRef.current;
                                const element = document?.getElementById(index + 1);
                                const offset = 80; // tuỳ chỉnh theo chiều cao header trong Modal
                                if (container && element) {
                                    const containerTop = container.getBoundingClientRect().top;
                                    const elementTop = element.getBoundingClientRect().top;
                                    const scrollOffset = elementTop - containerTop + container.scrollTop - offset;
                                    console.log(container, element, scrollOffset)
                                    container.scrollTo({
                                    top: scrollOffset,
                                    behavior: 'smooth',
                                    });
                                }
                            }}
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "4px",
                                fontSize: "12px",
                            }}
                        >
                            {index + 1}
                        </Button>
                    ))}
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
        
    )
}

export default ViewExam;