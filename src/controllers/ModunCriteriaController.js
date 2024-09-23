const { ModunCriteria, Modun, Course, Exam } = require('../models');
const sequelize = require('../utils/db');

const getAll_admin = async (req, res) => {
    const { count, rows } = await ModunCriteria.findAndCountAll({
        include:{
            model: Modun,
            attributes: ['mo_dun_id', 'ten_mo_dun'],
            include: {
                model: Course,
                attributes: ['khoa_hoc_id', 'ten_khoa_hoc'],
            },
        },
        where: {
            ...(req.query.mo_dun_id && {
                mo_dun_id: req.query.mo_dun_id,
            }),
            ...(req.query.khoa_hoc_id && {
                '$mo_dun.khoa_hoc.khoa_hoc_id$': req.query.khoa_hoc_id,
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
    const modunCriteria = await ModunCriteria.findOne({
        include:{
            model: Modun,
            attributes: ['mo_dun_id', 'khoa_hoc_id']
        },
        where: {
            tcdmd_khoa_hoc_id: req.params.id,
          
        },
    });
    res.status(200).send({
        status: 'success',
        data: modunCriteria,
        message: null,
    });
};

const getByModun = async (req, res) => {
    const modunCriteria = await ModunCriteria.findOne({
        where: {
            mo_dun_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: modunCriteria,
        message: null,
    });
};

const postCreate = async (req, res) => {
    let modunCriteria;
    modunCriteria = await ModunCriteria.findOne({
        where: {
            mo_dun_id: req.body.mo_dun_id,
        },
    });
    if (modunCriteria) {
        res.status(404).send({
            status: 'fail',
            data: null,
            message: 'already exists',
        });
        return;
    }
    modunCriteria = await ModunCriteria.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: modunCriteria,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const modunCriteria = await ModunCriteria.findOne({
        where: {
            tcdmd_khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: modunCriteria,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    const modunCriteria = await ModunCriteria.update(
        {
            ...req.body,
        },
        {
            where: {
                tcdmd_khoa_hoc_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: modunCriteria,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    await ModunCriteria.destroy({
        where: {
            tcdmd_khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const getQuantityExamPublish = async (req, res) => {
    const modunCriteria = await ModunCriteria.findOne({
        where: {
            tcdmd_khoa_hoc_id: req.params.id,
        },
    });
    const exams = await Exam.findAll({
        where:{
            khoa_hoc_id: modunCriteria.khoa_hoc_id,
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

module.exports = {
    getAll_admin,
    getById,
    getByModun,
    postCreate,
    getUpdate,
    putUpdate,
    forceDelete,
    getQuantityExamPublish
};
