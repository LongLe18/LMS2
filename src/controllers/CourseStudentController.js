const { CourseStudent, Course, Student } = require('../models');
const sequelize = require('../utils/db');
const { Op } = require('sequelize');

//[GET] /account_bank
//by Pham Viet Trieu
const getAll = async (req, res) => {
    const count = (await Course.findAll({
        attributes: [
            'khoa_hoc_id',
        ],
        where: {
            ten_khoa_hoc: {
                [Op.like]: req.query.search ? `%${decodeURI(req.query.search)}%` : '%%',
            },
        },
    })).length;
    const rows = await Course.findAll({
        attributes: [
            'khoa_hoc_id',
            'ten_khoa_hoc',
            'ngay_tao',
            [
                sequelize.fn(
                    'COUNT',
                    sequelize.col('khoa_hoc_hoc_viens.hoc_vien_id')
                ),
                'so_luong_hoc_vien',
            ],
        ],
        include: {
            model: CourseStudent,
            attributes: [],
            include: {
                model: Student,
                attributes: [],
                required: true,
            },
        },
        where: {
            ten_khoa_hoc: {
                [Op.like]: req.query.search ? `%${decodeURI(req.query.search)}%` : '%%',
            },
        },
        group: ['khoa_hoc.khoa_hoc_id', 'khoa_hoc.ten_khoa_hoc'],
        order: [['ngay_tao', 'ASC']],
        offset:
            (Number(req.query.pageIndex || 1) - 1) *
            Number(req.query.pageSize || 10),
        limit: Number(req.query.pageSize || 10),
        subQuery: false,
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

//[GET] /account_bank/:id
//by Pham Viet Trieu
const getById = async (req, res) => {
    const courseStudent = await CourseStudent.findOne({
        where: {
            khhv_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: courseStudent,
        message: null,
    });
};

//[POST] /account_bank/create
//by Pham Viet Trieu
const postCreate = async (req, res) => {
    const courseStudent = await CourseStudent.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: courseStudent,
        message: null,
    });
};

//[PUT] /account_bank/:id
//by Pham Viet Trieu
const putUpdate = async (req, res) => {
    await CourseStudent.update(
        {
            ...req.body,
        },
        {
            where: {
                khhv_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[DELETE] /account_bank/:id
//by Pham Viet Trieu
const deleteById = async (req, res) => {
    await CourseStudent.destroy({
        where: {
            khhv_id: req.params.id,
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
