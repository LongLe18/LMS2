const {
    Evaluate,
    OnlineCriteria,
    Exam,
    StudentExam,
    SelectedAnswer,
    Question,
    Answer,
    Course,
} = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../utils/db');
const fs = require('fs');
const e = require('cors');
const security = require('../utils/security');
const path = require('path');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);

const getAll = async (req, res) => {
    const { count, rows } = await Evaluate.findAndCountAll({
        include: {
            model: Exam,
            attributes: ['de_thi_id', 'ten_de_thi'],
        },
        where: {
            ...(req.query.de_thi_id
                ? {
                      de_thi_id: req.query.de_thi_id,
                  }
                : {
                      de_thi_id: {
                          [Op.not]: null,
                      },
                  }),
        },
        offset:
            (Number(req.query.pageIndex || 1) - 1) *
            Number(req.query.pageSize || 10),
        limit: Number(req.query.pageSize || 10),
        order: [
            req.query.sortBy
                ? req.query.sortBy.split(',')
                : ['ngay_tao', 'DESC'],
        ],
    });

    return res.status(200).send({
        status: 'success',
        data: rows,
        pageIndex: Number(req.query.pageIndex || 1),
        pageSize: Number(req.query.pageSize || 10),
        totalCount: count,
        totalPage: Math.ceil(count / Number(req.query.pageSize || 10)),
        message: null,
    });
};

const getAllv2 = async (req, res) => {
    const { count, rows } = await Evaluate.findAndCountAll({
        include: {
            model: Course,
            attributes: ['khoa_hoc_id', 'ten_khoa_hoc'],
        },
        where: {
            ...(req.query.khoa_hoc_id
                ? {
                      khoa_hoc_id: req.query.khoa_hoc_id,
                  }
                : {
                      khoa_hoc_id: {
                          [Op.not]: null,
                      },
                  }),
        },
        offset:
            (Number(req.query.pageIndex || 1) - 1) *
            Number(req.query.pageSize || 10),
        limit: Number(req.query.pageSize || 10),
        order: [
            req.query.sortBy
                ? req.query.sortBy.split(',')
                : ['ngay_tao', 'DESC'],
        ],
    });

    return res.status(200).send({
        status: 'success',
        data: rows,
        pageIndex: Number(req.query.pageIndex || 1),
        pageSize: Number(req.query.pageSize || 10),
        totalCount: count,
        totalPage: Math.ceil(count / Number(req.query.pageSize || 10)),
        message: null,
    });
};

const getById = async (req, res) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            res.status(401).send({
                status: 'success',
                data: null,
                message: 'Bạn không có quyền đọc đánh giá này',
            });
        } else {
            const evaluate = await sequelize.query(
                `
                SELECT danh_gia.*, de_thi.ten_de_thi FROM danh_gia JOIN de_thi 
                ON danh_gia.de_thi_id = de_thi.de_thi_id WHERE danh_gia.danh_gia_id=${req.params.id}`,
                { type: sequelize.QueryTypes.SELECT }
            );
            res.status(200).send({
                status: 'success',
                data: evaluate[0],
                message: null,
            });
        }
    } catch (error) {
        res.status(401).send({
            status: 'success',
            data: null,
            message: 'Bạn không có quyền đọc đánh giá này ' + error,
        });
    }
};

const postCreate = async (req, res) => {
    // check nếu đề thi đã có đánh giá của phần thi đó thì không thể tạo mới

    const check = await Evaluate.findOne({
        where: {
            de_thi_id: req.body.de_thi_id,
            phan_thi: req.body.phan_thi,
        },
    });
    if (check) {
        // Đã có phần thi này của đề thi
        // nếu khoảng bắt đầu và kết thúc khác thì cho phép tạo mới
        if (
            check.cau_bat_dau !== req.body.cau_bat_dau &&
            check.cau_ket_thuc !== req.body.cau_ket_thuc
        ) {
            const danh_gia = await Evaluate.create({
                ...req.body,
            });
            res.status(200).send({
                status: 'success',
                data: danh_gia,
                message: 'Tạo mới thành công',
            });
            return;
        } else {
            res.status(400).send({
                status: 'error',
                data: null,
                message: 'Đề thi đã có đánh giá của phần thi này',
            });
            return;
        }
    }

    const danh_gia = await Evaluate.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: danh_gia,
        message: 'Tạo mới thành công',
    });
};

