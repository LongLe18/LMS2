const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { Op } = require('sequelize');

const {
    Exam,
    StudentExam,
    SelectedAnswer,
    Answer,
    Question,
    ThematicCriteria,
    ModunCriteria,
    OnlineCriteria,
    ExamQuestion,
    Student,
    SyntheticCriteria,
    Province,
    DGNLCriteria,
    DGTDCriteria,
    Majoring,
    Exceprt,
} = require('../models');
const sequelize = require('../utils/db');

function removeVietnameseTones(str) {
    return str
        .normalize('NFD') // Tách dấu khỏi ký tự
        .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D') // Chuyển đ -> d
        .replace(/\s+/g, '_') // Thay khoảng trắng bằng _
        .toLowerCase(); // Chuyển về chữ thường (nếu cần)
}

const getAll = async (req, res) => {
    let filter = {};
    if (req.query.de_thi_id) filter.de_thi_id = req.query.de_thi_id;
    if (req.query.mo_dun_id) filter['$de_thi.mo_dun_id$'] = req.query.mo_dun_id;
    if (req.query.loai_de_thi_id)
        filter['$de_thi.loai_de_thi_id$'] = req.query.loai_de_thi_id;
    let studentExams = await StudentExam.findAll({
        include: {
            model: Exam,
            attributes: ['tong_diem'],
        },
        where: {
            ...filter,
            $hoc_vien_id$: req.userId,
        },
    });
    studentExams.forEach((studentExam) => {
        if (studentExam.de_thi)
            studentExam.dataValues.tong_diem = studentExam.de_thi.tong_diem;
        delete studentExam.dataValues.de_thi;
    });
    if (req.query.loai_de_thi_id == 1 || req.query.loai_de_thi_id == 2) {
        let criteria;
        if (req.query.loai_de_thi_id == 1) {
            criteria = await ThematicCriteria.findOne({
                where: {
                    mo_dun_id: req.query.mo_dun_id,
                },
            });
        } else if (req.query.loai_de_thi_id == 2) {
            criteria = await ModunCriteria.findOne({
                where: {
                    mo_dun_id: req.query.mo_dun_id,
                },
            });
        }
        if (criteria) {
            let so_lan_thi_con_lai = criteria.so_lan_thi - studentExams.length;
            studentExams = {
                so_lan_thi_con_lai,
                studentExams,
            };
        } else {
            res.status(404).send({
                status: 'fail',
                data: null,
                message: 'no criteria',
            });
            return;
        }
    }
    res.status(200).send({
        status: 'success',
        data: studentExams,
        message: null,
    });
};

