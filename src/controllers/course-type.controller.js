const { CourseType } = require('../models');

const findAll = async (req, res) => {
    const courseTypes = await CourseType.findAll();

    return res.status(200).send({
        status: 'success',
        data: courseTypes,
        message: null,
    });
};

const findOne = async (req, res) => {
    const courseType = await CourseType.findOne({
        where: {
            lkh_id: req.params.id,
        },
    });
    
    return res.status(200).send({
        status: 'success',
        data: courseType,
        message: null,
    });
};

const create = async (req, res) => {
    const courseType = await CourseType.findOne({
        ...req.body,
        nguoi_tao: req.userId
    });
    
    return res.status(200).send({
        status: 'success',
        data: courseType,
        message: null,
    });
};

const update = async (req, res) => {
    const courseType = await CourseType.findOne(
        {
            ...req.body,
            nguoi_sua: req.userId
        },
        {
            where: {
                lkh_id: req.params.id,
            },
        }
    );
    
    return res.status(200).send({
        status: 'success',
        data: courseType,
        message: null,
    });
};

const remove = async (req, res) => {
    await CourseType.destroy({
        where: {
            lkh_id: req.params.id,
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
