const { Op } = require('sequelize');

const { CourseStudent, Course, Student } = require('../models');
const sequelize = require('../utils/db');

const findAll = async (req, res) => {
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
    const courseStudent = await CourseStudent.findOne({
        where: {
            khhv_id: req.params.id,
        },
    });
    
    return res.status(200).send({
        status: 'success',
        data: courseStudent,
        message: null,
    });
};

const create = async (req, res) => {
    const courseStudent = await CourseStudent.create({
        ...req.body,
        ngay_tao: req.userId
    });
    
    return res.status(200).send({
        status: 'success',
        data: courseStudent,
        message: null,
    });
};

const remove = async (req, res) => {
    await CourseStudent.destroy({
        where: {
            khhv_id: req.params.id,
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
    remove,
};