const getAllDGNL = async (req, res) => {
    const { count, rows } = await StudentExam.findAndCountAll({
        include: [
            {
                model: Student,
                attributes: ['hoc_vien_id', 'ho_ten', 'sdt', 'ttp_id'],
                required: true,
                include: {
                    model: Province,
                    attributes: ['ttp_id', 'ten'],
                },
            },
            {
                model: Exam,
                attributes: ['de_thi_id', 'ten_de_thi'],
            },
        ],
        where: {
            ...(req.query.khoa_hoc_id && {
                '$de_thi.khoa_hoc_id$': req.query.khoa_hoc_id,
            }),
            ...(req.query.ngay_bat_dau &&
                req.query.ngay_ket_thuc && {
                    ngay_tao: {
                        [Op.between]: [
                            req.query.ngay_bat_dau,
                            req.query.ngay_ket_thuc,
                        ],
                    },
                }),
            ...(req.query.search && {
                '$hoc_vien.ho_ten$': {
                    [Op.like]: `%${decodeURI(req.query.search)}%`,
                },
            }),
            ...(req.query.ttp_id && {
                '$hoc_vien.ttp_id$': req.query.ttp_id,
            }),
            '$de_thi.de_mau_id$': {
                [Op.not]: null,
            },
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
    });
};

const getUser = async (req, res) => {
    let filter;
    let so_ngay = '30';
    if (req.query.so_ngay) {
        so_ngay = req.query.so_ngay;
    }
    filter = `AND DATEDIFF(NOW(),de_thi_hoc_vien.ngay_tao)<=${so_ngay}`;
    const exams = await sequelize.query(
        `SELECT de_thi.ten_de_thi, de_thi.anh_dai_dien, de_thi_hoc_vien.* FROM de_thi JOIN de_thi_hoc_vien 
        ON de_thi.de_thi_id=de_thi_hoc_vien.de_thi_id WHERE de_thi_hoc_vien.hoc_vien_id=${req.userId} ${filter} 
        AND de_thi_hoc_vien.thoi_diem_ket_thuc IS NOT NULL ORDER BY de_thi_hoc_vien.ngay_tao DESC LIMIT 30`,
        { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).send({
        status: 'success',
        data: exams,
        message: null,
    });
};

const getById = async (req, res) => {
    let studentExam = await StudentExam.findOne({
        include: {
            model: SelectedAnswer,
        },
        where: {
            dthv_id: req.params.id,
        },
    });
    studentExam.dap_an_da_chons.forEach((dap_an_da_chon) => {
        if (dap_an_da_chon.ket_qua_chon)
            dap_an_da_chon.ket_qua_chon =
                dap_an_da_chon.ket_qua_chon.toString();
    });
    res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const studentExam = await StudentExam.create({
        ...req.body,
        hoc_vien_id: req.userId,
    });
    res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

// Dùng cho thi đánh giá năng lực mới
const postCreateDGNL = async (req, res) => {
    const { khoa_hoc_id, chuyen_nganh_ids, ...rest } = req.body;

    const exam = await Exam.findOne({
        where: {
            khoa_hoc_id,
            to_hop: `1,7,${chuyen_nganh_ids
                .split(',')
                .map((item) => item.trim())
                .sort((a, b) => a - b)
                .join(',')}`,
        },
        order: sequelize.literal('RAND()'),
    });

    const studentExam = await StudentExam.create({
        ...rest,
        de_thi_id: exam.de_thi_id,
        hoc_vien_id: req.userId,
    });

    res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

// Dùng cho thi đánh giá tư duy
const postCreateDGTD = async (req, res) => {
    const { khoa_hoc_id, ...rest } = req.body;

    const sampleExam = await Exam.findOne({
        where: {
            de_mau: true,
            xuat_ban: true,
            trang_thai: true,
            khoa_hoc_id,
        },
    });

    if (!sampleExam) {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'Đề mẫu của khóa học không tồn tại',
        });
    }

    let criteria = await DGTDCriteria.findOne({
        where: {
            khoa_hoc_id: khoa_hoc_id,
        },
    });
    if (!criteria) {
        await DGTDCriteria.create({
            khoa_hoc_id: khoa_hoc_id,
            so_cau_hoi: 100,
            thoi_gian: 150,
            so_phan: 3,
            so_cau_hoi_phan_1: 40,
            thoi_gian_phan_1: 60,
            so_cau_hoi_phan_2: 20,
            thoi_gian_phan_2: 30,
            so_cau_hoi_phan_3: 40,
            thoi_gian_phan_3: 60,
        });

        criteria = await DGTDCriteria.findOne({
            where: {
                khoa_hoc_id: khoa_hoc_id,
            },
        });
    }

    const exam = await Exam.create({
        ten_de_thi: 'THI ĐÁNH GIÁ TƯ DUY',
        tong_diem: 100,
        xuat_ban: true,
        trang_thai: true,
        kct_id: 1,
        khoa_hoc_id,
        loai_de_thi_id: 6,
        de_mau_id: sampleExam.de_thi_id,
    });

    // phần 1
    await sequelize.query(
        `
        INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan, chuyen_nganh_id)
            SELECT cau_hoi_id, ${exam.dataValues.de_thi_id}, 1, chuyen_nganh_id FROM cau_hoi_de_thi
            WHERE chuyen_nganh_id = 10 AND de_thi_id = ${sampleExam.de_thi_id}
            ORDER BY RAND() LIMIT ${criteria.so_cau_hoi_phan_1}
    `,
        {
            type: sequelize.QueryTypes.INSERT,
        }
    );

    // phần 2
    await sequelize.query(
        `
            INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan, chuyen_nganh_id)
                SELECT chdt.cau_hoi_id, ${exam.dataValues.de_thi_id}, 2, chdt.chuyen_nganh_id FROM cau_hoi_de_thi chdt
                INNER JOIN cau_hoi ch ON chdt.cau_hoi_id = ch.cau_hoi_id
                WHERE chdt.chuyen_nganh_id = 11 AND chdt.de_thi_id = ${sampleExam.de_thi_id}
                ORDER BY ch.trich_doan_id ASC, RAND()
                LIMIT ${criteria.so_cau_hoi_phan_2}
        `,
        {
            type: sequelize.QueryTypes.INSERT,
        }
    );

    // phần 3
    await sequelize.query(
        `
            INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan, chuyen_nganh_id)
                SELECT chdt.cau_hoi_id, ${exam.dataValues.de_thi_id}, 3, chdt.chuyen_nganh_id FROM cau_hoi_de_thi chdt
                INNER JOIN cau_hoi ch ON chdt.cau_hoi_id = ch.cau_hoi_id
                WHERE chdt.chuyen_nganh_id = 12 AND chdt.de_thi_id = ${sampleExam.de_thi_id}
                ORDER BY ch.trich_doan_id ASC, RAND()
                LIMIT ${criteria.so_cau_hoi_phan_3}
        `,
        {
            type: sequelize.QueryTypes.INSERT,
        }
    );

    const studentExam = await StudentExam.create({
        ...rest,
        de_thi_id: exam.dataValues.de_thi_id,
        hoc_vien_id: req.userId,
    });

    res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

const getByExamId = async (req, res) => {
    const studentExam = await StudentExam.findOne({
        where: {
            de_thi_id: req.query.de_thi_id,
            hoc_vien_id: req.userId,
            thoi_diem_ket_thuc: {
                [Op.not]: null,
            },
        },
        order: [['ngay_tao', 'DESC']],
    });

    res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

// dùng cho đánh giá năng lực
const getByExamIdDGNL = async (req, res) => {
    const studentExam = await StudentExam.findOne({
        include: {
            model: Exam,
            attributes: ['ten_de_thi', 'de_thi_id'],
        },
        where: {
            '$de_thi.khoa_hoc_id$': req.query.khoa_hoc_id,
            hoc_vien_id: req.userId,
            thoi_diem_ket_thuc: null,
        },
        order: [['ngay_tao', 'DESC']],
    });

    res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

const putUpdate = async (req, res) => {
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

    let ket_qua_diem = 0;
    let so_cau_tra_loi_dung = 0;
    let so_cau_tra_loi_sai = 0;
    let ket_qua_chons;
    let dap_ans;
    let result;
    let correctQuestionIds = [];
    for (const selectedAnswer of selectedAnswers) {
        result = false;
        if (selectedAnswer.cau_hoi.loai_cau_hoi === 1) {
            // Câu trắc nghiệm
            ket_qua_chons = selectedAnswer.ket_qua_chon.toString().split('');
            dap_ans = selectedAnswer.cau_hoi.dap_ans;
            if (
                ket_qua_chons.every(
                    (ket_qua_chon, index) =>
                        ket_qua_chon == dap_ans[index].dap_an_dung
                )
            ) {
                result = true;
            }
        } else if (selectedAnswer.cau_hoi.loai_cau_hoi === 2) {
            const ket_qua_chons = [...selectedAnswer.ket_qua_chon.toString()];
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
            ket_qua_diem += parseFloat(bangDiem[so_cau_dung] || 0);
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
                        .replaceAll('<b>', '')
                        .replaceAll('</b>', '')
                        .replaceAll('<em>', '')
                        .replaceAll('</em>', '')
                        .replaceAll('<u>', '')
                        .replaceAll('</u>', '')
                        .trim()
                        .toLowerCase()
            ) {
                result = true;
            }
        }
        if (result) {
            ket_qua_diem += parseFloat(selectedAnswer.cau_hoi.diem);
            so_cau_tra_loi_dung++;
            correctQuestionIds.push(selectedAnswer.cau_hoi_id);
        }
    }

    if (correctQuestionIds.length !== 0) {
        await sequelize.query(
            `
            UPDATE dap_an_da_chon 
            SET ket_qua = true 
            WHERE dthv_id = :dthv_id 
            AND cau_hoi_id IN (${correctQuestionIds.join(', ')})`,
            {
                replacements: {
                    dthv_id: req.params.id,
                },
                type: sequelize.QueryTypes.UPDATE,
            }
        );
    }
    let exam = await sequelize.query(
        `
        SELECT de_thi.* FROM de_thi JOIN de_thi_hoc_vien ON de_thi.de_thi_id=de_thi_hoc_vien.de_thi_id 
        WHERE de_thi_hoc_vien.dthv_id=:dthv_id`,
        {
            replacements: {
                dthv_id: req.params.id,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    let criteria;
    if (exam[0]) {
        exam = exam[0];
        if (exam.loai_de_thi_id == 1) {
            criteria = await ThematicCriteria.findOne({
                where: {
                    mo_dun_id: exam.mo_dun_id,
                },
            });
        } else if (exam.loai_de_thi_id == 2) {
            criteria = await ModunCriteria.findOne({
                where: {
                    mo_dun_id: exam.mo_dun_id,
                },
            });
        } else if (exam.loai_de_thi_id == 3) {
            criteria = await SyntheticCriteria.findOne({
                where: {
                    khoa_hoc_id: exam.khoa_hoc_id,
                },
            });
        } else if (exam.loai_de_thi_id == 4) {
            criteria = await OnlineCriteria.findOne({
                where: {
                    khoa_hoc_id: exam.khoa_hoc_id,
                },
            });
        } else if (exam.loai_de_thi_id == 5) {
            criteria = await DGNLCriteria.findOne({
                where: {
                    khoa_hoc_id: exam.khoa_hoc_id,
                },
            });
        }
    }
    let dat_yeu_cau;
    if (criteria) {
        so_cau_tra_loi_sai = criteria.so_cau_hoi - so_cau_tra_loi_dung;
        let ket_qua = (ket_qua_diem / exam.tong_diem) * 100;
        if (criteria.yeu_cau && ket_qua > criteria.yeu_cau) dat_yeu_cau = true;
        else {
            dat_yeu_cau = false;
        }
    }
    const studentExam = await StudentExam.update(
        {
            ...req.body,
            ket_qua_diem: ket_qua_diem,
            so_cau_tra_loi_dung: so_cau_tra_loi_dung,
            so_cau_tra_loi_sai: so_cau_tra_loi_sai,
            dat_yeu_cau: dat_yeu_cau,
        },
        {
            where: {
                dthv_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

// dùng cho đánh giá năng lực
const putUpdatev2 = async (req, res) => {
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

    let ket_qua_diem = 0;
    let so_cau_tra_loi_dung = 0;
    let so_cau_tra_loi_sai = 0;
    let ket_qua_chons;
    let dap_ans;
    let result;
    let phan_1 = 0;
    let phan_2 = 0;
    let phan_3 = 0;
    let correctQuestionIds = [];
    for (const selectedAnswer of selectedAnswers) {
        result = false;
        if (selectedAnswer.cau_hoi.loai_cau_hoi === 1) {
            // Câu trắc nghiệm
            ket_qua_chons = selectedAnswer.ket_qua_chon.toString().split('');
            dap_ans = selectedAnswer.cau_hoi.dap_ans;
            if (
                ket_qua_chons.every(
                    (ket_qua_chon, index) =>
                        ket_qua_chon == dap_ans[index].dap_an_dung
                )
            ) {
                result = true;
            }
        } else if (selectedAnswer.cau_hoi.loai_cau_hoi === 2) {
            // Câu trắc nghiệm đúng sai
            const ket_qua_chons = [...selectedAnswer.ket_qua_chon.toString()];
            const dap_ans = selectedAnswer.cau_hoi.dap_ans;
            const bangDiem = {
                0: 0,
                1: parseFloat(selectedAnswer.cau_hoi.diem) / 10,
                2: parseFloat(selectedAnswer.cau_hoi.diem) / 4,
                3: parseFloat(selectedAnswer.cau_hoi.diem) / 2,
            };
            let so_cau_dung = ket_qua_chons.reduce(
                (acc, ket_qua_chon, index) =>
                    acc +
                    ((ket_qua_chon === '1') === dap_ans[index].dap_an_dung),
                0
            );
            ket_qua_diem += parseFloat(bangDiem[so_cau_dung] || 0);
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
                        .replaceAll('<b>', '')
                        .replaceAll('</b>', '')
                        .replaceAll('<em>', '')
                        .replaceAll('</em>', '')
                        .replaceAll('<u>', '')
                        .replaceAll('</u>', '')
                        .trim()
                        .toLowerCase()
            ) {
                result = true;
            }
        }
        if (result) {
            ket_qua_diem += parseFloat(selectedAnswer.cau_hoi.diem);
            so_cau_tra_loi_dung++;

            if (selectedAnswer.cau_hoi.chuyen_nganh_id === 1) {
                phan_1 += parseFloat(selectedAnswer.cau_hoi.diem);
            } else if (selectedAnswer.cau_hoi.chuyen_nganh_id === 7) {
                phan_2 += parseFloat(selectedAnswer.cau_hoi.diem);
            } else {
                phan_3 += parseFloat(selectedAnswer.cau_hoi.diem);
            }
            correctQuestionIds.push(selectedAnswer.cau_hoi_id);
        }
    }

    if (correctQuestionIds.length !== 0) {
        await sequelize.query(
            `
            UPDATE dap_an_da_chon 
            SET ket_qua = true 
            WHERE dthv_id = :dthv_id 
            AND cau_hoi_id IN (${correctQuestionIds.join(', ')})`,
            {
                replacements: {
                    dthv_id: req.params.id,
                },
                type: sequelize.QueryTypes.UPDATE,
            }
        );
    }
    let exam = await sequelize.query(
        `
        SELECT de_thi.* FROM de_thi JOIN de_thi_hoc_vien ON de_thi.de_thi_id=de_thi_hoc_vien.de_thi_id 
        WHERE de_thi_hoc_vien.dthv_id=:dthv_id`,
        {
            replacements: {
                dthv_id: req.params.id,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    let criteria;
    if (exam[0]) {
        exam = exam[0];
        criteria = await DGNLCriteria.findOne({
            where: {
                khoa_hoc_id: exam.khoa_hoc_id,
            },
        });
    }

    if (criteria) {
        so_cau_tra_loi_sai = criteria.so_cau_hoi - so_cau_tra_loi_dung;
    }
    const studentExam = await StudentExam.update(
        {
            ...req.body,
            diem_cac_phan: `${phan_1},${phan_2},${phan_3}`,
            ket_qua_diem: ket_qua_diem,
            so_cau_tra_loi_dung: so_cau_tra_loi_dung,
            so_cau_tra_loi_sai: so_cau_tra_loi_sai,
        },
        {
            where: {
                dthv_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

const putUpdatev3 = async (req, res) => {
    const studentExam = await StudentExam.update(
        {
            thoi_gian_lam_bai: req.body.thoi_gian_lam_bai,
            phan_dang_lam: req.body.phan_dang_lam,
            thoi_gian_lam_phan: req.body.thoi_gian_lam_phan,
        },
        {
            where: {
                dthv_id: req.params.id,
            },
        }
    );

    res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

// dùng cho đánh giá tư duy
const putUpdateDGTD = async (req, res) => {
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

    let ket_qua_diem = 0;
    let so_cau_tra_loi_dung = 0;
    let so_cau_tra_loi_sai = 0;
    let ket_qua_chons;
    let dap_ans;
    let noi_dung_dap_ans;
    let result;
    let phan_1 = 0;
    let phan_2 = 0;
    let phan_3 = 0;
    let correctQuestionIds = [];
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
            ket_qua_chons = selectedAnswer.ket_qua_chon.toString().split('');
            dap_ans = selectedAnswer.cau_hoi.dap_ans;
            if (
                ket_qua_chons.every(
                    (ket_qua_chon, index) =>
                        (ket_qua_chon === '1') === dap_ans[index].dap_an_dung
                )
            ) {
                result = true;
            }
        } else if (selectedAnswer.cau_hoi.loai_cau_hoi === 2) {
            ket_qua_chons = selectedAnswer.ket_qua_chon.toString().split('');
            dap_ans = selectedAnswer.cau_hoi.dap_ans;
            if (
                ket_qua_chons.every(
                    (ket_qua_chon, index) =>
                        (ket_qua_chon === '1') === dap_ans[index].dap_an_dung
                )
            ) {
                result = true;
            }
        } else if (selectedAnswer.cau_hoi.loai_cau_hoi === 3) {
            // nếu không chọn thì để là "_"
            ket_qua_chons = selectedAnswer.ket_qua_chon.toString().split('');
            dap_ans = selectedAnswer.cau_hoi.dap_ans;
            if (
                ket_qua_chons.every(
                    (ket_qua_chon, index) =>
                        ket_qua_chon !== '_' &&
                        (ket_qua_chon === '1') === dap_ans[index].dap_an_dung
                )
            ) {
                result = true;
            }
        } else if (selectedAnswer.cau_hoi.loai_cau_hoi === 4) {
            // nếu không chọn thì để là "_"
            ket_qua_chons = selectedAnswer.ket_qua_chon.toString().split('');
            dap_ans = selectedAnswer.cau_hoi.dap_ans;
            if (
                ket_qua_chons.every(
                    (ket_qua_chon, index) =>
                        ket_qua_chon !== '_' &&
                        (ket_qua_chon === '1') === dap_ans[index].dap_an_dung
                )
            ) {
                result = true;
            }
        } else if (selectedAnswer.cau_hoi.loai_cau_hoi === 5) {
            // nếu không nhập thì để là "_"
            noi_dung_dap_ans = selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an
                ? selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an.split(';')
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
            noi_dung_dap_ans = selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an
                ? selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an.split(';')
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
            correctQuestionIds.push(selectedAnswer.cau_hoi_id);
        }
    }

    if (correctQuestionIds.length !== 0) {
        await sequelize.query(
            `
            UPDATE dap_an_da_chon 
            SET ket_qua = true 
            WHERE dthv_id = :dthv_id 
            AND cau_hoi_id IN (${correctQuestionIds.join(', ')})`,
            {
                replacements: {
                    dthv_id: req.params.id,
                },
                type: sequelize.QueryTypes.UPDATE,
            }
        );
    }
    let exam = await sequelize.query(
        `
        SELECT de_thi.* FROM de_thi JOIN de_thi_hoc_vien ON de_thi.de_thi_id = de_thi_hoc_vien.de_thi_id 
        WHERE de_thi_hoc_vien.dthv_id = :dthv_id`,
        {
            replacements: {
                dthv_id: req.params.id,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    let criteria;
    if (exam[0]) {
        exam = exam[0];
        criteria = await DGTDCriteria.findOne({
            where: {
                khoa_hoc_id: exam.khoa_hoc_id,
            },
        });
    }

    if (criteria) {
        so_cau_tra_loi_sai = criteria.so_cau_hoi - so_cau_tra_loi_dung;
    }
    const studentExam = await StudentExam.update(
        {
            ...req.body,
            diem_cac_phan: `${phan_1},${phan_2},${phan_3}`,
            ket_qua_diem: ket_qua_diem,
            so_cau_tra_loi_dung: so_cau_tra_loi_dung,
            so_cau_tra_loi_sai: so_cau_tra_loi_sai,
        },
        {
            where: {
                dthv_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    await StudentExam.destroy({
        where: {
            dthv_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

const clearAll = async (req, res) => {
    await sequelize.query(
        `
        DELETE de_thi_hoc_vien, dap_an_da_chon FROM de_thi_hoc_vien LEFT JOIN 
        dap_an_da_chon ON de_thi_hoc_vien.dthv_id=dap_an_da_chon.dthv_id 
        WHERE de_thi_hoc_vien.hoc_vien_id = :id`,
        {
            replacements: { id: req.params.id },
            type: sequelize.QueryTypes.DELETE,
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'cleared',
    });
};

const exportReport = async (req, res) => {
    try {
        const content = fs.readFileSync(
            path.join(process.cwd(), '/public/templates/export_report.xlsx')
        );
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(content);

        workbook.creator = 'Me';
        workbook.lastModifiedBy = 'Her';
        workbook.created = new Date();
        const workSheet = workbook.getWorksheet('Sheet1');

        const list = await sequelize.query(
            `
            SELECT dt.de_thi_id, dt.ten_de_thi, hv.hoc_vien_id, hv.ho_ten, hv.email, dthv_s.ket_qua_diem FROM de_thi dt INNER JOIN 
                (SELECT dthv.dthv_id, dthv.hoc_vien_id, dthv.de_thi_id, dthv.ket_qua_diem FROM (SELECT dthv.de_thi_id, dthv.hoc_vien_id, MAX(dthv.ngay_tao) ngay_tao FROM de_thi_hoc_vien dthv 
                    WHERE dthv.ngay_tao BETWEEN :ngay_bat_dau AND :ngay_ket_thuc GROUP BY dthv.de_thi_id, dthv.hoc_vien_id) dthv_new
                    INNER JOIN de_thi_hoc_vien dthv ON dthv_new.de_thi_id = dthv.de_thi_id AND dthv_new.hoc_vien_id = dthv.hoc_vien_id
                        AND dthv_new.ngay_tao = dthv.ngay_tao) dthv_s
                        ON dt.de_thi_id = dthv_s.de_thi_id
                        INNER JOIN hoc_vien hv ON dthv_s.hoc_vien_id = hv.hoc_vien_id`,
            {
                replacements: {
                    ngay_bat_dau: req.query.ngay_bat_dau || '2000-01-01',
                    ngay_ket_thuc: req.query.ngay_ket_thuc || '2100-01-01',
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        // Nhóm các phần tử theo de_thi_id và lấy các thuộc tính ten_de_thi duy nhất
        const deThiIds = list.reduce((acc, current) => {
            const { de_thi_id, ten_de_thi } = current;
            if (!acc[de_thi_id]) {
                acc[de_thi_id] = { de_thi_id, ten_de_thi };
            }
            return acc;
        }, {});

        // Chuyển đối tượng thành mảng
        const uniqueDeThiIds = Object.values(deThiIds);

        // Nhóm các phần tử theo hoc_vien_id và lấy các thuộc tính ho_ten duy nhất
        const hocVienIds = list.reduce((acc, current) => {
            const { hoc_vien_id, ho_ten, email } = current;
            if (!acc[hoc_vien_id]) {
                acc[hoc_vien_id] = { hoc_vien_id, ho_ten, email };
            }
            return acc;
        }, {});

        // Chuyển đối tượng thành mảng
        const uniqueHocVienIds = Object.values(hocVienIds);

        let row;
        let indexCol = 3;

        for (const item of uniqueDeThiIds) {
            row = workSheet.getRow(2);

            const order = row.getCell(indexCol);
            order.value = item.ten_de_thi;

            indexCol++;
        }

        let indexRow = 3;
        let count = 1;

        for (const item of uniqueHocVienIds) {
            row = workSheet.getRow(indexRow);

            const order = row.getCell(1);
            order.value = count;

            const fullName = row.getCell(2);
            fullName.value = `${item.ho_ten} - ${item.email}`;

            indexRow++;
            count++;
        }

        for (const item of list) {
            indexRow = uniqueHocVienIds.findIndex(
                (item2) => item2.hoc_vien_id === item.hoc_vien_id
            );
            indexCol = uniqueDeThiIds.findIndex(
                (item2) => item2.de_thi_id === item.de_thi_id
            );
            row = workSheet.getRow(indexRow + 3);

            const score = row.getCell(indexCol + 3);
            score.value = item.ket_qua_diem;
        }

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'export_report.xlsx'
        );
        await workbook.xlsx.write(res);

        return res.end();
    } catch (err) {
        console.log(err);
        res.status(500).send({
            status: 'error',
            data: null,
            message: err,
        });
    }
};

const exportDGNL = async (req, res) => {
    try {
        const content = fs.readFileSync(
            path.join(
                process.cwd(),
                '/public/templates/export_student_exam.xlsx'
            )
        );
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(content);

        workbook.creator = 'Me';
        workbook.lastModifiedBy = 'Her';
        workbook.created = new Date();
        const workSheet = workbook.getWorksheet('Sheet1');

        const exam = await Exam.findOne({
            attributes: ['de_thi_id', 'ten_de_thi'],
            include: [
                {
                    model: StudentExam,
                    attributes: ['hoc_vien_id'],
                    required: true, // Chỉ lấy các Exam có StudentExam liên quan
                    where: { dthv_id: req.params.id }, // Điều kiện where phải nằm trong include
                },
            ],
        });

        const student = await Student.findOne({
            attributes: ['hoc_vien_id', 'ho_ten', 'email'],
            where: {
                hoc_vien_id: exam.de_thi_hoc_viens[0].hoc_vien_id,
            },
        });

        const list = await ExamQuestion.findAll({
            attributes: ['chdt_id', 'phan'],
            include: [
                {
                    model: Question,
                    attributes: ['cau_hoi_id', 'noi_dung', 'mdch_id'],
                    include: [
                        {
                            model: Exceprt,
                            attributes: ['trich_doan_id', 'noi_dung'],
                        },
                        {
                            model: SelectedAnswer,
                            attributes: ['dadc_id', 'ket_qua'],
                        },
                        {
                            model: Majoring,
                            attributes: ['chuyen_nganh_id', 'ten_chuyen_nganh'],
                        },
                    ],
                },
            ],
            where: {
                de_thi_id: exam.de_thi_id,
            },
            order: [[sequelize.col('chdt_id'), 'ASC']],
        });

        let indexCol;
        let indexRow;
        let count;
        let row;
        let phan;
        let order = 1;
        workSheet.getCell('E4').value = student.email;
        workSheet.getCell('E5').value = student.ho_ten;

        indexRow = 2;
        for (const item of list) {
            if (phan !== item.phan) {
                indexRow = indexRow + 4;
                row = workSheet.getRow(indexRow);

                row.getCell(1).font = {
                    name: 'Aptos Narrow',
                    bold: true,
                    size: 11,
                };
                row.getCell(1).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'c3d69c' },
                };
                if (item.phan === 1) {
                    row.getCell(1).value = 'ĐỊNH TÍNH';
                } else if (item.phan === 2) {
                    row.getCell(1).value = 'ĐỊNH LƯỢNG';
                } else if (item.phan === 3) {
                    row.getCell(1).value = 'KHOA HỌC';
                } else if (item.phan === 4) {
                    row.getCell(1).value = 'TIẾNG ANH';
                }

                order = 1;
                phan = item.phan;
            } else {
                row = workSheet.getRow(indexRow);

                row.getCell(1).value = `Câu ${order}`;
                row.getCell(2).value = (
                    (item.cau_hoi.trich_doan
                        ? item.cau_hoi.trich_doan.noi_dung
                        : '') + item.cau_hoi.noi_dung
                )
                    .replaceAll(
                        '\\begin{center}\\includegraphics[scale = 0.5]{',
                        ''
                    )
                    .replaceAll('}\\end{center}\\', '')
                    .replaceAll('<strong>', '')
                    .replaceAll('</strong>', '')
                    .replaceAll('<em>', '')
                    .replaceAll('</em>', '')
                    .replaceAll('<b>', '')
                    .replaceAll('</b>', '');
                row.getCell(3).value =
                    item.cau_hoi.chuyen_nganh.ten_chuyen_nganh;
                row.getCell(4).value =
                    item.cau_hoi.mdch_id === 1
                        ? 'Nhận biết'
                        : item.cau_hoi.mdch_id === 2
                        ? 'Thông hiểu'
                        : item.cau_hoi.mdch_id === 3
                        ? 'Vận dụng'
                        : 'Vận dụng cao';
                row.getCell(5).value =
                    item.cau_hoi.dap_an_da_chons.length === 0
                        ? 'X'
                        : item.cau_hoi.dap_an_da_chons[0].ket_qua
                        ? 'Đ'
                        : 'S';

                order++;
            }

            indexRow++;
        }
        
        const filename = removeVietnameseTones(exam.ten_de_thi).toUpperCase() + '.xlsx';
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
                filename
            )}`
        );
        await workbook.xlsx.write(res);

        return res.end();
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
    getUser,
    forceDelete,
    clearAll,
    exportReport,
    postCreateDGNL,
    putUpdatev2,
    putUpdatev3,
    getAllDGNL,
    getByExamId,
    getByExamIdDGNL,
    putUpdateDGTD,
    postCreateDGTD,
    exportDGNL,
};
