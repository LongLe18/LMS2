const { ExamType } = require('../models');

const getAll = async (req, res) => {
    const examTypes = await ExamType.findAll();
    res.status(200).send({
        status: 'success',
        data: examTypes,
        message: null,
    });
};

const getById = async (req, res) => {
    const examType = await ExamType.findOne({
        where: {
            loai_de_thi_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: examType,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const examType = await ExamType.findOne({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: examType,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    const examType = await ExamType.findOne(
        {
            ...req.body,
        },
        {
            where: {
                loai_de_thi_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: examType,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    await ExamType.destroy({
        where: {
            loai_de_thi_id: req.params.id,
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
