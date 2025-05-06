const { Permission } = require('../models');

const findAll = async (req, res) => {
    const { count, rows } = await Permission.findAndCountAll({
        where: {
            ...(req.query.hanh_dong && { hanh_dong: req.query.hanh_dong }),
            ...(req.query.loai && { loai: req.query.loai }),
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
    const permission = await Permission.findOne({
        where: {
            qtc_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: permission,
        message: null,
    });
};

module.exports = {
    findAll,
    findOne,
};
