const { CourseStudent, Course } = require('../models');
const sequelize = require('../utils/db');

//[GET] /account_bank
//by Pham Viet Trieu
const getAll = async (req, res) => {
    const count = await Course.count();
    const rows = await sequelize.query(
        `
        SELECT khoa_hoc.khoa_hoc_id, khoa_hoc.ten_khoa_hoc, COUNT(khoa_hoc_hoc_vien.hoc_vien_id) AS so_luong_hoc_vien
            FROM khoa_hoc LEFT JOIN khoa_hoc_hoc_vien ON khoa_hoc.khoa_hoc_id = khoa_hoc_hoc_vien.khoa_hoc_id
            INNER JOIN hoc_vien ON khoa_hoc_hoc_vien.hoc_vien_id = hoc_vien.hoc_vien_id
            WHERE khoa_hoc.ten_khoa_hoc LIKE :search GROUP BY khoa_hoc.khoa_hoc_id, khoa_hoc.ten_khoa_hoc ORDER BY khoa_hoc.ngay_tao LIMIT :limit OFFSET :offset`,
        {
            replacements: {
                search: req.query.search
                    ? `%${decodeURI(req.query.search)}%`
                    : '%%',
                offset:
                    (Number(req.query.pageIndex || 1) - 1) *
                    Number(req.query.pageSize || 10),
                limit: Number(req.query.pageSize || 10),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

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
