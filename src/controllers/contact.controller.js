const { Contact } = require('../models');

const findAll = async (req, res) => {
    const { count, rows } = await Contact.findAndCountAll({
        where: {
            ...(req.query.mo_ta && {
                mo_ta: { [Op.like]: `%${req.query.mo_ta}%` },
            }),
            ...(req.query.link_lien_ket && {
                link_lien_ket: { [Op.like]: `%${req.query.link_lien_ket}%` },
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
    const contact = await Contact.findOne({
        where: {
            lien_he_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: contact,
        message: null,
    });
};

const create = async (req, res) => {
    const contact = await Contact.create({
        ...req.body,
        nguoi_tao: req.userId
    });

    return res.status(200).send({
        status: 'success',
        data: contact,
        message: null,
    });
};

const update = async (req, res) => {
    await Contact.update(
        {
            ...req.body,
            nguoi_sua: req.userId
        },
        {
            where: {
                lien_he_id: req.params.id,
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
    await Contact.destroy({
        where: {
            lien_he_id: req.params.id,
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
