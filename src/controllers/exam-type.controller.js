const { ExamType } = require('../models');

const findAll = async (req, res) => {
    const examTypes = await ExamType.findAll();
    
    return res.status(200).send({
        status: 'success',
        data: examTypes,
        message: null,
    });
};

const findOne = async (req, res) => {
    const examType = await ExamType.findOne({
        where: {
            loai_de_thi_id: req.params.id,
        },
    });
    
    return res.status(200).send({
        status: 'success',
        data: examType,
        message: null,
    });
};

const create = async (req, res) => {
    const examType = await ExamType.findOne({
        ...req.body,
        nguoi_tao: req.userId
    });
    
    return res.status(200).send({
        status: 'success',
        data: examType,
        message: null,
    });
};

const update = async (req, res) => {
    const examType = await ExamType.findOne(
        {
            ...req.body,
            nguoi_sua: req.userId
        },
        {
            where: {
                loai_de_thi_id: req.params.id,
            },
        }
    );
    
    return res.status(200).send({
        status: 'success',
        data: examType,
        message: null,
    });
};

const remove = async (req, res) => {
    await ExamType.destroy({
        where: {
            loai_de_thi_id: req.params.id,
        },
    });
    
    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    findAll,
    findOne,
    create,
    update,
    remove,
};
