const { Op } = require('sequelize');

const { CourseDescription, Course, Program, Teacher } = require('../models');

const findAll = async (req, res) => {
    const { count, rows } = await CourseDescription.findAndCountAll({
        include: {
            model: Course,
            attributes: ['khoa_hoc_id', 'ten_khoa_hoc'],
            include: [
                {
                    model: Program,
                    attributes: ['kct_id', 'ten_khung_ct', 'loai_kct'],
                },
                {
                    model: Teacher,
                    attributes: ['giao_vien_id', 'ho_ten'],
                },
            ],
        },
        where: {
            ...(req.query.search && {
                [Op.or]: [
                    {
                        '$khoa_hoc.ten_khoa_hoc$': {
                            [Op.like]: `%${decodeURI(req.query.search)}%`,
                        },
                    },
                    {
                        '$khoa_hoc.giao_vien.ho_ten$': {
                            [Op.like]: `%${decodeURI(req.query.search)}%`,
                        },
                    },
                ],
            }),
            ...(req.query.kct_id && {
                '$khoa_hoc.kct_id$': req.query.kct_id,
            }),
            ...(req.query.giao_vien_id && {
                '$khoa_hoc.giao_vien.giao_vien_id': req.query.giao_vien_id,
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

    return res.status(200).send({
        status: 'success',
        data: rows,
        pageIndex: Number(req.query.pageIndex || 1),
        pageSize: Number(req.query.pageSize || 10),
        totalCount: count,
        totalPage: Math.ceil(count / Number(req.query.pageSize || 10)),
        message: null,
    });
};

const findOne = async (req, res) => {
    const courseDescription = await CourseDescription.findOne({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: courseDescription,
        message: null,
    });
};

const create = async (req, res) => {
    const courseDescription = await CourseDescription.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: courseDescription,
        message: null,
    });
};

const update = async (req, res) => {
    await CourseDescription.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                khoa_hoc_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const remove = async (req, res) => {
    await CourseDescription.destroy({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

module.exports = {
    findAll,
    findOne,
    create,
    update,
    remove,
};
