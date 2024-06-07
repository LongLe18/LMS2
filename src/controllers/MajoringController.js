const { Majoring } = require('../models');

const postCreate = async (req, res) => {
    const major = await Majoring.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: major,
        message: null,
    });
};

const getAll = async (req, res) => {
    const majors = await Majoring.findAll({limit: 100});
    res.status(200).send({
        status: 'success',
        data: majors,
        message: null,
    });
};

const getById = async (req, res) => {
    const major = await Majoring.findOne({
        where: {
            chuyen_nganh_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: major,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const major = await Majoring.findOne({
        where: {
            chuyen_nganh_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: major,
        message: null,
    });
};

const putUpdate = async (req, res) => {
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
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    await Majoring.destroy({
        where: {
            chuyen_nganh_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    postCreate,
    getAll,
    getById,
    getUpdate,
    putUpdate,
    forceDelete,
};
