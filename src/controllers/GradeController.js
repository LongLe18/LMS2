const { Grade } = require('../models');

const postCreate = async (req, res) => {
    const grade = await Grade.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: grade,
        message: null,
    });
};

const getAll = async (req, res) => {
    const grades = await Grade.findAll({limit: 100});
    res.status(200).send({
        status: 'success',
        data: grades,
        message: null,
    });
};

const getById = async (req, res) => {
    const grade = await Grade.findOne({
        where: {
            lop_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: grade,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const grade = await Grade.findOne({
        where: {
            lop_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: grade,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    const grade = await Grade.update(
        {
            ...req.body,
        },
        {
            where: {
                lop_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: grade,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    await Grade.destroy({
        where: {
            lop_id: req.params.id,
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
