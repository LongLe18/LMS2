const { Grade } = require('../models');

const create = async (req, res) => {
    const grade = await Grade.create({
        ...req.body,
    });

    return res.status(200).send({
        status: 'success',
        data: grade,
        message: null,
    });
};

const findAll = async (req, res) => {
    const grades = await Grade.findAll({ limit: 100 });

    return res.status(200).send({
        status: 'success',
        data: grades,
        message: null,
    });
};

const findOne = async (req, res) => {
    const grade = await Grade.findOne({
        where: {
            lop_id: req.params.id,
        },
    });

    return res.status(200).send({
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

const update = async (req, res) => {
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

    return res.status(200).send({
        status: 'success',
        data: grade,
        message: null,
    });
};

const remove = async (req, res) => {
    await Grade.destroy({
        where: {
            lop_id: req.params.id,
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
    getUpdate,
};
