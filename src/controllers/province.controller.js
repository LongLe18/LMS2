const { Province } = require('../models');

const findAll = async (req, res) => {
    const provinces = await Province.findAll();

    return res.status(200).send({
        status: 'success',
        data: provinces,
        message: null,
    });
};

const findOne = async (req, res) => {
    const province = await Province.findOne({
        where: {
            ttp_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: province,
        message: null,
    });
};

const create = async (req, res) => {
    const province = await Province.create({
        ...req.body,
    });

    return res.status(200).send({
        status: 'success',
        data: province,
        message: null,
    });
};

const update = async (req, res) => {
    await Province.update(
        {
            ...req.body,
        },
        {
            where: {
                ttp_id: req.params.id,
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
    await Province.destroy({
        where: {
            ttp_id: req.params.id,
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
