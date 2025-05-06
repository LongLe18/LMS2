const { Majoring } = require('../models');

const create = async (req, res) => {
    const major = await Majoring.create({
        ...req.body,
    });

    return res.status(200).send({
        status: 'success',
        data: major,
        message: null,
    });
};

const findAll = async (req, res) => {
    const majors = await Majoring.findAll();

    return res.status(200).send({
        status: 'success',
        data: majors,
        message: null,
    });
};

const findOne = async (req, res) => {
    const major = await Majoring.findOne({
        where: {
            chuyen_nganh_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: major,
        message: null,
    });
};

const update = async (req, res) => {
    await Majoring.update(
        {
            ...req.body,
        },
        {
            where: {
                chuyen_nganh_id: req.params.id,
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
    await Majoring.destroy({
        where: {
            chuyen_nganh_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    create,
    findAll,
    findOne,
    update,
    remove,
};
