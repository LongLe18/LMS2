const { ThematicCriteria, Modun, Thematic, Course } = require('../models');
const sequelize = require('../utils/db');

const getAll_admin = async (req, res) => {
    const { count, rows } = await ThematicCriteria.findAndCountAll({
        include: {
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
    });

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
    const thematicCriteria = await ThematicCriteria.findOne({
        where: {
            tcdcd_mo_dun_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: thematicCriteria,
        message: null,
    });
};

const getByThematic = async (req, res) => {
    try {
        let thematicCriteria = await ThematicCriteria.findAll({
            include: {
                model: Modun,
                include: {
                    model: Thematic,
                },
            },
            where: {
                '$mo_dun.chuyen_des.chuyen_de_id$': req.params.id,
            },
        });
        thematicCriteria = thematicCriteria[0];
        delete thematicCriteria.dataValues.mo_dun;
        res.status(200).send({
            status: 'success',
            data: thematicCriteria,
            message: null,
        });
    } catch (error) {
        res.status(403).send({
            status: 'warning',
            data: 'Chưa có tiêu chí đề thi',
            message: null,
        });
    }
};

const postCreate = async (req, res) => {
    let thematicCriteria;
    thematicCriteria = await ThematicCriteria.findOne({
        where: {
            mo_dun_id: req.body.mo_dun_id,
        },
    });
    if (thematicCriteria) {
        res.status(404).send({
            status: 'fail',
            data: null,
            message: 'already exist',
        });
        return;
    }
    thematicCriteria = await ThematicCriteria.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: thematicCriteria,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const thematicCriteria = await ThematicCriteria.findOne({
        where: {
            tcdcd_mo_dun_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: thematicCriteria,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    const thematicCriteria = await ThematicCriteria.update(
        {
            ...req.body,
        },
        {
            where: {
                tcdcd_mo_dun_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: thematicCriteria,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    await ThematicCriteria.destroy({
        where: {
            tcdcd_mo_dun_id: req.params.id,
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
    getByThematic,
    postCreate,
    getUpdate,
    putUpdate,
    forceDelete,
};
