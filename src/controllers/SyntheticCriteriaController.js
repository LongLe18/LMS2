const { SyntheticCriteria, Course, Exam } = require('../models');
const sequelize = require('../utils/db');

const getAll_admin = async (req, res) => {
    const { count, rows } = await SyntheticCriteria.findAndCountAll({
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
    })

    res.status(200).send({
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
    const syntheticCriteria = await SyntheticCriteria.findOne({
        where: {
            tcdth_khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: syntheticCriteria,
        message: null,
    });
};

const getByCourse = async (req, res) => {
    const syntheticCriteria = await SyntheticCriteria.findOne({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: syntheticCriteria,
        message: null,
    });
};

const postCreate = async (req, res) => {
    let syntheticCriteria;
    syntheticCriteria = await SyntheticCriteria.findOne({
        where: {
            khoa_hoc_id: req.body.khoa_hoc_id,
        },
    });
    if (syntheticCriteria) {
        res.status(404).send({
            status: 'fail',
            data: null,
            message: 'already exist',
        });
        return;
    }
    syntheticCriteria = await SyntheticCriteria.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: syntheticCriteria,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const syntheticCriteria = await SyntheticCriteria.findOne({
        where: {
            tcdth_khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: syntheticCriteria,
        message: null,
    });
};

const getQuantityExamPublish = async (req, res) => {
    const syntheticCriteria = await SyntheticCriteria.findOne({
        where: {
            tcdth_khoa_hoc_id: req.params.id,
        },
    });
    const exams = await Exam.findAll({
        where:{
            khoa_hoc_id: syntheticCriteria.khoa_hoc_id,
            xuat_ban: 1,
        },
        attributes: ['de_thi_id', 'ten_de_thi']
    })

    res.status(200).send({
        status: 'success',
        data: exams,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    const syntheticCriteria = await SyntheticCriteria.update(
        {
            ...req.body,
        },
        {
            where: {
                tcdth_khoa_hoc_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: syntheticCriteria,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    await SyntheticCriteria.destroy({
        where: {
            tcdth_khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

module.exports = {
    getAll_admin,
    getById,
    postCreate,
    getByCourse,
    getUpdate,
    putUpdate,
    forceDelete,
    getQuantityExamPublish
};
