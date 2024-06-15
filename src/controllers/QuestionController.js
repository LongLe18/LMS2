const {
    Question,
    Answer,
} = require('../models');
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
    let filter=`${de_thi_id}`;
    const questions = await sequelize.query(`
        select * from cau_hoi LEFT JOIN cau_hoi_de_thi ON cau_hoi.cau_hoi_id=cau_hoi_de_thi.cau_hoi_id where ${filter}
    `, {
        replacements: {
            de_thi_id: parseInt(req.query.de_thi_id),
            limit: parseInt(limit),
        }, 
        type: sequelize.QueryTypes.SELECT
    })
    res.status(200).send({
        status: 'success',
        data: questions,
        message: null,
    });
};

const getAll = async (req, res) => {
    const questions = await Question.findAll({
        order: [['ngay_tao', 'DESC']],
        limit: 100
    });
    res.status(200).send({
        status: 'success',
        data: questions,
        message: null,
    });
};

const getAll_admin = async (req, res) => {
    const questions = await Question.findAll({limit: 100});
    res.status(200).send({
        status: 'success',
        data: questions,
        message: null,
    });
};

const getById = async (req, res) => {
    const question = await Question.findOne({
        include:{
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
    const question = await Question.create({
        ...req.body,
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
        if (
            req.files['noi_dung'] &&
            question.noi_dung &&
            fs.existsSync(`src/public${question.noi_dung}`)
        )
            fs.unlinkSync(`src/public${question.noi_dung}`);
        if (
            req.files['loi_giai'] &&
            question.loi_giai &&
            fs.existsSync(`src/public${question.loi_giai}`)
        )
            fs.unlinkSync(`src/public${question.loi_giai}`);
    }
    await Question.update(
        {
            ...req.body,
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
    if (question.noi_dung && fs.existsSync(`src/public${question.noi_dung}`))
        fs.unlinkSync(`src/public${question.noi_dung}`);
    if (question.loi_giai && fs.existsSync(`src/public${question.loi_giai}`))
        fs.unlinkSync(`src/public${question.loi_giai}`);
    await Question.destroy({
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
