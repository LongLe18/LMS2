const path = require('path');
const { Op } = require('sequelize');
const fs = require('fs');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);

const {
    Exam,
    StudentExam,
    SelectedAnswer,
    Question,
    Answer,
    Course,
    DGTDCriteria,
    DGTDEvaluate,
} = require('../models');
const sequelize = require('../utils/db');

const findAll = async (req, res) => {
    const { count, rows } = await DGTDEvaluate.findAndCountAll({
        include: {
            model: Course,
            attributes: ['khoa_hoc_id', 'ten_khoa_hoc'],
        },
        where: {
            ...(req.query.khoa_hoc_id && {
                khoa_hoc_id: req.query.khoa_hoc_id,
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

const findOne = async (req, res) => {
    const evaluate = await DGTDEvaluate.findOne({
        include: {
            model: Course,
            attributes: ['khoa_hoc_id', 'ten_khoa_hoc'],
        },
        where: {
            danh_gia_dgtd_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: evaluate,
    });
};

const create = async (req, res) => {
    // check nếu đề thi đã có đánh giá của phần thi đó thì không thể tạo mới
    const check = await DGTDEvaluate.findOne({
        where: {
            khoa_hoc_id: req.body.khoa_hoc_id,
            phan_thi: req.body.phan_thi,
            cau_bat_dau: req.body.cau_bat_dau,
            cau_ket_thuc: req.body.cau_ket_thuc,
        },
    });
    if (check) {
        // Đã có phần thi này của đề thi
        // nếu khoảng bắt đầu và kết thúc khác thì cho phép tạo mới
        return res.status(400).send({
            status: 'error',
            data: null,
            message: 'Khóa học đã có đánh giá của phần thi này',
        });
    }

    const danh_gia = await DGTDEvaluate.create({
        ...req.body,
    });
    return res.status(200).send({
        status: 'success',
        data: danh_gia,
        message: 'Tạo mới thành công',
    });
};

const update = async (req, res) => {
    // check nếu đề thi đã có đánh giá của phần thi đó thì không thể tạo mới
    await DGTDEvaluate.update(
        {
            ...req.body,
        },
        {
            where: {
                danh_gia_dgtd_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'Cập nhật thành công',
    });
};

const remove = async (req, res) => {
    await DGTDEvaluate.destroy({
        where: {
            danh_gia_dgtd_id: req.params.id,
        },
    });

    return res.status(200).send({
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
                    attributes: ['khoa_hoc_id'],
                },
            ],
            where: {
                dthv_id: req.params.id,
            },
        });
        const criteria = await DGTDCriteria.findOne({
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
            result = false;
            if (selectedAnswer.cau_hoi.loai_cau_hoi === 0) {
                if (
                    selectedAnswer.noi_dung_tra_loi &&
                    selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an &&
                    selectedAnswer.noi_dung_tra_loi.trim().toLowerCase() ==
                        selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an.toLowerCase()
                )
                    result = true;
            } else if (selectedAnswer.cau_hoi.loai_cau_hoi === 1) {
                // Câu trắc nghiệm
                ket_qua_chons = selectedAnswer.ket_qua_chon
                    .toString()
                    .split('');
                dap_ans = selectedAnswer.cau_hoi.dap_ans;
                if (
                    ket_qua_chons.every(
                        (ket_qua_chon, index) =>
                            (ket_qua_chon === '1') ===
                            dap_ans[index].dap_an_dung
                    )
                ) {
                    result = true;
                }
            } else if (selectedAnswer.cau_hoi.loai_cau_hoi === 2) {
                ket_qua_chons = selectedAnswer.ket_qua_chon
                    .toString()
                    .split('');
                dap_ans = selectedAnswer.cau_hoi.dap_ans;
                if (
                    ket_qua_chons.every(
                        (ket_qua_chon, index) =>
                            (ket_qua_chon === '1') ===
                            dap_ans[index].dap_an_dung
                    )
                ) {
                    result = true;
                }
            } else if (selectedAnswer.cau_hoi.loai_cau_hoi === 3) {
                // nếu không chọn thì để là "_"
                ket_qua_chons = selectedAnswer.ket_qua_chon
                    .toString()
                    .split('');
                dap_ans = selectedAnswer.cau_hoi.dap_ans;
                if (
                    ket_qua_chons.every(
                        (ket_qua_chon, index) =>
                            ket_qua_chon !== '_' &&
                            (ket_qua_chon === '1') ===
                                dap_ans[index].dap_an_dung
                    )
                ) {
                    result = true;
                }
            } else if (selectedAnswer.cau_hoi.loai_cau_hoi === 4) {
                // nếu không chọn thì để là "_"
                ket_qua_chons = selectedAnswer.ket_qua_chon
                    .toString()
                    .split('');
                dap_ans = selectedAnswer.cau_hoi.dap_ans;
                if (
                    ket_qua_chons.every(
                        (ket_qua_chon, index) =>
                            ket_qua_chon !== '_' &&
                            (ket_qua_chon === '1') ===
                                dap_ans[index].dap_an_dung
                    )
                ) {
                    result = true;
                }
            } else if (selectedAnswer.cau_hoi.loai_cau_hoi === 5) {
                // nếu không nhập thì để là "_"
                noi_dung_dap_ans = selectedAnswer.cau_hoi.dap_ans[0]
                    .noi_dung_dap_an
                    ? selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an.split(
                          ';'
                      )
                    : '';
                if (
                    selectedAnswer.noi_dung_tra_loi &&
                    noi_dung_dap_ans &
                        selectedAnswer.noi_dung_tra_loi
                            .split(';')
                            .every(
                                (noi_dung_tra_loi, index) =>
                                    noi_dung_tra_loi.trim().toLowerCase() ===
                                    noi_dung_dap_ans[index].trim().toLowerCase()
                            )
                ) {
                    result = true;
                }
            } else if (selectedAnswer.cau_hoi.loai_cau_hoi === 6) {
                // nếu không nhập thì để là "_"
                noi_dung_dap_ans = selectedAnswer.cau_hoi.dap_ans[0]
                    .noi_dung_dap_an
                    ? selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an.split(
                          ';'
                      )
                    : '';
                if (
                    selectedAnswer.noi_dung_tra_loi &&
                    noi_dung_dap_ans &
                        selectedAnswer.noi_dung_tra_loi
                            .split(';')
                            .every(
                                (noi_dung_tra_loi, index) =>
                                    noi_dung_tra_loi.trim().toLowerCase() ===
                                    noi_dung_dap_ans[index].trim().toLowerCase()
                            )
                ) {
                    result = true;
                }
            }
            if (result) {
                ket_qua_diem += parseFloat(selectedAnswer.cau_hoi.diem);
                so_cau_tra_loi_dung++;

                if (selectedAnswer.cau_hoi.chuyen_nganh_id === 10) {
                    phan_1 += parseFloat(selectedAnswer.cau_hoi.diem);
                } else if (selectedAnswer.cau_hoi.chuyen_nganh_id === 11) {
                    phan_2 += parseFloat(selectedAnswer.cau_hoi.diem);
                } else {
                    phan_3 += parseFloat(selectedAnswer.cau_hoi.diem);
                }
            }
        }

        tong_diem = phan_1 + phan_2 + phan_3;

        let evaluate_1 = await DGTDEvaluate.findOne({
            where: {
                khoa_hoc_id: studentExam.de_thi.khoa_hoc_id,
                phan_thi: 1,
                cau_bat_dau: {
                    [Op.lte]: phan_1,
                },
                cau_ket_thuc: {
                    [Op.gte]: phan_1,
                },
            },
        });
        let evaluate_2 = await DGTDEvaluate.findOne({
            where: {
                khoa_hoc_id: studentExam.de_thi.khoa_hoc_id,
                phan_thi: 2,
                cau_bat_dau: {
                    [Op.lte]: phan_2,
                },
                cau_ket_thuc: {
                    [Op.gte]: phan_2,
                },
            },
        });
        let evaluate_3 = await DGTDEvaluate.findOne({
            where: {
                khoa_hoc_id: studentExam.de_thi.khoa_hoc_id,
                phan_thi: 3,
                cau_bat_dau: {
                    [Op.lte]: phan_3,
                },
                cau_ket_thuc: {
                    [Op.gte]: phan_3,
                },
            },
        });

        const content = fs.readFileSync(
            path.resolve(
                process.cwd(),
                'public/templates/form_export_dgtd.docx'
            ),
            'binary'
        );

        const zip = new PizZip(content);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        doc.render({
            phan_1: phan_1,
            phan_2: phan_2,
            phan_3: phan_3,
            diem_tong_hop: tong_diem,
            nhan_xet_1: evaluate_1 ? evaluate_1.danh_gia : '',
            nhan_xet_2: evaluate_2 ? evaluate_2.danh_gia : '',
            nhan_xet_3: evaluate_3 ? evaluate_3.danh_gia : '',
            nhan_xet_chung:
                tong_diem >= 0 && tong_diem < 61
                    ? 'TRUNG BÌNH'
                    : tong_diem >= 61 && tong_diem < 96
                    ? 'KHÁ'
                    : tong_diem >= 96 && tong_diem < 126
                    ? 'GIỎI'
                    : 'XUẤT SẮC',
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
        return res.send(reportPdf);
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            status: 'error',
            data: null,
            message: err,
        });
    }
};

module.exports = {
    findAll,
    findOne,
    create,
    update,
    remove,
    download,
};
