const {
    Teacher,
    Majoring,
} = require('../models');
const security = require('../utils/security');
const { Op } = require('sequelize');
const fs = require('fs');
const sendMail = require('../services/mail');
const crypto = require('crypto');
const sequelize = require('../utils/db');

const getDealers = async (req, res) => {
    let dealers = await sequelize.query(
        `SELECT giao_vien_id, ho_ten, (SELECT COUNT(*) AS sl FROM chiet_khau_dai_ly LEFT JOIN chiet_khau_chi_tiet 
        ON chiet_khau_dai_ly.chiet_khau_id=chiet_khau_chi_tiet.chiet_khau_id WHERE chiet_khau_chi_tiet.trang_thai_su_dung=true 
        AND chiet_khau_dai_ly.giao_vien_id=giao_vien.giao_vien_id) AS sl_ma_da_ban,
        (SELECT COUNT(*) AS sl FROM chiet_khau_dai_ly LEFT JOIN chiet_khau_chi_tiet 
        ON chiet_khau_dai_ly.chiet_khau_id=chiet_khau_chi_tiet.chiet_khau_id 
        WHERE trang_thai_su_dung=false AND giao_vien_id=giao_vien.giao_vien_id) AS sl_ma_chua_ban FROM giao_vien`,
        { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).send({
        status: 'success',
        data: dealers,
        message: null,
    });
};

const getDealerUser =async (req, res) => {
    let dealers = await sequelize.query(
        `SELECT khoa_hoc.khoa_hoc_id, khoa_hoc.ten_khoa_hoc, chiet_khau_dai_ly.*, (SELECT COUNT(*) AS sl 
        FROM chiet_khau_dai_ly LEFT JOIN chiet_khau_chi_tiet ON chiet_khau_dai_ly.chiet_khau_id=chiet_khau_chi_tiet.chiet_khau_id 
        WHERE chiet_khau_chi_tiet.trang_thai_su_dung=true AND chiet_khau_dai_ly.giao_vien_id=:giao_vien_id
        AND chiet_khau_dai_ly.khoa_hoc_id=khoa_hoc_id) AS sl_ma_da_ban, (SELECT COUNT(*) AS sl FROM chiet_khau_dai_ly
        LEFT JOIN chiet_khau_chi_tiet ON chiet_khau_dai_ly.chiet_khau_id=chiet_khau_chi_tiet.chiet_khau_id 
        WHERE chiet_khau_chi_tiet.trang_thai_su_dung=false AND chiet_khau_dai_ly.giao_vien_id=:giao_vien_id AND
        chiet_khau_dai_ly.khoa_hoc_id=khoa_hoc_id) sl_ma_chua_ban FROM chiet_khau_dai_ly JOIN khoa_hoc 
        ON chiet_khau_dai_ly.khoa_hoc_id=khoa_hoc.khoa_hoc_id WHERE chiet_khau_dai_ly.giao_vien_id=:giao_vien_id`,
        {
            replacements:{
                giao_vien_id: parseInt(req.userId)
            },
            type: sequelize.QueryTypes.SELECT 
        }
    );
    res.status(200).send({
        status: 'success',
        data: dealers,
        message: null,
    });
}

const getStatistical = async (req, res) => {
    const teachers= await sequelize.query(`
        SELECT giao_vien.giao_vien_id, giao_vien.ho_ten, COUNT(DISTINCT mo_dun.mo_dun_id) AS so_mo_dun, 
        COUNT(DISTINCT mo_dun.khoa_hoc_id) AS so_khoa_hoc FROM giao_vien LEFT JOIN mo_dun ON 
        mo_dun.giao_vien_id=giao_vien.giao_vien_id GROUP BY giao_vien.giao_vien_id, giao_vien.ho_ten`,
        {type: sequelize.QueryTypes.SELECT});
    res.status(200).send({
        status: 'success',
        data: teachers,
        message: null,
    });
}

//[GET] teacher?id
const getAll = async (req, res) => {
    try {
        let search = '';
        let ngay_bat_dau = `2000-1-1`;
        let ngay_ket_thuc = `2100-1-1`;
        let filter = {};
        if (req.query.ngay_bat_dau) {
            ngay_bat_dau = req.query.ngay_bat_dau;
        }
        if (req.query.ngay_ket_thuc) {
            ngay_ket_thuc = req.query.ngay_ket_thuc;
        }
        if (req.query.trang_thai) {
            filter.trang_thai = req.query.trang_thai;
        }
        if (req.query.search) {
            search = decodeURI(req.query.search);
        }
        if (req.query.chuyen_nganh_id) {
            filter.chuyen_nganh_id = req.query.chuyen_nganh_id;
        }
        let count=await Teacher.count({
            where:{
                [Op.or]: {
                    ho_ten: {
                        [Op.like]: `%${search}%`,
                    },
                },
                ngay_tao: {
                    [Op.between]: [ngay_bat_dau, ngay_ket_thuc],
                },
                ...filter,
            }
        })

        const authorizationHeader = req.headers['authorization'];
        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            res.status(401).send('Unauthorized');
        } else {
            const decodedToken = security.verifyToken(token);
            if (decodedToken.role === 0) { // học viên
                let teachers = await Teacher.findAll({
                    where: {
                        [Op.or]: {
                            ho_ten: {
                                [Op.like]: `%${search}%`,
                            },
                        },
                        ngay_tao: {
                            [Op.between]: [ngay_bat_dau, ngay_ket_thuc],
                        },
                        ...filter,
                    },
                    order: [['trang_thai','DESC'],['ngay_tao', 'DESC']],
                    attributes:['giao_vien_id', 'ho_ten', 'anh_dai_dien'],
                    limit: 100
                });
                res.status(200).send({
                    status: 'success',
                    data: teachers,
                    count: count,
                    message: null,
                });
            } else { // nhân viên hoặc giáo viên
                let teachers = await Teacher.findAll({
                    where: {
                        [Op.or]: {
                            ho_ten: {
                                [Op.like]: `%${search}%`,
                            },
                        },
                        ngay_tao: {
                            [Op.between]: [ngay_bat_dau, ngay_ket_thuc],
                        },
                        ...filter,
                    },
                    order: [['trang_thai','DESC'],['ngay_tao', 'DESC']],
                    attributes:['giao_vien_id', 'ho_ten', 'anh_dai_dien', 'ngay_tao', 'ngay_sinh', 'gioi_tinh', 'email', 'sdt','trang_thai'],
                    limit: 100
                });
                res.status(200).send({
                    status: 'success',
                    data: teachers,
                    count: count,
                    message: null,
                });
            }
        }
    } catch (error) {
        res.status(401).send(
        {
            status: 'fail',
            data: null,
            message: error,
        });
    }
};

