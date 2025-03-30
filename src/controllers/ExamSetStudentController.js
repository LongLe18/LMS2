const { ExamSetStudent, CourseMedia, Media } = require('../models');

const getAll = async (req, res) => {
    const { count, rows } = await ExamSetStudent.findAndCountAll({
        include: [
            {
                model: CourseMedia,
                required: true,
                include: [
                    {
                        model: Media,
                        attributes: ['tep_tin_id', 'ten', 'duong_dan'],
                        required: true,
                    },
                ],
            },
        ],
        where: {
            ...(req.query.khoa_hoc_id && {
                khoa_hoc_id: req.query.khoa_hoc_id,
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

const getAllByUser = async (req, res) => {
    const { count, rows } = await ExamSetStudent.findAndCountAll({
        include: [
            {
                model: CourseMedia,
                required: true,
                include: [
                    {
                        model: Media,
                        attributes: ['tep_tin_id', 'ten', 'duong_dan'],
                        required: true,
                    },
                ],
            },
        ],
        where: {
            ...(req.query.khoa_hoc_id && {
                khoa_hoc_id: req.query.khoa_hoc_id,
            }),
            hoc_vien_id: req.userId
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
    const examSetStudent = await ExamSetStudent.findOne({
        where: {
            bdhv_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: examSetStudent,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const examSetStudent = await ExamSetStudent.create({
        ...req.body,
    });

    res.status(200).send({
        status: 'success',
        data: examSetStudent,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    await ExamSetStudent.update(
        {
            ...req.body,
        },
        {
            where: {
                bdhv_id: req.params.id,
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
    await ExamSetStudent.destroy({
        where: {
            bdhv_id: req.params.id,
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
    getAllByUser,
};
