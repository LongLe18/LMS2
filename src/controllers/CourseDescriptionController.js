const { CourseDescription, DiscountCode, Course, Program } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res) => {
    const { count, rows } = await CourseDescription.findAndCountAll({
        include: {
            model: Course,
            attributes: ['khoa_hoc_id', 'ten_khoa_hoc'],
            include: {
                model: Program,
                attributes: ['kct_id', 'ten_khung_ct'],
            },
        },
        where: {
            ...(req.query.search && {
                ten_khoa_hoc: { [Op.like]: `%${req.query.search}%` },
            }), 
            ...(req.query.kct_id && {
                '$khoa_hoc.kct_id$': req.query.kct_id,
            }),
        },
        offset:
            (Number(req.query.pageIndex || 1) - 1) *
            Number(req.query.pageSize || 10),
        limit: Number(req.query.pageSize || 10),
        order: [
            req.query.sortBy
                ? req.query.sortBy.split(',')
                : ['ngay_tao', 'DESC'],
        ],
    });

    res.status(200).send({
        status: 'success',
        data: rows,
        pageIndex: Number(req.query.pageIndex || 1),
        pageSize: Number(req.query.pageSize || 10),
        totalCount: count,
        totalPage: Math.ceil(count / Number(req.query.pageSize || 10)),
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
