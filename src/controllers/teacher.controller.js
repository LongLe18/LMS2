const { Op } = require('sequelize');
const fs = require('fs');

const { Teacher, Majoring, Position, Department } = require('../models');
const security = require('../utils/security');
const sendMail = require('../services/mail.service');
const sequelize = require('../utils/db');

const getDealers = async (req, res) => {
    const pageIndex = parseInt(req.query.pageIndex) || 1; // Mặc định là trang 1
    const pageSize = parseInt(req.query.pageSize) || 10; // Mặc định là 10 bản ghi mỗi trang

    const offset = (pageIndex - 1) * pageSize;
    const limit = pageSize;

    let dealers = await sequelize.query(
        `
        SELECT 
            giao_vien.giao_vien_id, 
            giao_vien.ho_ten, 
            COUNT(CASE WHEN chiet_khau_chi_tiet.trang_thai_su_dung = true THEN 1 END) AS sl_ma_da_ban,
            COUNT(CASE WHEN chiet_khau_chi_tiet.trang_thai_su_dung = false THEN 1 END) AS sl_ma_chua_ban
        FROM giao_vien
        LEFT JOIN chiet_khau_dai_ly 
            ON giao_vien.giao_vien_id = chiet_khau_dai_ly.giao_vien_id
        LEFT JOIN chiet_khau_chi_tiet 
            ON chiet_khau_dai_ly.chiet_khau_id = chiet_khau_chi_tiet.chiet_khau_id
        GROUP BY giao_vien.giao_vien_id, giao_vien.ho_ten
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements: { limit, offset },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    let totalCount = await sequelize.query(
        `
        SELECT COUNT(DISTINCT giao_vien.giao_vien_id) AS totalCount
        FROM giao_vien
        LEFT JOIN chiet_khau_dai_ly 
            ON giao_vien.giao_vien_id = chiet_khau_dai_ly.giao_vien_id
        LEFT JOIN chiet_khau_chi_tiet 
            ON chiet_khau_dai_ly.chiet_khau_id = chiet_khau_chi_tiet.chiet_khau_id
        `,
        { type: sequelize.QueryTypes.SELECT }
    );

    let totalPages = Math.ceil(totalCount[0].totalCount / pageSize); // Tính tổng số trang

    return res.status(200).send({
        status: 'success',
        data: dealers,
        pageIndex,
        pageSize,
        totalPages,
        totalCount: totalCount[0].totalCount,
        message: null,
    });
};

const getDealerUser = async (req, res) => {
    // Lấy thông tin pageIndex và pageSize từ request
    const pageIndex = parseInt(req.query.pageIndex) || 1; // Mặc định là trang 1
    const pageSize = parseInt(req.query.pageSize) || 10; // Mặc định là 10 bản ghi mỗi trang

    const offset = (pageIndex - 1) * pageSize;
    const limit = pageSize;

    let dealers = await sequelize.query(
        `
        SELECT 
            khoa_hoc.khoa_hoc_id, 
            khoa_hoc.ten_khoa_hoc, 
            chiet_khau_dai_ly.*, 
            (SELECT COUNT(*) AS sl 
                FROM chiet_khau_dai_ly 
                LEFT JOIN chiet_khau_chi_tiet 
                ON chiet_khau_dai_ly.chiet_khau_id = chiet_khau_chi_tiet.chiet_khau_id 
                WHERE chiet_khau_chi_tiet.trang_thai_su_dung = true 
                AND chiet_khau_dai_ly.giao_vien_id = :giao_vien_id
                AND chiet_khau_dai_ly.khoa_hoc_id = khoa_hoc.khoa_hoc_id) AS sl_ma_da_ban, 
            (SELECT COUNT(*) AS sl 
                FROM chiet_khau_dai_ly
                LEFT JOIN chiet_khau_chi_tiet 
                ON chiet_khau_dai_ly.chiet_khau_id = chiet_khau_chi_tiet.chiet_khau_id 
                WHERE chiet_khau_chi_tiet.trang_thai_su_dung = false 
                AND chiet_khau_dai_ly.giao_vien_id = :giao_vien_id 
                AND chiet_khau_dai_ly.khoa_hoc_id = khoa_hoc.khoa_hoc_id) AS sl_ma_chua_ban
        FROM chiet_khau_dai_ly
        JOIN khoa_hoc 
            ON chiet_khau_dai_ly.khoa_hoc_id = khoa_hoc.khoa_hoc_id
        WHERE chiet_khau_dai_ly.giao_vien_id = :giao_vien_id
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements: {
                giao_vien_id: parseInt(req.userId),
                limit: limit,
                offset: offset,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    let totalCount = await sequelize.query(
        `
        SELECT COUNT(DISTINCT chiet_khau_dai_ly.khoa_hoc_id) AS totalCount
        FROM chiet_khau_dai_ly
        JOIN khoa_hoc 
            ON chiet_khau_dai_ly.khoa_hoc_id = khoa_hoc.khoa_hoc_id
        WHERE chiet_khau_dai_ly.giao_vien_id = :giao_vien_id
        `,
        {
            replacements: {
                giao_vien_id: parseInt(req.userId),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    let totalPages = Math.ceil(totalCount[0].totalCount / pageSize); // Tính tổng số trang

    return res.status(200).send({
        status: 'success',
        data: dealers,
        pageIndex,
        pageSize,
        totalPages,
        totalCount: totalCount[0].totalCount,
        message: null,
    });
};

const getStatistical = async (req, res) => {
    // Lấy thông tin pageIndex và pageSize từ request
    const pageIndex = parseInt(req.query.pageIndex) || 1; // Mặc định là trang 1
    const pageSize = parseInt(req.query.pageSize) || 10; // Mặc định là 10 bản ghi mỗi trang

    const offset = (pageIndex - 1) * pageSize;
    const limit = pageSize;

    const teachers = await sequelize.query(
        `
        SELECT giao_vien.giao_vien_id, giao_vien.ho_ten, COUNT(DISTINCT mo_dun.mo_dun_id) AS so_mo_dun, 
        COUNT(DISTINCT mo_dun.khoa_hoc_id) AS so_khoa_hoc 
        FROM giao_vien 
        LEFT JOIN mo_dun 
        ON mo_dun.giao_vien_id = giao_vien.giao_vien_id 
        GROUP BY giao_vien.giao_vien_id, giao_vien.ho_ten
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements: {
                limit: limit,
                offset: offset,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    let totalCount = await sequelize.query(
        `
        SELECT COUNT(DISTINCT giao_vien.giao_vien_id) AS totalCount
        FROM giao_vien
        LEFT JOIN mo_dun 
        ON mo_dun.giao_vien_id = giao_vien.giao_vien_id
        `,
        {
            type: sequelize.QueryTypes.SELECT,
        }
    );

    let totalPages = Math.ceil(totalCount[0].totalCount / pageSize); // Tính tổng số trang

    return res.status(200).send({
        status: 'success',
        data: teachers,
        pageIndex,
        pageSize,
        totalPages,
        totalCount: totalCount[0].totalCount,
        message: null,
    });
};

const findAll = async (req, res) => {
    const { count, rows } = await Teacher.findAndCountAll({
        include: [
            {
                model: Department,
                attributes: ['don_vi_id', 'ten'],
            },
            {
                model: Majoring,
                attributes: ['chuyen_nganh_id', 'ten_chuyen_nganh'],
            },
        ],
        where: {
            ...(req.positionCode === 'ADMIN_3' && {
                don_vi_id: req.departmentId,
            }),
            ...(req.query.chuyen_nganh_id && {
                chuyen_nganh_id: req.query.chuyen_nganh_id,
            }),
            ...(req.query.don_vi_id && { don_vi_id: req.query.don_vi_id }),
            ...(req.query.trang_thai && { trang_thai: req.query.trang_thai }),
            ...(req.query.search && {
                [Op.or]: [
                    { ho_ten: { [Op.like]: `%${req.query.search}%` } },
                    {
                        '$don_vi.ten$': {
                            [Op.like]: `%${req.query.search}%`,
                        },
                    },
                    {
                        '$chuyen_nganh.ten$': {
                            [Op.like]: `%${req.query.search}%`,
                        },
                    },
                ],
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

    // Loại bỏ field `password`
    const sanitizedRows = rows.map((teacher) => {
        const { mat_khau, ...rest } = teacher.toJSON(); // đảm bảo là plain object
        return rest;
    });

    return res.status(200).send({
        status: 'success',
        data: sanitizedRows,
        pageIndex: Number(req.query.pageIndex || 1),
        pageSize: Number(req.query.pageSize || 10),
        totalCount: count,
        totalPage: Math.ceil(count / Number(req.query.pageSize || 10)),
        message: null,
    });
};

const findOne = async (req, res) => {
    const teacher = await Teacher.findOne({
        where: {
            giao_vien_id: req.params.id,
        },
    });
    if (
        req.positionCode === 'ADMIN_3' &&
        teacher.don_vi_id !== req.departmentId
    ) {
        return res.status(403).json({
            status: 'fail',
            message: 'Access denied: you are not allowed to view this teacher',
            data: null,
        });
    }

    const { password, ...sanitizedTeacher } = teacher.toJSON();

    return res.status(200).send({
        status: 'success',
        data: sanitizedTeacher,
        message: null,
    });
};

const create = async (req, res) => {
    if (
        req.positionCode === 'ADMIN_3' &&
        req.body.don_vi_id !== req.departmentId
    ) {
        return res.status(403).json({
            status: 'fail',
            message:
                'Access denied: you are not allowed to create a teacher in another department',
            data: null,
        });
    }

    const teacherExist = await Teacher.findOne({
        where: {
            email: req.body.email,
        },
    });
    if (teacherExist)
        return res.status(404).send({
            status: 'fail',
            data: null,
            message: 'Email already exists',
        });

    const password = security.generatePassword();
    const teacher = await Teacher.create({
        ...req.body,
        mat_khau: security.hashPassword(password),
        trang_thai: 1,
        nguoi_tao: req.userId,
    });
    const content = {
        gmail: req.body.email,
        password: password,
        ho_ten: req.body.ho_ten === null ? 'người dùng' : req.body.ho_ten,
    };
    await sendMail(content, 3);

    return res.status(200).send({
        status: 'success',
        data: teacher,
        message: null,
    });
};

//[GET] teacher/:id
const getUpdate = async (req, res) => {
    const teacher = await Teacher.findOne({
        where: {
            giao_vien_id: req.params.id,
        },
    });
    if (
        req.positionCode === 'ADMIN_3' &&
        teacher.don_vi_id !== req.departmentId
    ) {
        return res.status(403).json({
            status: 'fail',
            message: 'Access denied: you are not allowed to view this teacher',
            data: null,
        });
    }

    return res.status(200).send({
        status: 'success',
        data: teacher,
        message: null,
    });
};

const update = async (req, res) => {
    const teacherExist = await Teacher.findOne({
        where: {
            email: req.body.email,
            giao_vien_id: {
                [Op.ne]: req.params.id,
            },
        },
    });
    if (teacherExist)
        return res.status(404).send({
            status: 'fail',
            data: null,
            message: 'Email already exists',
        });

    const teacher = await Teacher.findOne({
        where: {
            giao_vien_id: req.params.id,
        },
    });
    if (!teacher) {
        return res.status(404).send({
            status: 'fail',
            data: null,
            message: 'Teacher not found',
        });
    }
    if (
        req.positionCode === 'ADMIN_3' &&
        teacher.don_vi_id !== req.departmentId
    ) {
        return res.status(403).json({
            status: 'fail',
            message:
                'Access denied: you are not allowed to update a teacher in another department',
            data: null,
        });
    }

    if (
        req.file &&
        teacher.anh_dai_dien &&
        fs.existsSync(`public${teacher.anh_dai_dien}`)
    )
        fs.unlinkSync(`public${teacher.anh_dai_dien}`);
    if (req.body.mat_khau)
        req.body.mat_khau = security.hashPassword(req.body.mat_khau);
    await Teacher.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                giao_vien_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const stateChange = async (req, res) => {
    const teacher = await Teacher.findOne({
        where: {
            giao_vien_id: req.params.id,
        },
    });
    if (
        req.positionCode === 'ADMIN_3' &&
        teacher.don_vi_id !== req.departmentId
    ) {
        return res.status(403).json({
            status: 'fail',
            message:
                'Access denied: you are not allowed to update a teacher in another department',
            data: null,
        });
    }

    await Teacher.update(
        {
            trang_thai: !teacher.trang_thai,
            nguoi_sua: req.userId,
        },
        {
            where: {
                giao_vien_id: req.params.id,
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
    const teacher = await Teacher.findOne({
        where: {
            giao_vien_id: req.params.id,
        },
    });

    if (
        req.positionCode === 'ADMIN_3' &&
        teacher.don_vi_id !== req.departmentId
    ) {
        return res.status(403).json({
            status: 'fail',
            message:
                'Access denied: you are not allowed to remove a teacher in another department',
            data: null,
        });
    }

    if (teacher.anh_dai_dien && fs.existsSync(`public${teacher.anh_dai_dien}`))
        fs.unlinkSync(`public${teacher.anh_dai_dien}`);
    await Teacher.destroy({
        where: {
            giao_vien_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    getDealerUser,
    getDealers,
    findAll,
    findOne,
    create,
    getUpdate,
    update,
    stateChange,
    getStatistical,
    remove,
};
