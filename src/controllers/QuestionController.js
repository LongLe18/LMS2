const { Question, Answer, Majoring, ExamQuestion, QuestionDetail } = require('../models');
const fs = require('fs');
const { Op } = require('sequelize');
const sequelize = require('../utils/db');

const getByExam = async (req, res) => {
    let limit = 100;
    let de_thi_id = 1;
    if (req.query.limit) {
        limit = req.query.limit;
    }
    if (req.query.de_thi_id) {
        de_thi_id = `cau_hoi_de_thi.de_thi_id=:de_thi_id`;
    } else {
        res.status(200).send({
            status: 'success',
            data: null,
            message: 'Hãy chọn đề thi',
        });
        return;
    }
    let filter = `${de_thi_id}`;
    const questions = await sequelize.query(
        `
        select * from cau_hoi LEFT JOIN cau_hoi_de_thi ON cau_hoi.cau_hoi_id=cau_hoi_de_thi.cau_hoi_id where ${filter}
    `,
        {
            replaceAllments: {
                de_thi_id: parseInt(req.query.de_thi_id),
                limit: parseInt(limit),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.status(200).send({
        status: 'success',
        data: questions,
        message: null,
    });
};

const getAll = async (req, res) => {
    const { count, rows } = await Question.findAndCountAll({
        include: {
            model: Answer,
        },
        include: {
            model: Majoring,
            attributes: ['chuyen_nganh_id', 'ten_chuyen_nganh'],
        },
        where: {
            ...(req.query.chuyen_nganh_id && {
                chuyen_nganh_id: req.query.chuyen_nganh_id,
            }),
            ...(req.query.kct_id && { kct_id: req.query.kct_id }),
            ...(req.query.loai_cau_hoi && { loai_cau_hoi: req.query.loai_cau_hoi }),
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

const getAll_admin = async (req, res) => {
    const questions = await Question.findAll({ limit: 100 });
    res.status(200).send({
        status: 'success',
        data: questions,
        message: null,
    });
};

const getById = async (req, res) => {
    const question = await Question.findOne({
        include: {
            model: Answer,
        },
        where: {
            cau_hoi_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: question,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const { cot_tren_hang, noi_dung, ...rest } = req.body;

    const question = await Question.create({
        ...rest,
        ...(noi_dung && {
            noi_dung: noi_dung
                .replaceAll('\\[', '$')
                .replaceAll('\\]', '$')
                .replaceAll('{align}', '{matrix}')
                .replaceAll(/\$(.*?)\$/gs, (match) => {
                    return match.replaceAll(/\n/g, '');
                }),
        }),
        ...(req.files &&
            req.files.tep_dinh_kem_noi_dung && {
                noi_dung: `${req.body.noi_dung} ${req.body.tep_dinh_kem_noi_dung}`,
                tep_dinh_kem_noi_dung: req.body.tep_dinh_kem_noi_dung
            }),
        ...(req.files &&
            req.files.tep_dinh_kem_loi_giai && {
                loi_giai: `${req.body.loi_giai} ${req.body.tep_dinh_kem_loi_giai}`,
                tep_dinh_kem_loi_giai: req.body.tep_dinh_kem_loi_giai
            }),
    });
    res.status(200).send({
        status: 'success',
        data: question,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    const { noi_dung, ...rest } = req.body;
    await Question.update(
        {
            ...rest,
            ...(noi_dung && {
                noi_dung: noi_dung
                    .replaceAll('\\[', '$')
                    .replaceAll('\\]', '$')
                    .replaceAll('{align}', '{matrix}')
                    .replaceAll(/\$(.*?)\$/gs, (match) => {
                        return match.replaceAll(/\n/g, '');
                    }),
            }),
            ...(req.files &&
                req.files.tep_dinh_kem_noi_dung && {
                    noi_dung: `${req.body.noi_dung} ${req.body.tep_dinh_kem_noi_dung}`,
                    tep_dinh_kem_noi_dung: req.body.tep_dinh_kem_noi_dung
                }),
            ...(req.files &&
                req.files.tep_dinh_kem_loi_giai && {
                    loi_giai: `${req.body.loi_giai} ${req.body.tep_dinh_kem_loi_giai}`,
                    tep_dinh_kem_loi_giai: req.body.tep_dinh_kem_loi_giai
                }),
        },
        {
            where: {
                cau_hoi_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    const question = await Question.findOne({
        where: {
            cau_hoi_id: req.params.id,
        },
    });
    const examPushlished = await sequelize.query(
        `
            SELECT DISTINCT de_thi.de_thi_id FROM cau_hoi_de_thi INNER JOIN de_thi
                ON cau_hoi_de_thi.de_thi_id = de_thi.de_thi_id
                WHERE cau_hoi_id = :cau_hoi_id AND de_thi.xuat_ban = true`,
        {
            replacements: {
                cau_hoi_id: parseInt(req.params.id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    if (examPushlished.length > 0) {
        return res.status(400).send({
            status: 'error',
            data: null,
            message: 'Câu hỏi thuộc đề thi đã xuất bản',
        });
    }

    const media =
        /\\begin{center}\n\\includegraphics\[scale = 0.5]{\s*([\s\S]*?)\s*}\n\\end{center}/g.exec(
            question.loi_giai
        );
    if (media !== null && fs.existsSync(`public/${media[1]}`)) {
        fs.unlinkSync(`public/${media}`);
    }
    if (question.tep_dinh_kem_noi_dung) {
        for (const tep_dinh_kem_noi_dung of question.tep_dinh_kem_noi_dung.split(
            ','
        )) {
            if (fs.existsSync(`public${tep_dinh_kem_noi_dung}`))
                fs.unlinkSync(`public${tep_dinh_kem_noi_dung}`);
        }
    }
    if (question.tep_dinh_kem_loi_giai) {
        for (const tep_dinh_kem_loi_giai of question.tep_dinh_kem_loi_giai.split(
            ','
        )) {
            if (fs.existsSync(`public${tep_dinh_kem_loi_giai}`))
                fs.unlinkSync(`public${tep_dinh_kem_loi_giai}`);
        }
    }

    await Question.destroy({
        where: {
            cau_hoi_id: req.params.id,
        },
    });
    await ExamQuestion.destroy({
        where: {
            cau_hoi_id: req.params.id,
        },
    });
    await QuestionDetail.destroy({
        where: {
            cau_hoi_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    getByExam,
    getAll,
    getAll_admin,
    getById,
    postCreate,
    putUpdate,
    forceDelete,
};
