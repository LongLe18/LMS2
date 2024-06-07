const { Staff, Role } = require('../models');
const security = require('../utils/security');
const { Op } = require('sequelize');
const fs = require('fs');
const sendMail = require('../services/mail');
const sequelize = require('../utils/db');

//[GET] staff?
const getAll = async (req, res) => {
    let search = 1;
    let ngay_tao=1;
    let trang_thai=1;
    let offset = 0;
    let limit =100;
    if(req.query.offset){
        offset=req.query.offset;
    }
    if(req.query.limit){
        limit=req.query.limit;
    }
    if (req.query.trang_thai) {
        trang_thai = `nhan_vien.trang_thai=:trang_thai`;
    }
    if (req.query.ngay_bat_dau&&req.query.ngay_ket_thuc) {
        ngay_tao = 'ngay_tao BETWEEN :ngay_bat_dau AND :ngay_ket_thuc';
    }
    if (req.query.search) {
        search = 'nhan_vien.ho_ten LIKE :search';
    }
    let filter=`WHERE ${trang_thai} AND ${search} AND ${ngay_tao}`;
    const total = await sequelize.query(`
        SELECT count(nhan_vien.nhan_vien_id) as tong FROM nhan_vien ${filter} 
        ORDER BY nhan_vien.ngay_tao DESC`,
        {
            replacements:{
                trang_thai: parseInt(req.query.trang_thai),
                search: `%${decodeURI(req.query.search)}%`,
                ngay_bat_dau: req.query.ngay_bat_dau,
                ngay_ket_thuc: req.query.ngay_ket_thuc,
            },
            type: sequelize.QueryTypes.SELECT
        });
    const staffs=await sequelize.query(`
        SELECT nhan_vien.nhan_vien_id, nhan_vien.anh_dai_dien, nhan_vien.ho_ten, nhan_vien.email, 
        nhan_vien.trang_thai, nhan_vien.sdt, nhan_vien.ngay_sinh, nhan_vien.gioi_tinh FROM nhan_vien ${filter} 
        ORDER BY nhan_vien.ngay_tao DESC LIMIT :offset, :limit`,
        {
            replacements:{
                trang_thai: parseInt(req.query.trang_thai),
                search: `%${decodeURI(req.query.search)}%`,
                ngay_bat_dau: req.query.ngay_bat_dau,
                ngay_ket_thuc: req.query.ngay_ket_thuc,
                limit: parseInt(limit),
                offset: parseInt(offset)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        total: total[0].tong,
        data: staffs,
        message: null,
    });
};

//[GET] staff/:id
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
            if (decodedToken.userId === Number(req.params.id) || decodedToken.role === 2) {
                const staff = await sequelize.query(`
                SELECT nhan_vien.nhan_vien_id, nhan_vien.anh_dai_dien, nhan_vien.ho_ten, nhan_vien.email, nhan_vien.gioi_tinh, 
                nhan_vien.gioi_thieu, nhan_vien.trang_thai, nhan_vien.sdt, nhan_vien.ngay_sinh, nhan_vien.dia_chi FROM nhan_vien 
                WHERE nhan_vien.nhan_vien_id=${req.params.id}`,
                {type: sequelize.QueryTypes.SELECT});
                res.status(200).send({
                    status: 'success',
                    data: staff,
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

//[POST] staff/create
const postCreate = async (req, res) => {
    let staff = await Staff.findOne({
        where: {
            email: req.body.email,
        },
    });
    if (staff)
        res.status(404).send({
            status: 'fail',
            data: null,
            message: 'Email already exists',
        });
    else {
        const password =security.generatePassword();
        let role=await sequelize.query(`
            SELECT phan_quyen.* FROM phan_quyen WHERE phan_quyen.quyen_he_thong=${req.body.quyen_he_thong} AND 
            phan_quyen.quyen_nhan_su=${req.body.quyen_nhan_su} AND phan_quyen.quyen_kinh_doanh=${req.body.quyen_kinh_doanh} 
            AND phan_quyen.quyen_khao_thi=${req.body.quyen_khao_thi}`,
            {type: sequelize.QueryTypes.SELECT});
        if(!role[0]){
            role=await Role.create({
                quyen_he_thong: req.body.quyen_he_thong,
                quyen_nhan_su: req.body.quyen_nhan_su,
                quyen_kinh_doanh: req.body.quyen_kinh_doanh,
                quyen_khao_thi: req.body.quyen_khao_thi,
            })
            req.body.phan_quyen_id=role.dataValues.quyen_id;
        }else{
            req.body.phan_quyen_id=role[0].quyen_id;
        }
        delete req.body.quyen_he_thong;
        delete req.body.quyen_nhan_su;
        delete req.body.quyen_kinh_doanh;
        delete req.body.quyen_khao_thi;
        staff = await Staff.create({
            ...req.body,
            mat_khau: security.hashPassword(password),
            trang_thai: 1,
        });
        const content={gmail: req.body.email, password: password, ho_ten: req.body.ho_ten};
        await sendMail(content, 3);
        res.status(200).send({
            status: 'success',
            data: staff,
            message: null,
        });
    }
};

//[GET] staff/:id
const getUpdate = async (req, res) => {
    const staff = await Staff.findOne({
        where: {
            nhan_vien_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: staff,
        message: null,
    });
};

//[PUT] staff/:id
const putUpdate = async (req, res) => {
    let staff = await Staff.findOne({
        where: {
            email: req.body.email,
            nhan_vien_id: {
                [Op.ne]: req.params.id,
            },
        },
    });
    if (staff)
        res.send({
            status: 'fail',
            data: null,
            message: 'Email already exists',
        });
    else {
        staff = await Staff.findOne({
            where: {
                nhan_vien_id: req.params.id,
            },
        });
        if (
            req.file &&
            staff.anh_dai_dien &&
            fs.existsSync(`src/public${staff.anh_dai_dien}`)
        )
            fs.unlinkSync(`src/public${staff.anh_dai_dien}`);
        if (req.body.mat_khau)
            req.body.mat_khau = security.hashPassword(req.body.mat_khau);
        
        if (req.body.quyen_nhan_su && req.body.quyen_he_thong && req.body.quyen_khao_thi && req.body.quyen_kinh_doanh) {
            let role=await Role.findOne({
                where: {
                    quyen_nhan_su: req.body.quyen_nhan_su,
                    quyen_he_thong: req.body.quyen_he_thong,
                    quyen_khao_thi: req.body.quyen_khao_thi,
                    quyen_kinh_doanh: req.body.quyen_kinh_doanh
                }
            })
            if(!role){
                role=await Role.create({
                    quyen_he_thong: req.body.quyen_he_thong,
                    quyen_nhan_su: req.body.quyen_nhan_su,
                    quyen_kinh_doanh: req.body.quyen_kinh_doanh,
                    quyen_khao_thi: req.body.quyen_khao_thi
                })
                req.body.phan_quyen_id=role.quyen_id;
            }else{
                req.body.phan_quyen_id=role.quyen_id;
            }
            delete req.body.quyen_he_thong;
            delete req.body.quyen_nhan_su;
            delete req.body.quyen_kinh_doanh;
            delete req.body.quyen_khao_thi;
        }
        
        await Staff.update(
            {
                ...req.body,
            },
            {
                where: {
                    nhan_vien_id: req.params.id,
                },
            }
        );
        res.send({
            status: 'success',
            data: null,
            message: null,
        });
    }
};

//[DELETE] staff/:id
const stateChange = async (req, res) => {
    const staff = await Staff.findOne({
        where: {
            nhan_vien_id: req.params.id,
        },
    });
    if (staff.trang_thai != 1) {
        await Staff.update(
            {
                trang_thai: 1,
            },
            {
                where: {
                    nhan_vien_id: req.params.id,
                },
            }
        );
    } else if (staff.trang_thai != 0) {
        await Staff.update(
            {
                trang_thai: 0,
            },
            {
                where: {
                    nhan_vien_id: req.params.id,
                },
            }
        );
    }
    res.send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[DELETE] staff/:id/force
const forceDelete = async (req, res) => {
    const staff = await Staff.findOne({
        where: {
            nhan_vien_id: req.params.id,
        },
    });
    if (staff.anh_dai_dien && fs.existsSync(`src/public${staff.anh_dai_dien}`))
        fs.unlinkSync(`src/public${staff.anh_dai_dien}`);
    await Staff.destroy({
        where: {
            nhan_vien_id: req.params.id,
        },
    });
    res.send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    getAll,
    getById,
    postCreate,
    getUpdate,
    putUpdate,
    stateChange,
    forceDelete,
};
