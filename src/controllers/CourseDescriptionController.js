const { CourseDescription, DiscountCode } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res) => {
    let offset = 0;
    let limit =100;
    if(req.query.offset){
        offset=req.query.offset;
    }
    if(req.query.limit){
        limit=req.query.limit;
    }
    const courseDescriptions = await CourseDescription.findAll(
        {offset: parseInt(offset), limit:parseInt(limit)});
    res.status(200).send({
        status: 'success',
        data: courseDescriptions,
        message: null,
    });
};

const getById = async (req, res) => {
    const courseDescription = await CourseDescription.findOne({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: courseDescription,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const courseDescription = await CourseDescription.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: courseDescription,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    await CourseDescription.update(
        {
            ...req.body,
        },
        {
            where: {
                khoa_hoc_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const deleteById = async (req, res) => {
    await CourseDescription.destroy({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

module.exports = {
    getAll,
    getById,
    postCreate,
    putUpdate,
    deleteById,
};
