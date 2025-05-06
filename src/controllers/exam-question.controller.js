const { ExamQuestion, Question } = require('../models');

const findAll = async (req, res) => {
    const { count, rows } = await ExamQuestion.findAndCountAll({
        offset: (Number(req.query.pageIndex || 1) - 1) * Number(req.query.pageSize || 10),
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
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalCount: count,
        totalPage: Math.ceil(count / pageSize),
        message: null,
    });
};

const findOne = async (req, res) => {
    const examQuestion = await ExamQuestion.findOne({
        where: {
            chdt_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: examQuestion,
        message: null,
    });
};

const create = async (req, res) => {
    const examQuestion = await ExamQuestion.create({
        ...req.body,
        nguoi_tao: req.userId
    });
    
    return res.status(200).send({
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
    
    return res.status(200).send({
        status: 'success',
        data: examQuestion,
        message: null,
    });
};

const update = async (req, res) => {
    const examQuestion = await ExamQuestion.update(
        {
            ...req.body,
            nguoi_sua: req.userId
        },
        {
            where: {
                chdt_id: req.params.id,
            },
        }
    );
    
    return res.status(200).send({
        status: 'success',
        data: examQuestion,
        message: null,
    });
};

const putUpdatev2 = async (req, res) => {
    const examQuestion = await ExamQuestion.update(
        {
            danh_dau: req.body.danh_dau,
            nguoi_sua: req.userId
        },
        {
            where: {
                chdt_id: req.params.id,
            },
        }
    );
    
    return res.status(200).send({
        status: 'success',
        data: examQuestion,
        message: null,
    });
};

const remove = async (req, res) => {
    const examQuestion = await ExamQuestion.findOne({
        where: {
            chdt_id: req.params.id,
        },
    });
    if (!examQuestion) {
        return res.status(404).send({
            status: 'error',
            message: 'Câu hỏi đề thi không tồn tại!',
        });
    }
    
    await ExamQuestion.destroy({
        where: {
            chdt_id: req.params.id,
        },
    });
    await Question.destroy({
        where: {
            cau_hoi_id: examQuestion.cau_hoi_id,
            de_thi_id: examQuestion.de_thi_id,
        },
    });
    
    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'Deleted successfully',
    });    
};

module.exports = {
    findAll,
    findOne,
    create,
    getUpdate,
    update,
    remove,
    putUpdatev2,
};