//[GET] teacher/:id
const getById = async (req, res) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            res.status(401).send({
                status: 'success',
                data: null,
                message: 'Bạn không có quyền đọc thông tin người dùng này',
            });
        } else {
            const decodedToken = security.verifyToken(token);
            if (decodedToken.userId === Number(req.params.id) || decodedToken.role === 2 || decodedToken.role === 1) {
                const teacher = await Teacher.findOne({
                    where: {
                        giao_vien_id: req.params.id,
                    },
                    attributes:['giao_vien_id', 'ho_ten', 'anh_dai_dien', 'chuyen_nganh_id',
                        'ngay_tao', 'ngay_sinh', 'gioi_tinh', 'email', 'sdt', 'trang_thai', 'dia_chi', 'gioi_thieu']
                });
                res.status(200).send({
                    status: 'success',
                    data: teacher,
                    message: null,
                });
            } else {
                res.status(401).send(
                {
                    status: 'success',
                    data: null,
                    message: 'Bạn không có quyền đọc thông tin người dùng này',
                });
            }
        }
    } catch (error) {
        res.status(401).send({
            status: 'success',
            data: null,
            message: 'Bạn không có quyền đọc thông tin người dùng này',
        });
    }
};

//[POST] teacher/create
const postCreate = async (req, res) => {
    let teacher = await Teacher.findOne({
        where: {
            email: req.body.email,
        },
    });
    if (teacher)
        res.status(404).send({
            status: 'fail',
            data: null,
            message: 'Email already exists',
        });
    else {
        const password = security.generatePassword();
        teacher = await Teacher.create({
            ...req.body,
            mat_khau: security.hashPassword(password),
            trang_thai: 1,
        });
        const content = { gmail: req.body.email, password: password, ho_ten: req.body.ho_ten === null ? 'người dùng' : req.body.ho_ten };
        await sendMail(content, 3);
        res.status(200).send({
            status: 'success',
            data: teacher,
            message: null,
        });
    }
};

//[GET] teacher/:id
const getUpdate = async (req, res) => {
    const teacher = await Teacher.findOne({
        where: {
            giao_vien_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: teacher,
        message: null,
    });
};

//[PUT] teacher/:id
const putUpdate = async (req, res) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            res.status(401).send({
                status: 'success',
                data: null,
                message: 'Bạn không có quyền sửa thông tin người dùng này',
            });
        } else {
            const decodedToken = security.verifyToken(token);
            if (decodedToken.userId === Number(req.params.id) || decodedToken.role === 1 || decodedToken.role === 2) {
                let teacher = await Teacher.findOne({
                    where: {
                        email: req.body.email,
                        giao_vien_id: {
                            [Op.ne]: req.params.id,
                        },
                    },
                });
                if (teacher)
                    res.status(404).send({
                        status: 'fail',
                        data: null,
                        message: 'Email already exists',
                    });
                else {
                    teacher = await Teacher.findOne({
                        where: {
                            giao_vien_id: req.params.id,
                        },
                    });
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
                        },
                        {
                            where: {
                                giao_vien_id: req.params.id,
                            },
                        }
                    );
                    res.status(200).send({
                        status: 'success',
                        data: null,
                        message: null,
                    });
                }
            } else {
                res.status(401).send(
                {
                    status: 'success',
                    data: null,
                    message: 'Bạn không có quyền sửa thông tin người dùng này',
                });
            }
        }
    } catch (error) {
        res.status(401).send({
            status: 'success',
            data: null,
            message: 'Bạn không có quyền sửa thông tin người dùng này',
        });
    }
    
};

//[DELETE] teacher/:id
const stateChange = async (req, res) => {
    const teacher = await Teacher.findOne({
        where: {
            giao_vien_id: req.params.id,
        },
    });
    if (teacher.trang_thai != 1) {
        await Teacher.update(
            {
                trang_thai: 1,
            },
            {
                where: {
                    giao_vien_id: req.params.id,
                },
            }
        );
    } else if (teacher.trang_thai != 0) {
        await Teacher.update(
            {
                trang_thai: 0,
            },
            {
                where: {
                    giao_vien_id: req.params.id,
                },
            }
        );
    }
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[DELETE] teacher/:id/force
const forceDelete = async (req, res) => {
    const teacher = await Teacher.findOne({
        where: {
            giao_vien_id: req.params.id,
        },
    });
    if (
        teacher.anh_dai_dien &&
        fs.existsSync(`public${teacher.anh_dai_dien}`)
    )
        fs.unlinkSync(`public${teacher.anh_dai_dien}`);
    await Teacher.destroy({
        where: {
            giao_vien_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    getDealerUser,
    getDealers,
    getAll,
    getById,
    postCreate,
    getUpdate,
    putUpdate,
    stateChange,
    getStatistical,
    forceDelete,
};
