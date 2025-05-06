const { Footer } = require('../models');

const findAll = async (req, res) => {
    const footers = await Footer.findAll({ limit: 100 });

    return res.status(200).send({
        status: 'success',
        data: footers,
        message: null,
    });
};

const create = async (req, res) => {
    const footer = await Footer.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: footer,
        message: null,
    });
};

const findOne = async (req, res) => {
    const footer = await Footer.findOne({
        where: {
            footer_id: req.params.id,
        },
        raw: true,
    });

    return res.status(200).send({
        status: 'success',
        data: footer,
        message: null,
    });
};

const update = async (req, res) => {
    await Footer.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                footer_id: req.params.id,
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
    await Footer.destroy({
        where: {
            footer_id: req.params.id,
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
