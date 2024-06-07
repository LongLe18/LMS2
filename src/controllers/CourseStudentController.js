const { CourseStudent } = require('../models');
const sequelize = require('../utils/db');

//[GET] /account_bank
//by Pham Viet Trieu
const getAll = async (req, res) => {
    let search =1;
    if (req.query.search) {
        search = 'khoa_hoc.ten_khoa_hoc LIKE :search';
    }
    const count= await sequelize.query(`
        SELECT COUNT(*) AS tong FROM khoa_hoc WHERE ${search}`,
        {
            replacements: {
                search: `%${decodeURI(req.query.search)}%`,
            },
            type: sequelize.QueryTypes.SELECT
        });
    const courseStudents = await sequelize.query(`
        SELECT khoa_hoc.khoa_hoc_id, khoa_hoc.ten_khoa_hoc, (SELECT COUNT(DISTINCT khoa_hoc_hoc_vien.hoc_vien_id) 
        FROM khoa_hoc_hoc_vien WHERE khoa_hoc_hoc_vien.khoa_hoc_id=khoa_hoc.khoa_hoc_id) AS so_luong
        FROM khoa_hoc WHERE ${search} ORDER BY khoa_hoc.ngay_tao LIMIT 200`,
        {
            replacements: {
                search: `%${decodeURI(req.query.search)}%`,
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: courseStudents,
        count: count[0].tong,
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