const putUpdate = async (req, res) => {
    // check nếu đề thi đã có đánh giá của phần thi đó thì không thể tạo mới

    const check = await Evaluate.findOne({
        where: {
            de_thi_id: req.body.de_thi_id,
            phan_thi: req.body.phan_thi,
        },
    });
    // if (check) {
    //     // Nếu câu bắt đầu hoặc câu kết thúc khác thì cho phép update
    //     if (
    //         check.cau_bat_dau !== req.body.cau_bat_dau ||
    //         check.cau_ket_thuc !== req.body.cau_ket_thuc
    //     ) {
    //         await Evaluate.update(
    //             {
    //                 ...req.body,
    //             },
    //             {
    //                 where: {
    //                     danh_gia_id: req.params.id,
    //                 },
    //             }
    //         );
    //         res.status(200).send({
    //             status: 'success',
    //             data: null,
    //             message: 'Cập nhật thành công',
    //         });
    //         return;
    //     } else {
    //         res.status(400).send({
    //             status: 'error',
    //             data: null,
    //             message: 'Đề thi đã có đánh giá của phần thi này',
    //         });
    //         return;
    //     }
    // }

    await Evaluate.update(
        {
            ...req.body,
        },
        {
            where: {
                danh_gia_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'Cập nhật thành công',
    });
};

const deleteById = async (req, res) => {
    await Evaluate.destroy({
        where: {
            danh_gia_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'Xóa thành công',
    });
};

const download = async (req, res) => {
    try {
        const studentExam = await StudentExam.findOne({
            include: [
                {
                    model: Exam,
                    attributes: ['ten_de_thi', 'khoa_hoc_id'],
                },
            ],
            where: {
                dthv_id: req.params.id,
            },
        });
        const criteria = await OnlineCriteria.findOne({
            where: {
                khoa_hoc_id: studentExam.de_thi.khoa_hoc_id,
            },
        });
        if (!criteria) {
            return res.status(400).send({
                status: 'error',
                message: 'Không tồn tại tiêu chí đề thi',
            });
        }

        const selectedAnswers = await SelectedAnswer.findAll({
            include: {
                model: Question,
                attributes: ['loai_cau_hoi', 'diem'],
                include: {
                    model: Answer,
                    attributes: ['noi_dung_dap_an', 'dap_an_dung'],
                },
            },
            where: {
                dthv_id: req.params.id,
            },
            order: [[sequelize.col('dap_an_id'), 'ASC']],
        });
        let ket_qua_diem = [];
        let ket_qua_chons;
        let dap_ans;
        let result;
        for (const selectedAnswer of selectedAnswers) {
            result = false;

            if (
                selectedAnswer.cau_hoi &&
                selectedAnswer.cau_hoi.loai_cau_hoi === 1
            ) {
                // Câu trắc nghiệm
                ket_qua_chons = selectedAnswer.ket_qua_chon
                    .toString()
                    .split('');
                dap_ans = selectedAnswer.cau_hoi.dap_ans;
                if (
                    ket_qua_chons.every(
                        (ket_qua_chon, index) =>
                            ket_qua_chon == dap_ans[index].dap_an_dung
                    )
                )
                    result = true;
            } else if (
                selectedAnswer.cau_hoi &&
                selectedAnswer.cau_hoi.loai_cau_hoi === 2
            ) {
                // Câu trắc nghiệm đúng sai
                const ket_qua_chons = [
                    ...selectedAnswer.ket_qua_chon.toString(),
                ];
                const dap_ans = selectedAnswer.cau_hoi.dap_ans;
                const bangDiem = {
                    0: 0,
                    1: selectedAnswer.cau_hoi.diem / 10,
                    2: selectedAnswer.cau_hoi.diem / 4,
                    3: selectedAnswer.cau_hoi.diem / 2,
                };
                let so_cau_dung = ket_qua_chons.reduce(
                    (acc, ket_qua_chon, index) =>
                        acc +
                        ((ket_qua_chon === '1') === dap_ans[index].dap_an_dung),
                    0
                );
                // if (so_cau_dung) {
                //     ket_qua_diem.push(1);
                //     continue;
                // }
                if (so_cau_dung === 4) result = true;
            } else {
                // câu tự luận
                if (
                    selectedAnswer.cau_hoi &&
                    selectedAnswer.cau_hoi.loai_cau_hoi === 0 &&
                    selectedAnswer.noi_dung_tra_loi &&
                    selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an &&
                    selectedAnswer.noi_dung_tra_loi.trim().toLowerCase() ==
                        selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an
                            .trim()
                            .toLowerCase()
                )
                    result = true;
            }
            if (result) {
                ket_qua_diem.push(1);
            } else {
                ket_qua_diem.push(0);
            }
        }

        const phan_1 =
            criteria && criteria.so_phan >= 1
                ? ket_qua_diem
                      .slice(0, criteria.so_cau_hoi_phan_1)
                      .reduce(
                          (accumulator, currentValue) =>
                              accumulator + currentValue,
                          0
                      )
                : 0;
        const phan_2 =
            criteria && criteria.so_phan >= 2
                ? ket_qua_diem
                      .slice(
                          criteria.so_cau_hoi_phan_1,
                          criteria.so_cau_hoi_phan_1 +
                              criteria.so_cau_hoi_phan_2
                      )
                      .reduce(
                          (accumulator, currentValue) =>
                              accumulator + currentValue,
                          0
                      )
                : 0;
        const phan_3 =
            criteria && criteria.so_phan >= 3
                ? ket_qua_diem
                      .slice(
                          criteria.so_cau_hoi_phan_1 +
                              criteria.so_cau_hoi_phan_2,
                          criteria.so_cau_hoi_phan_1 +
                              criteria.so_cau_hoi_phan_2 +
                              criteria.so_cau_hoi_phan_3
                      )
                      .reduce(
                          (accumulator, currentValue) =>
                              accumulator + currentValue,
                          0
                      )
                : 0;
        const phan_4 =
            criteria && criteria.so_phan >= 4
                ? ket_qua_diem
                      .slice(
                          criteria.so_cau_hoi_phan_1 +
                              criteria.so_cau_hoi_phan_2 +
                              criteria.so_cau_hoi_phan_3,
                          criteria.so_cau_hoi_phan_1 +
                              criteria.so_cau_hoi_phan_2 +
                              criteria.so_cau_hoi_phan_3 +
                              criteria.so_cau_hoi_phan_4
                      )
                      .reduce(
                          (accumulator, currentValue) =>
                              accumulator + currentValue,
                          0
                      )
                : 0;
        const diem_tong_hop = phan_1 + phan_2 + phan_3 + phan_4;
        let evaluate_1 = await Evaluate.findOne({
            where: {
                de_thi_id: studentExam.de_thi_id,
                phan_thi: 1,
                cau_bat_dau: {
                    [Op.lte]: phan_1,
                },
                cau_ket_thuc: {
                    [Op.gte]: phan_1,
                },
            },
        });
        let evaluate_2 = await Evaluate.findOne({
            where: {
                de_thi_id: studentExam.de_thi_id,
                phan_thi: 2,
                cau_bat_dau: {
                    [Op.lte]: phan_2,
                },
                cau_ket_thuc: {
                    [Op.gte]: phan_2,
                },
            },
        });
        let evaluate_3 = await Evaluate.findOne({
            where: {
                de_thi_id: studentExam.de_thi_id,
                phan_thi: 3,
                cau_bat_dau: {
                    [Op.lte]: phan_3,
                },
                cau_ket_thuc: {
                    [Op.gte]: phan_3,
                },
            },
        });
        let evaluate_4 = await Evaluate.findOne({
            where: {
                de_thi_id: studentExam.de_thi_id,
                phan_thi: 4,
                cau_bat_dau: {
                    [Op.lte]: phan_4,
                },
                cau_ket_thuc: {
                    [Op.gte]: phan_4,
                },
            },
        });

        const content = fs.readFileSync(
            path.resolve(process.cwd(), 'public/templates/form_export.docx'),
            'binary'
        );

        const zip = new PizZip(content);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        doc.render({
            mon_thi: studentExam?.de_thi?.ten_de_thi,
            phan_1: criteria.so_cau_hoi_phan_1
                ? `${phan_1}/${criteria.so_cau_hoi_phan_1}`
                : '',
            phan_2: criteria.so_cau_hoi_phan_2
                ? `${phan_2}/${criteria.so_cau_hoi_phan_2}`
                : '',
            phan_3: criteria.so_cau_hoi_phan_3
                ? `${phan_3}/${criteria.so_cau_hoi_phan_3}`
                : '',
            phan_4: criteria.so_cau_hoi_phan_4
                ? `${phan_4}/${criteria.so_cau_hoi_phan_4}`
                : '',
            diem_tong_hop: criteria.so_cau_hoi
                ? `${diem_tong_hop}/${criteria.so_cau_hoi}`
                : '',
            nhan_xet_1: evaluate_1 ? evaluate_1.danh_gia : '',
            nhan_xet_2: evaluate_2 ? evaluate_2.danh_gia : '',
            nhan_xet_3: evaluate_3 ? evaluate_3.danh_gia : '',
            nhan_xet_4: evaluate_4 ? evaluate_4.danh_gia : '',
        });

        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            // compression: DEFLATE adds a compression step.
            // For a 50MB output document, expect 500ms additional CPU time
            compression: 'DEFLATE',
        });

        const reportPdf = await libre.convertAsync(buf, '.pdf', undefined);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="report.pdf"', // Replace 'example.doc' with your desired file name
            'Content-Length': reportPdf.length,
        });

        // Send the buffer as response
        res.send(reportPdf);
    } catch (err) {
        console.log(err);
        res.status(400).send({
            status: 'error',
            data: null,
            message: err,
        });
    }
};

