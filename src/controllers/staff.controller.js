const { Op } = require('sequelize');
const fs = require('fs');

const { Staff, Role } = require('../models');
const security = require('../utils/security');
const sendMail = require('../services/mail.service');
const sequelize = require('../utils/db');

const findAll = async (req, res) => {
    const { count, rows } = await Staff.findAndCountAll({
        include: [],
        where: {
            ...(req.query.search && {
                [Op.or]: [{ ho_ten: { [Op.like]: `%${req.query.search}%` } }],
            }),
            ...(req.query.ngay_bat_dau &&
                req.query.ngay_ket_thuc && {
                    ngay_tao: {
                        [Op.gte]: req.query.ngay_bat_dau,
                    },
                    ngay_tao: {
                        [Op.lte]: req.query.ngay_ket_thuc,
                    },
                }),
            ...(req.query.trang_thai && { trang_thai: req.query.trang_thai }),
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
    const sanitizedRows = rows.map((staff) => {
        const { mat_khau, ...rest } = staff.toJSON(); // đảm bảo là plain object
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
    if (req.userId === Number(req.params.id) || req.role === 2) {
        const staff = await sequelize.query(
            `
            SELECT nhan_vien.nhan_vien_id, nhan_vien.anh_dai_dien, nhan_vien.ho_ten, nhan_vien.email, nhan_vien.gioi_tinh, 
            nhan_vien.gioi_thieu, nhan_vien.trang_thai, nhan_vien.sdt, nhan_vien.ngay_sinh, nhan_vien.dia_chi 
            FROM nhan_vien 
            WHERE nhan_vien.nhan_vien_id = :id
            `,
            {
                replacements: { id: req.params.id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        return res.status(200).send({
            status: 'success',
            data: staff,
            message: null,
        });
    } else {
        return res.status(401).send({
            status: 'error',
            data: null,
            message: 'Bạn không có quyền đọc thông tin người dùng này',
        });
    }
};

const create = async (req, res) => {
    const staffExist = await Staff.findOne({
        where: {
            email: req.body.email,
        },
    });
    if (staffExist) {
        return res.status(409).send({
            status: 'fail',
            data: null,
            message: 'Email already exists',
        });
    }

    const password = security.generatePassword();
    const hashedPassword = security.hashPassword(password);

    let role = await sequelize.query(
        `
        SELECT phan_quyen.* 
        FROM phan_quyen 
        WHERE 
            quyen_he_thong = :quyen_he_thong AND 
            quyen_nhan_su = :quyen_nhan_su AND 
            quyen_kinh_doanh = :quyen_kinh_doanh AND 
            quyen_khao_thi = :quyen_khao_thi
        `,
        {
            replacements: {
                quyen_he_thong: req.body.quyen_he_thong,
                quyen_nhan_su: req.body.quyen_nhan_su,
                quyen_kinh_doanh: req.body.quyen_kinh_doanh,
                quyen_khao_thi: req.body.quyen_khao_thi,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    if (!role[0]) {
        const newRole = await Role.create({
            quyen_he_thong: req.body.quyen_he_thong,
            quyen_nhan_su: req.body.quyen_nhan_su,
            quyen_kinh_doanh: req.body.quyen_kinh_doanh,
            quyen_khao_thi: req.body.quyen_khao_thi,
        });
        req.body.phan_quyen_id = newRole.quyen_id;
    } else {
        req.body.phan_quyen_id = role[0].quyen_id;
    }

    delete req.body.quyen_he_thong;
    delete req.body.quyen_nhan_su;
    delete req.body.quyen_kinh_doanh;
    delete req.body.quyen_khao_thi;

    const staff = await Staff.create({
        ...req.body,
        mat_khau: hashedPassword,
        trang_thai: 1,
    });

    await sendMail(
        {
            gmail: req.body.email,
            password: password,
            ho_ten: req.body.ho_ten,
        },
        3
    );

    return res.status(200).send({
        status: 'success',
        data: staff,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const staff = await Staff.findOne({
        where: {
            nhan_vien_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: staff,
        message: null,
    });
};

const update = async (req, res) => {
    const existingStaff = await Staff.findOne({
        where: {
            email: req.body.email,
            nhan_vien_id: {
                [Op.ne]: req.params.id,
            },
        },
    });
    if (existingStaff) {
        return res.status(409).send({
            status: 'fail',
            data: null,
            message: 'Email already exists',
        });
    }

    const staff = await Staff.findOne({
        where: {
            nhan_vien_id: req.params.id,
        },
    });

    if (
        req.file &&
        staff?.anh_dai_dien &&
        fs.existsSync(`public${staff.anh_dai_dien}`)
    ) {
        fs.unlinkSync(`public${staff.anh_dai_dien}`);
    }

    if (req.body.mat_khau) {
        req.body.mat_khau = security.hashPassword(req.body.mat_khau);
    }

    const { quyen_he_thong, quyen_nhan_su, quyen_kinh_doanh, quyen_khao_thi } =
        req.body;
    if (
        typeof quyen_he_thong !== 'undefined' &&
        typeof quyen_nhan_su !== 'undefined' &&
        typeof quyen_kinh_doanh !== 'undefined' &&
        typeof quyen_khao_thi !== 'undefined'
    ) {
        let role = await Role.findOne({
            where: {
                quyen_he_thong,
                quyen_nhan_su,
                quyen_kinh_doanh,
                quyen_khao_thi,
            },
        });

        if (!role) {
            role = await Role.create({
                quyen_he_thong,
                quyen_nhan_su,
                quyen_kinh_doanh,
                quyen_khao_thi,
            });
        }

        req.body.phan_quyen_id = role.quyen_id;

        delete req.body.quyen_he_thong;
        delete req.body.quyen_nhan_su;
        delete req.body.quyen_kinh_doanh;
        delete req.body.quyen_khao_thi;
    }

    await Staff.update(req.body, {
        where: {
            nhan_vien_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const stateChange = async (req, res) => {
    const staff = await Staff.findOne({
        where: {
            nhan_vien_id: req.params.id,
        },
    });

    if (!staff) {
        return res.status(404).send({
            status: 'fail',
            data: null,
            message: 'Staff not found',
        });
    }

    const newStatus = staff.trang_thai === 1 ? 0 : 1;

    await Staff.update(
        { trang_thai: newStatus },
        {
            where: {
                nhan_vien_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: `Staff status updated to ${newStatus}`,
    });
};

const remove = async (req, res) => {
    const staff = await Staff.findOne({
        where: {
            nhan_vien_id: req.params.id,
        },
    });

    if (!staff) {
        return res.status(404).send({
            status: 'fail',
            data: null,
            message: 'Staff not found',
        });
    }

    if (staff.anh_dai_dien && fs.existsSync(`public${staff.anh_dai_dien}`)) {
        fs.unlinkSync(`public${staff.anh_dai_dien}`);
    }

    await Staff.destroy({
        where: {
            nhan_vien_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'Staff deleted successfully',
    });
};

module.exports = {
    findAll,
    findOne,
    create,
    getUpdate,
    update,
    stateChange,
    remove,
};
