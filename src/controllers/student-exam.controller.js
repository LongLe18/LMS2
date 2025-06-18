const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { Op, literal, fn, col } = require('sequelize');

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
    Course,
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

const findAll = async (req, res) => {
    const { count, rows } = await StudentExam.findAndCountAll({
        include: {
            model: Exam,
            attributes: ['tong_diem'],
        },
        where: {
            ...(req.query.de_thi_id && { de_thi_id: req.query.de_thi_id }),
            ...(req.query.mo_dun_id && {
                '$de_thi.mo_dun_id$': req.query.mo_dun_id,
            }),
            ...(req.query.loai_de_thi_id && {
                '$de_thi.loai_de_thi_id$': req.query.loai_de_thi_id,
            }),
            $hoc_vien_id$: req.userId,
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
            let so_lan_thi_con_lai = criteria.so_lan_thi - rows.length;
            return res.status(200).send({
                status: 'success',
                data: {
                    so_lan_thi_con_lai,
                    studentExams: rows,
                },
                pageIndex: Number(req.query.pageIndex || 1),
                pageSize: Number(req.query.pageSize || 10),
                totalCount: count,
                totalPage: Math.ceil(count / Number(req.query.pageSize || 10)),
                message: null,
            });
        } else {
            return res.status(404).send({
                status: 'fail',
                data: null,
                message: 'no criteria',
            });
        }
    }

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

    return res.status(200).send({
        status: 'success',
        data: exams,
        message: null,
    });
};

const findOne = async (req, res) => {
    let studentExam = await StudentExam.findOne({
        include: {
            model: SelectedAnswer,
        },
        where: {
            dthv_id: req.params.id,
        },
    });

    if (studentExam) {
        studentExam.dap_an_da_chons.forEach((dap_an_da_chon) => {
            if (dap_an_da_chon.ket_qua_chon) {
                dap_an_da_chon.ket_qua_chon =
                    dap_an_da_chon.ket_qua_chon.toString();
            }
        });

        return res.status(200).send({
            status: 'success',
            data: studentExam,
            message: null,
        });
    } else {
        return res.status(404).send({
            status: 'error',
            message: 'Student exam not found',
        });
    }
};

const create = async (req, res) => {
    const exam = await Exam.findOne({
        where: {
            de_thi_id: req.body.de_thi_id,
        },
    });
    const studentExam = await StudentExam.create({
        ...req.body,
        hoc_vien_id: req.userId,
        khoa_hoc_id: exam.khoa_hoc_id,
        loai_de_thi_id: exam.loai_de_thi_id,
    });

    return res.status(200).send({
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
            trang_thai: true,
            xuat_ban: true,
        },
        order: sequelize.literal('RAND()'),
    });

    const studentExam = await StudentExam.create({
        ...rest,
        de_thi_id: exam.de_thi_id,
        hoc_vien_id: req.userId,
    });

    return res.status(200).send({
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

    return res.status(200).send({
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

    return res.status(200).send({
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

    return res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

const update = async (req, res) => {
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

        const cauHoi = selectedAnswer.cau_hoi; // Tránh gọi nhiều lần `selectedAnswer.cau_hoi`

        if (cauHoi) {
            if (cauHoi.loai_cau_hoi === 1) {
                // Câu trắc nghiệm
                ket_qua_chons = selectedAnswer.ket_qua_chon
                    .toString()
                    .split('');
                dap_ans = cauHoi.dap_ans;
                if (
                    ket_qua_chons.every(
                        (ket_qua_chon, index) =>
                            ket_qua_chon == dap_ans[index].dap_an_dung
                    )
                ) {
                    result = true;
                }
            } else if (cauHoi.loai_cau_hoi === 2) {
                // Câu nhiều lựa chọn
                ket_qua_chons = [...selectedAnswer.ket_qua_chon.toString()];
                dap_ans = cauHoi.dap_ans;
                const bangDiem = {
                    0: 0,
                    1: cauHoi.diem / 10,
                    2: cauHoi.diem / 4,
                    3: cauHoi.diem / 2,
                };
                let so_cau_dung = ket_qua_chons.reduce(
                    (acc, ket_qua_chon, index) =>
                        acc +
                        ((ket_qua_chon === '1') === dap_ans[index].dap_an_dung),
                    0
                );
                ket_qua_diem += parseFloat(bangDiem[so_cau_dung] || 0);
                if (so_cau_dung === 4) result = true;
            } else if (cauHoi.loai_cau_hoi === 0) {
                // Câu tự luận
                if (
                    selectedAnswer.noi_dung_tra_loi &&
                    cauHoi.dap_ans[0]?.noi_dung_dap_an &&
                    selectedAnswer.noi_dung_tra_loi.trim().toLowerCase() ===
                        cauHoi.dap_ans[0].noi_dung_dap_an
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
                ket_qua_diem += parseFloat(cauHoi.diem);
                so_cau_tra_loi_dung++;
                correctQuestionIds.push(cauHoi.id);
            }
        }
    }

    if (correctQuestionIds.length !== 0) {
        await sequelize.query(
            `
            UPDATE dap_an_da_chon 
            SET ket_qua = true 
            WHERE dthv_id = :dthv_id 
            AND cau_hoi_id IN (:correctQuestionIds)`,
            {
                replacements: {
                    dthv_id: req.params.id,
                    correctQuestionIds,
                },
                type: sequelize.QueryTypes.UPDATE,
            }
        );
    }

    let exam = await sequelize.query(
        `
        SELECT de_thi.* 
        FROM de_thi 
        JOIN de_thi_hoc_vien ON de_thi.de_thi_id = de_thi_hoc_vien.de_thi_id 
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
        if (exam.loai_de_thi_id === 1) {
            criteria = await ThematicCriteria.findOne({
                where: { mo_dun_id: exam.mo_dun_id },
            });
        } else if (exam.loai_de_thi_id === 2) {
            criteria = await ModunCriteria.findOne({
                where: { mo_dun_id: exam.mo_dun_id },
            });
        } else if (exam.loai_de_thi_id === 3) {
            criteria = await SyntheticCriteria.findOne({
                where: { khoa_hoc_id: exam.khoa_hoc_id },
            });
        } else if (exam.loai_de_thi_id === 4) {
            criteria = await OnlineCriteria.findOne({
                where: { khoa_hoc_id: exam.khoa_hoc_id },
            });
        } else if (exam.loai_de_thi_id === 5) {
            criteria = await DGNLCriteria.findOne({
                where: { khoa_hoc_id: exam.khoa_hoc_id },
            });
        }
    }

    let dat_yeu_cau;
    if (criteria) {
        so_cau_tra_loi_sai = criteria.so_cau_hoi - so_cau_tra_loi_dung;
        let ket_qua = (ket_qua_diem / exam.tong_diem) * 100;
        dat_yeu_cau = criteria.yeu_cau && ket_qua > criteria.yeu_cau;
    }

    const studentExam = await StudentExam.update(
        {
            ...req.body,
            ket_qua_diem,
            so_cau_tra_loi_dung,
            so_cau_tra_loi_sai,
            dat_yeu_cau,
        },
        {
            where: { dthv_id: req.params.id },
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
    let phan_1 = 0;
    let phan_2 = 0;
    let phan_3 = 0;
    let correctQuestionIds = [];

    for (const selectedAnswer of selectedAnswers) {
        let result = false;
        const cauHoi = selectedAnswer.cau_hoi; // Tránh gọi nhiều lần `selectedAnswer.cau_hoi`

        if (cauHoi) {
            if (cauHoi.loai_cau_hoi === 1) {
                // Câu trắc nghiệm
                const ket_qua_chons = selectedAnswer.ket_qua_chon
                    .toString()
                    .split('');
                const dap_ans = cauHoi.dap_ans;
                result = ket_qua_chons.every(
                    (ket_qua_chon, index) =>
                        ket_qua_chon == dap_ans[index].dap_an_dung
                );
            } else if (cauHoi.loai_cau_hoi === 2) {
                // Câu trắc nghiệm đúng sai
                const ket_qua_chons = selectedAnswer.ket_qua_chon
                    .toString()
                    .split('');
                const dap_ans = cauHoi.dap_ans;
                const bangDiem = {
                    0: 0,
                    1: parseFloat(cauHoi.diem) / 10,
                    2: parseFloat(cauHoi.diem) / 4,
                    3: parseFloat(cauHoi.diem) / 2,
                };
                let so_cau_dung = ket_qua_chons.reduce(
                    (acc, ket_qua_chon, index) =>
                        acc +
                        ((ket_qua_chon === '1') === dap_ans[index].dap_an_dung),
                    0
                );
                ket_qua_diem += parseFloat(bangDiem[so_cau_dung] || 0);
                result = so_cau_dung === 4;
            } else if (cauHoi.loai_cau_hoi === 0) {
                // Câu tự luận
                const noi_dung_dap_an = cauHoi.dap_ans[0]?.noi_dung_dap_an;
                if (
                    selectedAnswer.noi_dung_tra_loi &&
                    noi_dung_dap_an &&
                    selectedAnswer.noi_dung_tra_loi.trim().toLowerCase() ===
                        noi_dung_dap_an
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
                ket_qua_diem += parseFloat(cauHoi.diem);
                so_cau_tra_loi_dung++;

                if (cauHoi.chuyen_nganh_id === 1) {
                    phan_1 += parseFloat(cauHoi.diem);
                } else if (cauHoi.chuyen_nganh_id === 7) {
                    phan_2 += parseFloat(cauHoi.diem);
                } else {
                    phan_3 += parseFloat(cauHoi.diem);
                }
                correctQuestionIds.push(cauHoi.id);
            }
        }
    }

    if (correctQuestionIds.length !== 0) {
        await sequelize.query(
            `
            UPDATE dap_an_da_chon 
            SET ket_qua = true 
            WHERE dthv_id = :dthv_id 
            AND cau_hoi_id IN (:correctQuestionIds)`,
            {
                replacements: {
                    dthv_id: req.params.id,
                    correctQuestionIds,
                },
                type: sequelize.QueryTypes.UPDATE,
            }
        );
    }

    let exam = await sequelize.query(
        `
        SELECT de_thi.* 
        FROM de_thi 
        JOIN de_thi_hoc_vien ON de_thi.de_thi_id = de_thi_hoc_vien.de_thi_id 
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
        criteria = await DGNLCriteria.findOne({
            where: { khoa_hoc_id: exam.khoa_hoc_id },
        });
    }

    if (criteria) {
        so_cau_tra_loi_sai = criteria.so_cau_hoi - so_cau_tra_loi_dung;
    }

    const studentExam = await StudentExam.update(
        {
            ...req.body,
            diem_cac_phan: `${phan_1},${phan_2},${phan_3}`,
            ket_qua_diem,
            so_cau_tra_loi_dung,
            so_cau_tra_loi_sai,
        },
        {
            where: { dthv_id: req.params.id },
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
    let phan_1 = 0;
    let phan_2 = 0;
    let phan_3 = 0;
    let correctQuestionIds = [];

    for (const selectedAnswer of selectedAnswers) {
        let result = false;
        const cauHoi = selectedAnswer.cau_hoi;
        const ket_qua_chons = selectedAnswer.ket_qua_chon.toString().split('');
        const dap_ans = cauHoi.dap_ans;

        // Kiểm tra loại câu hỏi
        if (cauHoi) {
            switch (cauHoi.loai_cau_hoi) {
                case 0: // Câu tự luận
                    if (
                        selectedAnswer.noi_dung_tra_loi &&
                        selectedAnswer.noi_dung_tra_loi.trim().toLowerCase() ===
                            cauHoi.dap_ans[0].noi_dung_dap_an.toLowerCase()
                    ) {
                        result = true;
                    }
                    break;

                case 1: // Câu trắc nghiệm
                case 2: // Câu trắc nghiệm đúng sai
                    if (
                        ket_qua_chons.every(
                            (ket_qua_chon, index) =>
                                (ket_qua_chon === '1') ===
                                dap_ans[index].dap_an_dung
                        )
                    ) {
                        result = true;
                    }
                    break;

                case 3: // Câu trắc nghiệm (nếu không chọn thì là "_")
                case 4: // Câu trắc nghiệm (nếu không chọn thì là "_")
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
                    break;

                case 5: // Câu tự luận (nếu không nhập thì để là "_")
                case 6: // Câu tự luận (nếu không nhập thì để là "_")
                    const noi_dung_dap_ans = dap_ans[0].noi_dung_dap_an
                        ? dap_ans[0].noi_dung_dap_an.split(';')
                        : [];
                    if (
                        selectedAnswer.noi_dung_tra_loi &&
                        noi_dung_dap_ans.length &&
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
                    break;

                default:
                    break;
            }
        }

        if (result) {
            ket_qua_diem += parseFloat(cauHoi.diem);
            so_cau_tra_loi_dung++;

            if (cauHoi.chuyen_nganh_id === 10) {
                phan_1 += parseFloat(cauHoi.diem);
            } else if (cauHoi.chuyen_nganh_id === 11) {
                phan_2 += parseFloat(cauHoi.diem);
            } else {
                phan_3 += parseFloat(cauHoi.diem);
            }
            correctQuestionIds.push(cauHoi.id);
        }
    }

    if (correctQuestionIds.length !== 0) {
        await sequelize.query(
            `
            UPDATE dap_an_da_chon 
            SET ket_qua = true 
            WHERE dthv_id = :dthv_id 
            AND cau_hoi_id IN (:correctQuestionIds)`,
            {
                replacements: {
                    dthv_id: req.params.id,
                    correctQuestionIds,
                },
                type: sequelize.QueryTypes.UPDATE,
            }
        );
    }

    let exam = await sequelize.query(
        `
        SELECT de_thi.* 
        FROM de_thi 
        JOIN de_thi_hoc_vien ON de_thi.de_thi_id = de_thi_hoc_vien.de_thi_id 
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
            where: { khoa_hoc_id: exam.khoa_hoc_id },
        });
    }

    if (criteria) {
        so_cau_tra_loi_sai = criteria.so_cau_hoi - so_cau_tra_loi_dung;
    }

    const studentExam = await StudentExam.update(
        {
            ...req.body,
            diem_cac_phan: `${phan_1},${phan_2},${phan_3}`,
            ket_qua_diem,
            so_cau_tra_loi_dung,
            so_cau_tra_loi_sai,
        },
        {
            where: { dthv_id: req.params.id },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

const remove = async (req, res) => {
    await StudentExam.destroy({
        where: {
            dthv_id: req.params.id,
        },
    });

    return res.status(200).send({
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

    return res.status(200).send({
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
        return res.status(500).send({
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
                            required: false,
                            where: {
                                dthv_id: req.params.id,
                            },
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
                indexRow++;
            }
            row = workSheet.getRow(indexRow);

            row.getCell(1).value = `Câu ${order}`;
            row.getCell(2).value = (
                (item.cau_hoi?.trich_doan
                    ? item.cau_hoi?.trich_doan?.noi_dung
                    : '') + item.cau_hoi?.noi_dung
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
            row.getCell(3).value = item.cau_hoi?.chuyen_nganh?.ten_chuyen_nganh;
            row.getCell(4).value =
                item.cau_hoi?.mdch_id === 1
                    ? 'Nhận biết'
                    : item.cau_hoi?.mdch_id === 2
                    ? 'Thông hiểu'
                    : item.cau_hoi?.mdch_id === 3
                    ? 'Vận dụng'
                    : 'Vận dụng cao';
            row.getCell(5).value =
                item.cau_hoi?.dap_an_da_chons?.length === 0
                    ? 'X'
                    : item.cau_hoi?.dap_an_da_chons[0]?.ket_qua
                    ? 'Đ'
                    : 'S';

            order++;
            indexRow++;
        }

        const filename =
            removeVietnameseTones(exam.ten_de_thi).toUpperCase() + '.xlsx';
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
        return res.status(500).send({
            status: 'error',
            data: null,
            message: err,
        });
    }
};

const exportDGNLv2 = async (req, res) => {
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
                    model: ExamQuestion,
                    attributes: ['chdt_id', 'chuyen_nganh_id'],
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
                                    model: Majoring,
                                    attributes: [
                                        'chuyen_nganh_id',
                                        'ten_chuyen_nganh',
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
            where: {
                de_thi_id: req.query.de_thi_id,
            },
        });
        exam.cau_hoi_de_this.sort((a, b) => {
            const order = [1, 7, 3, 4, 6, 8, 9, 5];
            return (
                order.indexOf(a.chuyen_nganh_id) -
                order.indexOf(b.chuyen_nganh_id)
            );
        });

        const studentExams = await StudentExam.findAll({
            attributes: ['hoc_vien_id'],
            include: [
                {
                    model: Student,
                    attributes: ['hoc_vien_id', 'ho_ten', 'email'],
                    required: true,
                },
                {
                    model: Exam,
                    attributes: ['de_thi_id'],
                    include: [
                        {
                            model: ExamQuestion,
                            attributes: ['chdt_id'],
                            include: [
                                {
                                    model: Question,
                                    attributes: ['cau_hoi_id'],
                                    include: [
                                        {
                                            model: SelectedAnswer,
                                            attributes: [
                                                'dadc_id',
                                                'ket_qua',
                                                'cau_hoi_id',
                                                'dthv_id',
                                            ],
                                            on: sequelize.literal(
                                                '`de_thi->cau_hoi_de_this->cau_hoi`.`cau_hoi_id` = `de_thi->cau_hoi_de_this->cau_hoi->dap_an_da_chons`.`cau_hoi_id` AND `de_thi_hoc_vien`.`dthv_id` = `de_thi->cau_hoi_de_this->cau_hoi->dap_an_da_chons`.`dthv_id`'
                                            ),
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
            where: {
                dthv_id: {
                    [Op.in]: req.query.dthv_ids.split(',').map(Number), // giả sử bạn truyền danh sách ID trong req.body.ids
                },
            },
            logging: console.log, // In SQL thực tế ra console
        });

        let indexCol;
        let indexRow;
        let count;
        let row;
        let chuyen_nganh_id;
        let order = 1;
        let questionIds = [];
        indexRow = 4;
        for (const item of exam.cau_hoi_de_this) {
            if (
                ([3, 4, 6, 8, 9].includes(item.chuyen_nganh_id) &&
                    ![3, 4, 6, 8, 9].includes(chuyen_nganh_id)) ||
                (![3, 4, 6, 8, 9].includes(item.chuyen_nganh_id) &&
                    chuyen_nganh_id !== item.chuyen_nganh_id)
            ) {
                indexRow = indexRow + 2;
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
                if (item.chuyen_nganh_id === 1) {
                    row.getCell(1).value = 'ĐỊNH TÍNH';
                } else if (item.chuyen_nganh_id === 7) {
                    row.getCell(1).value = 'ĐỊNH LƯỢNG';
                } else if ([3, 4, 6, 8, 9].includes(item.chuyen_nganh_id)) {
                    row.getCell(1).value = 'KHOA HỌC';
                } else if (item.chuyen_nganh_id === 5) {
                    row.getCell(1).value = 'TIẾNG ANH';
                }

                order = 1;
                chuyen_nganh_id = item.chuyen_nganh_id;
                indexRow++;
            }
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
            row.getCell(3).value = item.cau_hoi.chuyen_nganh.ten_chuyen_nganh;
            row.getCell(4).value =
                item.cau_hoi.mdch_id === 1
                    ? 'Nhận biết'
                    : item.cau_hoi.mdch_id === 2
                    ? 'Thông hiểu'
                    : item.cau_hoi.mdch_id === 3
                    ? 'Vận dụng'
                    : 'Vận dụng cao';
            // row.getCell(5).value =
            //     item.cau_hoi.dap_an_da_chons.length === 0
            //         ? 'X'
            //         : item.cau_hoi.dap_an_da_chons[0].ket_qua
            //         ? 'Đ'
            //         : 'S';
            order++;

            questionIds.push({
                id: item.cau_hoi.cau_hoi_id,
                index: indexRow, // hoặc bạn có thể bỏ index nếu muốn tính lại sau
            });
            indexRow++;
        }

        indexCol = 0;
        indexRow = 4;
        for (const item of studentExams) {
            row = workSheet.getRow(indexRow);
            const baseCell = row.getCell(5); // Cột 5 là gốc
            const targetCellEmail = row.getCell(5 + indexCol);
            targetCellEmail.style = { ...baseCell.style };
            workSheet.getColumn(5 + indexCol).width =
                workSheet.getColumn(5).width;
            targetCellEmail.value = item.hoc_vien.email;

            row = workSheet.getRow(indexRow + 1);
            const targetCellName = row.getCell(5 + indexCol);
            targetCellName.style = { ...row.getCell(5).style }; // Lấy style từ dòng dưới, cột 5
            targetCellName.value = item.hoc_vien.ho_ten;

            for (const item2 of item.de_thi.cau_hoi_de_this) {
                const found = questionIds.find(
                    (q) => q.id === item2.cau_hoi.cau_hoi_id
                );
                if (found) {
                    row = workSheet.getRow(found.index);
                    row.getCell(5 + indexCol).value =
                        item2.cau_hoi.dap_an_da_chons.length === 0
                            ? 'X'
                            : item2.cau_hoi.dap_an_da_chons[0].ket_qua
                            ? 'Đ'
                            : 'S';
                }
            }
            indexCol++;
        }

        const filename =
            removeVietnameseTones(exam.ten_de_thi).toUpperCase() + '.xlsx';
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        21;
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
        return res.status(500).send({
            status: 'error',
            data: null,
            message: err,
        });
    }
};

const exportTest = async (req, res) => {
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
            attributes: ['de_thi_id', 'ten_de_thi', 'khoa_hoc_id'],
            include: [
                {
                    model: StudentExam,
                    attributes: ['hoc_vien_id'],
                    required: true, // Chỉ lấy các Exam có StudentExam liên quan
                    where: { dthv_id: req.params.id }, // Điều kiện where phải nằm trong include
                },
            ],
        });

        const criteria = await OnlineCriteria.findOne({
            where: {
                khoa_hoc_id: exam.khoa_hoc_id,
            },
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
                            required: false,
                            where: {
                                dthv_id: req.params.id,
                            },
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
        let order = 1;
        let index = 1;
        let phan_1 = 1;
        let phan_2 = criteria.so_cau_hoi_phan_1 + phan_1;
        let phan_3 = criteria.so_cau_hoi_phan_2 + phan_2;
        let phan_4 = criteria.so_cau_hoi_phan_3 + phan_3;
        workSheet.getCell('E4').value = student.email;
        workSheet.getCell('E5').value = student.ho_ten;

        indexRow = 2;
        for (const item of list) {
            if (
                index === phan_1 ||
                index === phan_2 ||
                index === phan_3 ||
                index === phan_4
            ) {
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
                if (index === phan_1) {
                    row.getCell(1).value = 'KĨ NĂNG TÍNH TOÁN';
                } else if (index === phan_2) {
                    row.getCell(1).value =
                        'TƯ DUY LOGIC, PHÂN TÍCH VẤN ĐỀ VÀ GIẢI QUYẾT VẤN ĐỀ';
                } else if (index === phan_3) {
                    row.getCell(1).value =
                        'KĨ NĂNG XỬ LÍ VÀ HIỂU VỀ CÁC SỐ LIỆU THỐNG KÊ';
                } else if (index === phan_4) {
                    row.getCell(1).value =
                        'KĨ NĂNG TƯ DUY SÁNG TẠO VÀ NĂNG LỰC VẬN DỤNG';
                }

                order = 1;
                indexRow++;
            }
            row = workSheet.getRow(indexRow);

            row.getCell(1).value = `Câu ${order}`;
            row.getCell(2).value = (
                (item.cau_hoi?.trich_doan
                    ? item.cau_hoi?.trich_doan?.noi_dung
                    : '') + item.cau_hoi?.noi_dung
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
            row.getCell(3).value = item.cau_hoi?.chuyen_nganh?.ten_chuyen_nganh;
            row.getCell(4).value =
                item.cau_hoi?.mdch_id === 1
                    ? 'Nhận biết'
                    : item.cau_hoi?.mdch_id === 2
                    ? 'Thông hiểu'
                    : item.cau_hoi?.mdch_id === 3
                    ? 'Vận dụng'
                    : 'Vận dụng cao';
            row.getCell(5).value =
                item.cau_hoi?.dap_an_da_chons?.length === 0
                    ? 'X'
                    : item.cau_hoi?.dap_an_da_chons[0]?.ket_qua
                    ? 'Đ'
                    : 'S';

            index++;
            order++;
            indexRow++;
        }

        const filename =
            removeVietnameseTones(exam.ten_de_thi).toUpperCase() + '.xlsx';
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
        return res.status(500).send({
            status: 'error',
            data: null,
            message: err,
        });
    }
};

const exportTestv2 = async (req, res) => {
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
            attributes: ['de_thi_id', 'ten_de_thi', 'khoa_hoc_id'],
            include: [
                {
                    model: ExamQuestion,
                    attributes: ['chdt_id', 'chuyen_nganh_id'],
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
                                    model: Majoring,
                                    attributes: [
                                        'chuyen_nganh_id',
                                        'ten_chuyen_nganh',
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
            where: {
                de_thi_id: req.query.de_thi_id,
            },
            order: [[sequelize.col('chdt_id'), 'ASC']],
        });

        const criteria = await OnlineCriteria.findOne({
            where: {
                khoa_hoc_id: exam.khoa_hoc_id,
            },
        });

        const studentExams = await StudentExam.findAll({
            attributes: ['hoc_vien_id'],
            include: [
                {
                    model: Student,
                    attributes: ['hoc_vien_id', 'ho_ten', 'email'],
                    required: true,
                },
                {
                    model: Exam,
                    attributes: ['de_thi_id'],
                    include: [
                        {
                            model: ExamQuestion,
                            attributes: ['chdt_id'],
                            include: [
                                {
                                    model: Question,
                                    attributes: ['cau_hoi_id'],
                                    include: [
                                        {
                                            model: SelectedAnswer,
                                            attributes: [
                                                'dadc_id',
                                                'ket_qua',
                                                'cau_hoi_id',
                                                'dthv_id',
                                            ],
                                            on: sequelize.literal(
                                                '`de_thi->cau_hoi_de_this->cau_hoi`.`cau_hoi_id` = `de_thi->cau_hoi_de_this->cau_hoi->dap_an_da_chons`.`cau_hoi_id` AND `de_thi_hoc_vien`.`dthv_id` = `de_thi->cau_hoi_de_this->cau_hoi->dap_an_da_chons`.`dthv_id`'
                                            ),
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
            where: {
                dthv_id: {
                    [Op.in]: req.query.dthv_ids.split(',').map(Number), // giả sử bạn truyền danh sách ID trong req.body.ids
                },
            },
            logging: console.log, // In SQL thực tế ra console
        });

        let indexCol;
        let indexRow;
        let count;
        let row;
        let order = 1;
        let questionIds = [];
        let index = 1;
        let phan_1 = 1;
        let phan_2 = criteria.so_cau_hoi_phan_1 + phan_1;
        let phan_3 = criteria.so_cau_hoi_phan_2 + phan_2;
        let phan_4 = criteria.so_cau_hoi_phan_3 + phan_3;

        indexRow = 2;
        for (const item of exam.cau_hoi_de_this) {
            if (
                index === phan_1 ||
                index === phan_2 ||
                index === phan_3 ||
                index === phan_4
            ) {
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
                if (index === phan_1) {
                    row.getCell(1).value = 'KĨ NĂNG TÍNH TOÁN';
                } else if (index === phan_2) {
                    row.getCell(1).value =
                        'TƯ DUY LOGIC, PHÂN TÍCH VẤN ĐỀ VÀ GIẢI QUYẾT VẤN ĐỀ';
                } else if (index === phan_3) {
                    row.getCell(1).value =
                        'KĨ NĂNG XỬ LÍ VÀ HIỂU VỀ CÁC SỐ LIỆU THỐNG KÊ';
                } else if (index === phan_4) {
                    row.getCell(1).value =
                        'KĨ NĂNG TƯ DUY SÁNG TẠO VÀ NĂNG LỰC VẬN DỤNG';
                }

                order = 1;
                indexRow++;
            }
            row = workSheet.getRow(indexRow);

            row.getCell(1).value = `Câu ${order}`;
            row.getCell(2).value = (
                (item.cau_hoi?.trich_doan
                    ? item.cau_hoi?.trich_doan?.noi_dung
                    : '') + item.cau_hoi?.noi_dung
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
            row.getCell(3).value = item.cau_hoi?.chuyen_nganh?.ten_chuyen_nganh;
            row.getCell(4).value =
                item.cau_hoi?.mdch_id === 1
                    ? 'Nhận biết'
                    : item.cau_hoi?.mdch_id === 2
                    ? 'Thông hiểu'
                    : item.cau_hoi?.mdch_id === 3
                    ? 'Vận dụng'
                    : 'Vận dụng cao';
            // row.getCell(5).value =
            //     item.cau_hoi?.dap_an_da_chons?.length === 0
            //         ? 'X'
            //         : item.cau_hoi?.dap_an_da_chons[0]?.ket_qua
            //         ? 'Đ'
            //         : 'S';

            questionIds.push({
                id: item.cau_hoi.cau_hoi_id,
                index: indexRow, // hoặc bạn có thể bỏ index nếu muốn tính lại sau
            });

            index++;
            order++;
            indexRow++;
        }

        indexCol = 0;
        indexRow = 4;
        for (const item of studentExams) {
            row = workSheet.getRow(indexRow);
            const baseCell = row.getCell(5); // Cột 5 là gốc
            const targetCellEmail = row.getCell(5 + indexCol);
            targetCellEmail.style = { ...baseCell.style };
            workSheet.getColumn(5 + indexCol).width =
                workSheet.getColumn(5).width;
            targetCellEmail.value = item.hoc_vien.email;

            row = workSheet.getRow(indexRow + 1);
            const targetCellName = row.getCell(5 + indexCol);
            targetCellName.style = { ...row.getCell(5).style }; // Lấy style từ dòng dưới, cột 5
            targetCellName.value = item.hoc_vien.ho_ten;

            for (const item2 of item.de_thi.cau_hoi_de_this) {
                const found = questionIds.find(
                    (q) => q.id === item2.cau_hoi.cau_hoi_id
                );
                if (found) {
                    row = workSheet.getRow(found.index);
                    row.getCell(5 + indexCol).value =
                        item2.cau_hoi.dap_an_da_chons.length === 0
                            ? 'X'
                            : item2.cau_hoi.dap_an_da_chons[0].ket_qua
                            ? 'Đ'
                            : 'S';
                }
            }
            indexCol++;
        }

        const filename =
            removeVietnameseTones(exam.ten_de_thi).toUpperCase() + '.xlsx';
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
        return res.status(500).send({
            status: 'error',
            data: null,
            message: err,
        });
    }
};

const exportELearning = async (req, res) => {
    try {
        const content = fs.readFileSync(
            path.join(
                process.cwd(),
                '/public/templates/export_student_examv2.xlsx'
            )
        );
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(content);

        workbook.creator = 'Me';
        workbook.lastModifiedBy = 'Her';
        workbook.created = new Date();
        const workSheet = workbook.getWorksheet('Sheet1');

        const exam = await Exam.findOne({
            attributes: ['de_thi_id', 'ten_de_thi', 'khoa_hoc_id', 'mo_dun_id'],
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
                            required: false,
                            where: {
                                dthv_id: req.params.id,
                            },
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
        let order = 1;
        let index = 1;
        workSheet.getCell('E4').value = student.email;
        workSheet.getCell('E5').value = student.ho_ten;

        indexRow = 7;
        for (const item of list) {
            row = workSheet.getRow(indexRow);

            row.getCell(1).value = `Câu ${order}`;
            row.getCell(2).value = (
                (item.cau_hoi?.trich_doan
                    ? item.cau_hoi?.trich_doan?.noi_dung
                    : '') + item.cau_hoi?.noi_dung
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
            row.getCell(3).value = item.cau_hoi?.chuyen_nganh?.ten_chuyen_nganh;
            row.getCell(4).value =
                item.cau_hoi?.mdch_id === 1
                    ? 'Nhận biết'
                    : item.cau_hoi?.mdch_id === 2
                    ? 'Thông hiểu'
                    : item.cau_hoi?.mdch_id === 3
                    ? 'Vận dụng'
                    : 'Vận dụng cao';
            row.getCell(5).value =
                item.cau_hoi?.dap_an_da_chons?.length === 0
                    ? 'X'
                    : item.cau_hoi?.dap_an_da_chons[0]?.ket_qua
                    ? 'Đ'
                    : 'S';

            index++;
            order++;
            indexRow++;
        }

        const filename =
            removeVietnameseTones(exam.ten_de_thi).toUpperCase() + '.xlsx';
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
        return res.status(500).send({
            status: 'error',
            data: null,
            message: err,
        });
    }
};

const exportELearningv2 = async (req, res) => {
    try {
        const content = fs.readFileSync(
            path.join(
                process.cwd(),
                '/public/templates/export_student_examv2.xlsx'
            )
        );
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(content);

        workbook.creator = 'Me';
        workbook.lastModifiedBy = 'Her';
        workbook.created = new Date();
        const workSheet = workbook.getWorksheet('Sheet1');

        const exam = await Exam.findOne({
            attributes: ['de_thi_id', 'ten_de_thi', 'khoa_hoc_id'],
            include: [
                {
                    model: ExamQuestion,
                    attributes: ['chdt_id', 'chuyen_nganh_id'],
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
                                    model: Majoring,
                                    attributes: [
                                        'chuyen_nganh_id',
                                        'ten_chuyen_nganh',
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
            where: {
                de_thi_id: req.query.de_thi_id,
            },
            order: [[sequelize.col('chdt_id'), 'ASC']],
        });

        const studentExams = await StudentExam.findAll({
            attributes: ['hoc_vien_id'],
            include: [
                {
                    model: Student,
                    attributes: ['hoc_vien_id', 'ho_ten', 'email'],
                    required: true,
                },
                {
                    model: Exam,
                    attributes: ['de_thi_id'],
                    include: [
                        {
                            model: ExamQuestion,
                            attributes: ['chdt_id'],
                            include: [
                                {
                                    model: Question,
                                    attributes: ['cau_hoi_id'],
                                    include: [
                                        {
                                            model: SelectedAnswer,
                                            attributes: [
                                                'dadc_id',
                                                'ket_qua',
                                                'cau_hoi_id',
                                                'dthv_id',
                                            ],
                                            on: sequelize.literal(
                                                '`de_thi->cau_hoi_de_this->cau_hoi`.`cau_hoi_id` = `de_thi->cau_hoi_de_this->cau_hoi->dap_an_da_chons`.`cau_hoi_id` AND `de_thi_hoc_vien`.`dthv_id` = `de_thi->cau_hoi_de_this->cau_hoi->dap_an_da_chons`.`dthv_id`'
                                            ),
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
            where: {
                dthv_id: {
                    [Op.in]: req.query.dthv_ids.split(',').map(Number), // giả sử bạn truyền danh sách ID trong req.body.ids
                },
            },
            logging: console.log, // In SQL thực tế ra console
        });

        let indexCol;
        let indexRow;
        let count;
        let row;
        let order = 1;
        let index = 1;
        let questionIds = [];

        indexRow = 7;
        for (const item of exam.cau_hoi_de_this) {
            row = workSheet.getRow(indexRow);

            row.getCell(1).value = `Câu ${order}`;
            row.getCell(2).value = (
                (item.cau_hoi?.trich_doan
                    ? item.cau_hoi?.trich_doan?.noi_dung
                    : '') + item.cau_hoi?.noi_dung
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
            row.getCell(3).value = item.cau_hoi?.chuyen_nganh?.ten_chuyen_nganh;
            row.getCell(4).value =
                item.cau_hoi?.mdch_id === 1
                    ? 'Nhận biết'
                    : item.cau_hoi?.mdch_id === 2
                    ? 'Thông hiểu'
                    : item.cau_hoi?.mdch_id === 3
                    ? 'Vận dụng'
                    : 'Vận dụng cao';
            // row.getCell(5).value =
            //     item.cau_hoi?.dap_an_da_chons?.length === 0
            //         ? 'X'
            //         : item.cau_hoi?.dap_an_da_chons[0]?.ket_qua
            //         ? 'Đ'
            //         : 'S';

            questionIds.push({
                id: item.cau_hoi.cau_hoi_id,
                index: indexRow, // hoặc bạn có thể bỏ index nếu muốn tính lại sau
            });

            index++;
            order++;
            indexRow++;
        }

        indexCol = 0;
        indexRow = 4;
        for (const item of studentExams) {
            row = workSheet.getRow(indexRow);
            const baseCell = row.getCell(5); // Cột 5 là gốc
            const targetCellEmail = row.getCell(5 + indexCol);
            targetCellEmail.style = { ...baseCell.style };
            workSheet.getColumn(5 + indexCol).width =
                workSheet.getColumn(5).width;
            targetCellEmail.value = item.hoc_vien.email;

            row = workSheet.getRow(indexRow + 1);
            const targetCellName = row.getCell(5 + indexCol);
            targetCellName.style = { ...row.getCell(5).style }; // Lấy style từ dòng dưới, cột 5
            targetCellName.value = item.hoc_vien.ho_ten;

            for (const item2 of item.de_thi.cau_hoi_de_this) {
                const found = questionIds.find(
                    (q) => q.id === item2.cau_hoi.cau_hoi_id
                );
                if (found) {
                    row = workSheet.getRow(found.index);
                    row.getCell(5 + indexCol).value =
                        item2.cau_hoi.dap_an_da_chons.length === 0
                            ? 'X'
                            : item2.cau_hoi.dap_an_da_chons[0].ket_qua
                            ? 'Đ'
                            : 'S';
                }
            }
            indexCol++;
        }

        const filename =
            removeVietnameseTones(exam.ten_de_thi).toUpperCase() + '.xlsx';
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
        return res.status(500).send({
            status: 'error',
            data: null,
            message: err,
        });
    }
};

const dashBoardByTeacher = async (req, res) => {
    const result = await sequelize.query(
        `
        SELECT
            ldt.loai_de_thi_id,
            ldt.mo_ta,
            COUNT(CASE WHEN dthv.ket_qua_diem >= 80 THEN 1 END) AS gioi,
            COUNT(CASE WHEN dthv.ket_qua_diem >= 65 AND dthv.ket_qua_diem < 80 THEN 1 END) AS kha,
            COUNT(CASE WHEN dthv.ket_qua_diem >= 50 AND dthv.ket_qua_diem < 65 THEN 1 END) AS trungbinh,
            COUNT(CASE WHEN dthv.ket_qua_diem < 50 THEN 1 END) AS kem
        FROM
            loai_de_thi ldt
        LEFT JOIN de_thi_hoc_vien dthv ON ldt.loai_de_thi_id = dthv.loai_de_thi_id
        LEFT JOIN khoa_hoc kh ON dthv.khoa_hoc_id = kh.khoa_hoc_id
        WHERE
            dthv.loai_de_thi_id IN (1, 2, 3)
            AND kh.giao_vien_id = :giao_vien_id
        GROUP BY
            ldt.loai_de_thi_id, ldt.mo_ta
        ORDER BY
            ldt.loai_de_thi_id;
        `,
        {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
                giao_vien_id: req.userId,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: result,
        message: null,
    });
};

const findAllv2 = async (req, res) => {
    const pageIndex = Number(req.query.pageIndex || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const offset = (pageIndex - 1) * pageSize;

    const whereExam = {
        ...(req.query.de_thi_id && { de_thi_id: req.query.de_thi_id }),
        ...(req.query.loai_de_thi_id && {
            loai_de_thi_id: req.query.loai_de_thi_id,
        }),
        ...(req.query.khoa_hoc_id && { khoa_hoc_id: req.query.khoa_hoc_id }),
        ...(req.query.search && {
            [Op.or]: [{ ten_de_thi: { [Op.like]: `%${req.query.search}%` } }],
        }),
    };

    const { count, rows: examIds } = await Exam.findAndCountAll({
        include: [
            { model: Course, attributes: ['khoa_hoc_id', 'giao_vien_id'] },
        ],
        where: {
            '$khoa_hoc.giao_vien_id$': req.userId,
            ...whereExam,
        },
        attributes: ['de_thi_id'],
        offset,
        limit: pageSize,
        order: [
            req.query.sortBy
                ? req.query.sortBy.split(',')
                : ['ngay_tao', 'DESC'],
        ],
        distinct: true,
    });

    const de_thi_ids = examIds.map((e) => e.de_thi_id);

    const rows = await Exam.findAll({
        attributes: [
            'de_thi_id',
            'ten_de_thi',
            'khoa_hoc_id',
            'ngay_tao',
            [fn('COUNT', col('cau_hoi_de_this.chdt_id')), 'so_cau_hoi'],
        ],
        include: [
            {
                model: StudentExam,
                as: 'de_thi_hoc_viens',
                attributes: [
                    'dthv_id',
                    'ngay_tao',
                    'so_cau_tra_loi_dung',
                    'so_cau_tra_loi_sai',
                    'ket_qua_diem',
                    [
                        literal(
                            `RANK() OVER (PARTITION BY de_thi_hoc_viens.de_thi_id ORDER BY ket_qua_diem DESC)`
                        ),
                        'xep_hang',
                    ],
                ],
                include: {
                    model: Student,
                    as: 'hoc_vien',
                    attributes: ['hoc_vien_id', 'ho_ten'],
                    required: true,
                },
            },
            {
                model: ExamQuestion,
                attributes: [],
                required: false,
            },
        ],
        where: {
            de_thi_id: { [Op.in]: de_thi_ids },
            ...(req.query.search && {
                [Op.or]: [
                    { ten_de_thi: { [Op.like]: `%${req.query.search}%` } },
                    {
                        '$de_thi_hoc_viens.hoc_vien.ho_ten$': {
                            [Op.like]: `%${req.query.search}%`,
                        },
                    },
                ],
            }),
            ...whereExam,
        },
        subQuery: false,
        order: [
            req.query.sortBy
                ? req.query.sortBy.split(',')
                : ['ngay_tao', 'DESC'],
        ],
        group: [
            'de_thi_id',
            'ten_de_thi',
            'khoa_hoc_id',
            'ngay_tao',
            'de_thi_hoc_viens.dthv_id',
            'de_thi_hoc_viens.ngay_tao',
            'de_thi_hoc_viens.so_cau_tra_loi_dung',
            'de_thi_hoc_viens.so_cau_tra_loi_sai',
            'de_thi_hoc_viens.ket_qua_diem',
            'de_thi_hoc_viens->hoc_vien.hoc_vien_id',
            'de_thi_hoc_viens->hoc_vien.ho_ten',
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

module.exports = {
    findAll,
    findOne,
    create,
    update,
    getUser,
    remove,
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
    exportDGNLv2,
    exportTest,
    exportTestv2,
    exportELearning,
    exportELearningv2,
    dashBoardByTeacher,
    findAllv2,
};
