const { AccountBank } = require('../models');

const findAll = async (req, res) => {
    const { count, rows } = await AccountBank.findAndCountAll({
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
    const accountBank = await AccountBank.findOne({
        where: {
            tai_khoan_bank_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: accountBank,
        message: null,
    });
};

const create = async (req, res) => {
    const accountBank = await AccountBank.create({
        ...req.body,
        nguoi_tao: req.userId
    });
    res.status(200).send({
        status: 'success',
        data: accountBank,
        message: null,
    });
};

const update = async (req, res) => {
    await AccountBank.update(
        {
            ...req.body,
            nguoi_sua: req.userId
        },
        {
            where: {
                tai_khoan_bank_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const remmove = async (req, res) => {
    await AccountBank.destroy({
        where: {
            tai_khoan_bank_id: req.params.id,
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
    remmove,
};