const downloadv2 = async (req, res) => {
    try {
        const studentExam = await StudentExam.findOne({
            include: [
                {
                    model: Exam,
                    attributes: ['ten_de_thi', 'khoa_hoc_id'],
                },
            ],
            where: {
                dthv_id: req.params.id,
            },
        });
        const criteria = await OnlineCriteria.findOne({
            where: {
                khoa_hoc_id: studentExam.de_thi.khoa_hoc_id,
            },
        });
        if (!criteria) {
            return res.status(400).send({
                status: 'error',
                message: 'Không tồn tại tiêu chí đề thi',
            });
        }

        const selectedAnswers = await SelectedAnswer.findAll({
            include: {
                model: Question,
                attributes: ['loai_cau_hoi', 'diem', 'chuyen_nganh_id'],
                include: {
                    model: Answer,
                    attributes: ['noi_dung_dap_an', 'dap_an_dung'],
                },
            },
            where: {
                dthv_id: req.params.id,
            },
            order: [[sequelize.col('dap_an_id'), 'ASC']],
        });

        let ket_qua_chons;
        let tong_diem = 0;
        let phan_1 = 0;
        let phan_2 = 0;
        let phan_3 = 0;
        let diem_tu_luan = 0;
        let dap_ans;
        
        for (const selectedAnswer of selectedAnswers) {
            if (
                selectedAnswer.cau_hoi &&
                selectedAnswer.cau_hoi.loai_cau_hoi === 1
            ) {
                // Câu trắc nghiệm
                ket_qua_chons = selectedAnswer.ket_qua_chon
                    .toString()
                    .split('');
                dap_ans = selectedAnswer.cau_hoi.dap_ans;
                if (
                    ket_qua_chons.every(
                        (ket_qua_chon, index) =>
                            ket_qua_chon == dap_ans[index].dap_an_dung
                    )
                ) {
                    if (selectedAnswer.cau_hoi.chuyen_nganh_id === 1) {
                        phan_1 += selectedAnswer.cau_hoi.diem;
                    } else if (selectedAnswer.cau_hoi.chuyen_nganh_id === 7) {
                        phan_2 += selectedAnswer.cau_hoi.diem;
                    } else {
                        phan_3 += selectedAnswer.cau_hoi.diem;
                    }
                }
            } else if (
                selectedAnswer.cau_hoi &&
                selectedAnswer.cau_hoi.loai_cau_hoi === 2
            ) {
                // Câu trắc nghiệm đúng sai
                const ket_qua_chons = [
                    ...selectedAnswer.ket_qua_chon.toString(),
                ];
                const dap_ans = selectedAnswer.cau_hoi.dap_ans;
                const bangDiem = {
                    0: 0,
                    1: selectedAnswer.cau_hoi.diem / 10,
                    2: selectedAnswer.cau_hoi.diem / 4,
                    3: selectedAnswer.cau_hoi.diem / 2,
                };
                let so_cau_dung = ket_qua_chons.reduce(
                    (acc, ket_qua_chon, index) =>
                        acc +
                        ((ket_qua_chon === '1') === dap_ans[index].dap_an_dung),
                    0
                );
                // if (so_cau_dung) {
                //     ket_qua_diem.push(1);
                //     continue;
                // }
                // if (so_cau_dung === 4) result = true;
            } else {
                // câu tự luận
                if (
                    selectedAnswer.cau_hoi &&
                    selectedAnswer.cau_hoi.loai_cau_hoi === 0 &&
                    selectedAnswer.noi_dung_tra_loi &&
                    selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an &&
                    selectedAnswer.noi_dung_tra_loi.trim().toLowerCase() ==
                        selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an
                            .trim()
                            .toLowerCase()
                ) {
                    if (selectedAnswer.cau_hoi.chuyen_nganh_id === 1) {
                        phan_1 += selectedAnswer.cau_hoi.diem;
                    } else if (selectedAnswer.cau_hoi.chuyen_nganh_id === 7) {
                        phan_2 += selectedAnswer.cau_hoi.diem;
                    } else {
                        phan_3 += selectedAnswer.cau_hoi.diem;
                    }
                    diem_tu_luan += selectedAnswer.cau_hoi.diem;
                }
            }
        }

        tong_diem = phan_1 + phan_2 + phan_3;

        let evaluate_1 = await Evaluate.findOne({
            where: {
                de_thi_id: studentExam.de_thi_id,
                phan_thi: 31,
                cau_bat_dau: {
                    [Op.lte]: tong_diem,
                },
                cau_ket_thuc: {
                    [Op.gte]: tong_diem,
                },
            },
        });
        let evaluate_2 = await Evaluate.findOne({
            where: {
                de_thi_id: studentExam.de_thi_id,
                phan_thi: 32,
                cau_bat_dau: {
                    [Op.lte]: diem_tu_luan / 16,
                },
                cau_ket_thuc: {
                    [Op.gte]: diem_tu_luan / 16,
                },
            },
        });

        const content = fs.readFileSync(
            path.resolve(process.cwd(), 'public/templates/form_export.docx'),
            'binary'
        );

        const zip = new PizZip(content);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        doc.render({
            ten_de_thi: studentExam?.de_thi?.ten_de_thi,
            phan_1: phan_1,
            phan_2: phan_2,
            phan_3: phan_3,
            xep_loai_chung: '',
            nhan_xet_1: evaluate_1 ? evaluate_1.danh_gia : '',
            nhan_xet_2: evaluate_2 ? evaluate_2.danh_gia : '',
        });

        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            // compression: DEFLATE adds a compression step.
            // For a 50MB output document, expect 500ms additional CPU time
            compression: 'DEFLATE',
        });

        const reportPdf = await libre.convertAsync(buf, '.pdf', undefined);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="report.pdf"', // Replace 'example.doc' with your desired file name
            'Content-Length': reportPdf.length,
        });

        // Send the buffer as response
        res.send(reportPdf);
    } catch (err) {
        console.log(err);
        res.status(500).send({
            status: 'error',
            data: null,
            message: err,
        });
    }
};

module.exports = {
    getAll,
    getById,
    postCreate,
    putUpdate,
    deleteById,
    download,
    downloadv2,
    getAllv2,
};
