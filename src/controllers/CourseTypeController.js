const { CourseType } = require('../models');

const getAll = async (req, res) => {
    const courseTypes = await CourseType.findAll();
    res.status(200).send({
        status: 'success',
        data: courseTypes,
        message: null,
    });
};

const getById = async (req, res) => {
    const courseType = await CourseType.findOne({
        where: {
            lkh_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: courseType,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const courseType = await CourseType.findOne({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: courseType,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    const courseType = await CourseType.findOne(
        {
            ...req.body,
        },
        {
            where: {
                lkh_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: courseType,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    await CourseType.destroy({
        where: {
            lkh_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    getAll,
    getById,
    postCreate,
    putUpdate,
    forceDelete,
};
