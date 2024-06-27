const { Question, Answer } = require('../models');
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
            replacements: {
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
    const questions = await Question.findAll({
        order: [['ngay_tao', 'DESC']],
        limit: 100,
    });
    res.status(200).send({
        status: 'success',
        data: questions,
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
    const { cot_tren_hang, ...rest } = req.body;

    const question = await Question.create({
        ...rest,
        ...(req.files &&
            req.files.tep_dinh_kem_noi_dung && {
                tep_dinh_kem_noi_dung: req.files.tep_dinh_kem_noi_dung
                    .map(
                        (item) =>
                            item.destination.replace('public', '') +
                            '/' +
                            item.filename
                    )
                    .join(','),
            }),
            ...(req.files &&
                req.files.tep_dinh_kem_loi_giai && {
                    tep_dinh_kem_loi_giai: req.files.tep_dinh_kem_loi_giai
                        .map(
                            (item) =>
                                item.destination.replace('public', '') +
                                '/' +
                                item.filename
                        )
                        .join(','),
                }),
    });
    res.status(200).send({
        status: 'success',
        data: question,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    if (req.files) {
        const question = await Question.findOne({
            where: {
                cau_hoi_id: req.params.id,
            },
        });
        if (req.files['tep_dinh_kem_noi_dung'] && question.tep_dinh_kem_noi_dung) {
            for (const tep_dinh_kem_noi_dung of question.tep_dinh_kem_noi_dung.split(',')) {
                if (fs.existsSync(`public${tep_dinh_kem_noi_dung}`))
                    fs.unlinkSync(`public${tep_dinh_kem_noi_dung}`);
            }
        }
          if (req.files['tep_dinh_kem_loi_giai'] && question.tep_dinh_kem_loi_giai) {
            for (const tep_dinh_kem_loi_giai of question.tep_dinh_kem_loi_giai.split(',')) {
                if (fs.existsSync(`public${tep_dinh_kem_loi_giai}`))
                    fs.unlinkSync(`public${tep_dinh_kem_loi_giai}`);
            }
        }
    }
    await Question.update(
        {
            ...req.body,
            ...(req.files &&
                req.files.tep_dinh_kem && {
                    tep_dinh_kem: req.files.tep_dinh_kem
                        .map(
                            (item) =>
                                item.destination.replace('public', '') +
                                '/' +
                                item.filename
                        )
                        .join(','),
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
    try {
        const question = await Question.findOne({
            where: {
                cau_hoi_id: req.params.id,
            },
        });

        const media =
            /\\begin{center}\n\\includegraphics\[scale = 0.5]{\s*([\s\S]*?)\s*}\n\\end{center}/g.exec(
                question.loi_giai
            );
        if (media !== null && fs.existsSync(`public/${media[1]}`)) {
            fs.unlinkSync(`public/${media}`);
        }
        if (question.tep_dinh_kem_noi_dung) {
            for (const tep_dinh_kem_noi_dung of question.tep_dinh_kem_noi_dung.split(',')) {
                if (fs.existsSync(`public${tep_dinh_kem_noi_dung}`))
                    fs.unlinkSync(`public${tep_dinh_kem_noi_dung}`);
            }
        }
        if (question.tep_dinh_kem_loi_giai) {
            for (const tep_dinh_kem_loi_giai of question.tep_dinh_kem_loi_giai.split(',')) {
                if (fs.existsSync(`public${tep_dinh_kem_loi_giai}`))
                    fs.unlinkSync(`public${tep_dinh_kem_loi_giai}`);
            }
        }

        await Question.destroy({
            where: {
                cau_hoi_id: req.params.id,
            },
        });
    } catch (err) {
        console.log(err);
    }
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
