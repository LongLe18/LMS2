const { PositionPermission, Position, Permission } = require('../models');

const getAll = async (req, res) => {
    const { count, rows } = await Position.findAndCountAll({
        attributes: ['chuc_vu_id', 'ten', 'ngay_tao'],
        include: [
            {
                model: PositionPermission,
                attributes: ['cvqtc_id', 'chuc_vu_id', 'qtc_id'],
                include: [
                    {
                        model: Permission,
                        attributes: ['qtc_id', 'ten'],
                    },
                ],
            },
        ],
        where: {
            ...(req.query.ten && { ten: req.query.ten }),
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
    const positionPermission = await PositionPermission.findOne({
        where: {
            chuc_vu_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: positionPermission,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const positionPermission = await PositionPermission.create({
        ...req.body,
    });

    return res.status(200).send({
        status: 'success',
        data: positionPermission,
        message: null,
    });
};

const deleteById = async (req, res) => {
    await PositionPermission.destroy({
        where: {
            cvqtc_id: req.params.id,
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
    deleteById,
};
