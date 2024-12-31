const { ExamQuestion, Question } = require('../models');

const getAll = async (req, res) => {
    const examQuestions = await ExamQuestion.findAll({limit: 100});
    res.status(200).send({
        status: 'success',
        data: examQuestions,
        message: null,
    });
};

const getById = async (req, res) => {
    const examQuestion = await ExamQuestion.findOne({
        where: {
            chdt_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: examQuestion,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const examQuestion = await ExamQuestion.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: examQuestion,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const examQuestion = await ExamQuestion.findOne({
        where: {
            chdt_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: examQuestion,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    const examQuestion = await ExamQuestion.update(
        {
            ...req.body,
        },
        {
            where: {
                chdt_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: examQuestion,
        message: null,
    });
};

const putUpdatev2 = async (req, res) => {
    const examQuestion = await ExamQuestion.update(
        {
            danh_dau: req.body.danh_dau,
        },
        {
            where: {
                chdt_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: examQuestion,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    const examQuestion = await ExamQuestion.findOne({
        where: {
            chdt_id: req.params.id,
        },
    });
    await ExamQuestion.destroy({
        where: {
            chdt_id: req.params.id,
        },
    });
    await Question.destroy({
        where: {
            cau_hoi_id: examQuestion.cau_hoi_id,
            de_thi_id: examQuestion.de_thi_id
        },
    })
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
    getUpdate,
    putUpdate,
    forceDelete,
    putUpdatev2,
};
