const { Position } = require('../models');

const getAll = async (req, res) => {
    const { count, rows } = await Position.findAndCountAll({
        where: {
            ...(req.query.ten && { ten: req.query.ten }),
            ...(req.query.mo_ta && { mo_ta: req.query.mo_ta }),
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
    const position = await Position.findOne({
        where: {
            chuc_vu_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: position,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const position = await Position.create({
        ...req.body,
    });

    return res.status(200).send({
        status: 'success',
        data: position,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    await Position.update(
        {
            ...req.body,
        },
        {
            where: {
                chuc_vu_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const deleteById = async (req, res) => {
    await Position.destroy({
        where: {
            chuc_vu_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

module.exports = {
    getAll,
    getById,
    postCreate,
    putUpdate,
    deleteById,
};
