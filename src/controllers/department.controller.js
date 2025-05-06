const { Department } = require('../models');

const findAll = async (req, res) => {
    const { count, rows } = await Department.findAndCountAll({
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

const findOne = async (req, res) => {
    const department = await Department.findOne({
        where: {
            don_vi_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: department,
        message: null,
    });
};

const create = async (req, res) => {
    const department = await Department.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: department,
        message: null,
    });
};

const update = async (req, res) => {
    await Department.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                don_vi_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const remove = async (req, res) => {
    await Department.destroy({
        where: {
            don_vi_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

module.exports = {
    findAll,
    findOne,
    create,
    update,
    remove,
};
