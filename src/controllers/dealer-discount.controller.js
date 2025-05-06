const { DealerDiscount, DetailedDiscount } = require('../models');
const sequelize = require('../utils/db');

const findAll = async (req, res) => {
    let whereConditions = [];
    let replacements = {};

    if (req.query.khoa_hoc_id) {
        whereConditions.push('chiet_khau_dai_ly.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = parseInt(req.query.khoa_hoc_id);
    }
    if (req.query.ten_giao_vien) {
        whereConditions.push('giao_vien.ho_ten LIKE :ten_giao_vien');
        replacements.ten_giao_vien = `%${decodeURI(req.query.ten_giao_vien)}%`;
    }

    const pageSize = Number(req.query.pageSize || 10); // Mặc định 10 nếu không có pageSize
    const pageIndex = Number(req.query.pageIndex || 1); // Mặc định 1 nếu không có pageIndex
    const offset = (pageIndex - 1) * pageSize;

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const dealerDiscounts = await sequelize.query(
        `
            SELECT chiet_khau_dai_ly.chiet_khau_id, giao_vien.ho_ten, khoa_hoc.ten_khoa_hoc, 
                chiet_khau_dai_ly.chiet_khau_sv, chiet_khau_dai_ly.chiet_khau_gv, chiet_khau_dai_ly.ngay_tao 
            FROM giao_vien 
            JOIN chiet_khau_dai_ly ON giao_vien.giao_vien_id = chiet_khau_dai_ly.giao_vien_id 
            JOIN khoa_hoc ON chiet_khau_dai_ly.khoa_hoc_id = khoa_hoc.khoa_hoc_id 
            ${whereClause} 
            ORDER BY chiet_khau_dai_ly.ngay_tao DESC 
            LIMIT :limit OFFSET :offset
            `,
        {
            replacements: {
                ...replacements,
                limit: pageSize,
                offset: offset,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalResult = await sequelize.query(
        `
            SELECT COUNT(*) AS total 
            FROM giao_vien 
            JOIN chiet_khau_dai_ly ON giao_vien.giao_vien_id = chiet_khau_dai_ly.giao_vien_id 
            JOIN khoa_hoc ON chiet_khau_dai_ly.khoa_hoc_id = khoa_hoc.khoa_hoc_id 
            ${whereClause}
            `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = totalResult[0].total;
    const totalPage = Math.ceil(totalCount / pageSize);

    return res.status(200).send({
        status: 'success',
        data: dealerDiscounts,
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPage: totalPage,
        message: null,
    });
};

const getDealerByAdmin = async (req, res) => {
    let whereConditions = [];
    let replacements = {
        giao_vien_id: parseInt(req.params.id),
    };

    if (req.query.search) {
        whereConditions.push('chiet_khau_chi_tiet.chiet_khau_ma LIKE :search');
        replacements.search = `%${decodeURI(req.query.search)}%`;
    }
    if (req.query.ngay_bat_dau && req.query.ngay_ket_thuc) {
        whereConditions.push(
            'hoa_don.ngay_lap BETWEEN :ngay_bat_dau AND :ngay_ket_thuc'
        );
        replacements.ngay_bat_dau = req.query.ngay_bat_dau;
        replacements.ngay_ket_thuc = req.query.ngay_ket_thuc;
    }
    if (req.query.trang_thai) {
        whereConditions.push(
            'chiet_khau_chi_tiet.trang_thai_quyet_toan = :trang_thai'
        );
        replacements.trang_thai = parseInt(req.query.trang_thai);
    }

    let filter =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const pageSize = Number(req.query.pageSize || 10);
    const pageIndex = Number(req.query.pageIndex || 1);
    const offset = (pageIndex - 1) * pageSize;

    const disCounts = await sequelize.query(
        `
        SELECT giao_vien.ho_ten, khoa_hoc.ten_khoa_hoc,
            (mo_ta_khoa_hoc.gia_goc * chiet_khau_dai_ly.chiet_khau_gv) / 100 AS tien_chiet_khau, 
            chiet_khau_chi_tiet.*, hoa_don.ngay_lap 
        FROM chiet_khau_dai_ly 
        JOIN giao_vien ON chiet_khau_dai_ly.giao_vien_id = giao_vien.giao_vien_id 
        JOIN khoa_hoc ON khoa_hoc.khoa_hoc_id = chiet_khau_dai_ly.khoa_hoc_id 
        JOIN mo_ta_khoa_hoc ON mo_ta_khoa_hoc.khoa_hoc_id = khoa_hoc.khoa_hoc_id 
        JOIN chiet_khau_chi_tiet ON chiet_khau_dai_ly.chiet_khau_id = chiet_khau_chi_tiet.chiet_khau_id 
        LEFT JOIN hoa_don_chi_tiet ON hoa_don_chi_tiet.chiet_khau_ma = chiet_khau_chi_tiet.chiet_khau_ma 
        LEFT JOIN hoa_don ON hoa_don.hoa_don_id = hoa_don_chi_tiet.hoa_don_id 
        ${filter} 
        ORDER BY chiet_khau_chi_tiet.ngay_tao DESC 
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements: {
                ...replacements,
                limit: pageSize,
                offset: offset,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalResult = await sequelize.query(
        `
        SELECT COUNT(*) AS total 
        FROM chiet_khau_dai_ly 
        JOIN giao_vien ON chiet_khau_dai_ly.giao_vien_id = giao_vien.giao_vien_id 
        JOIN khoa_hoc ON chiet_khau_dai_ly.khoa_hoc_id = khoa_hoc.khoa_hoc_id 
        JOIN mo_ta_khoa_hoc ON mo_ta_khoa_hoc.khoa_hoc_id = khoa_hoc.khoa_hoc_id 
        JOIN chiet_khau_chi_tiet ON chiet_khau_dai_ly.chiet_khau_id = chiet_khau_chi_tiet.chiet_khau_id 
        LEFT JOIN hoa_don_chi_tiet ON hoa_don_chi_tiet.chiet_khau_ma = chiet_khau_chi_tiet.chiet_khau_ma 
        LEFT JOIN hoa_don ON hoa_don.hoa_don_id = hoa_don_chi_tiet.hoa_don_id 
        ${filter}
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = totalResult[0].total;
    const totalPage = Math.ceil(totalCount / pageSize);

    return res.status(200).send({
        status: 'success',
        data: disCounts,
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPage: totalPage,
        message: null,
    });
};

const findOne = async (req, res) => {
    let whereConditions = [`chiet_khau_dai_ly.chiet_khau_id = :chiet_khau_id`];

    if (req.query.trang_thai_su_dung) {
        whereConditions.push(
            'chiet_khau_chi_tiet.trang_thai_su_dung = :trang_thai_su_dung'
        );
    }
    if (req.query.khoa_hoc_id) {
        whereConditions.push('chiet_khau_dai_ly.khoa_hoc_id = :khoa_hoc_id');
    }
    if (req.query.ten_giao_vien) {
        whereConditions.push('giao_vien.ho_ten LIKE :ten_giao_vien');
    }

    const filter =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const replacements = {
        chiet_khau_id: parseInt(req.params.id),
        trang_thai_su_dung: req.query.trang_thai_su_dung
            ? parseInt(req.query.trang_thai_su_dung)
            : undefined,
        khoa_hoc_id: req.query.khoa_hoc_id
            ? parseInt(req.query.khoa_hoc_id)
            : undefined,
        ten_giao_vien: req.query.ten_giao_vien
            ? `%${decodeURI(req.query.ten_giao_vien)}%`
            : undefined,
    };

    const dealerDiscount = await sequelize.query(
        `
            SELECT chiet_khau_chi_tiet.*, chiet_khau_dai_ly.chiet_khau_sv, giao_vien.ho_ten, 
                khoa_hoc.ten_khoa_hoc 
            FROM khoa_hoc 
            JOIN chiet_khau_dai_ly ON khoa_hoc.khoa_hoc_id = chiet_khau_dai_ly.khoa_hoc_id 
            JOIN giao_vien ON giao_vien.giao_vien_id = chiet_khau_dai_ly.giao_vien_id 
            JOIN chiet_khau_chi_tiet ON chiet_khau_chi_tiet.chiet_khau_id = chiet_khau_dai_ly.chiet_khau_id 
            ${filter}`,
        {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: dealerDiscount,
        message: null,
    });
};

const findOnev2 = async (req, res) => {
    const pageSize = Number(req.query.pageSize || 10); // Mặc định 10 nếu không có pageSize
    const pageIndex = Number(req.query.pageIndex || 1); // Mặc định 1 nếu không có pageIndex
    const offset = (pageIndex - 1) * pageSize;

    let whereConditions = [`chiet_khau_dai_ly.chiet_khau_id = :chiet_khau_id`];
    let replacements = { chiet_khau_id: req.params.id };

    if (req.query.khoa_hoc_id) {
        whereConditions.push('chiet_khau_dai_ly.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = req.query.khoa_hoc_id;
    }

    const filter =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const dealerDiscount = await sequelize.query(
        `
            SELECT chiet_khau_dai_ly.*, khoa_hoc.khoa_hoc_id
            FROM chiet_khau_dai_ly
            LEFT JOIN khoa_hoc ON chiet_khau_dai_ly.khoa_hoc_id = khoa_hoc.khoa_hoc_id
            ${filter}
            LIMIT :limit OFFSET :offset
            `,
        {
            replacements: {
                ...replacements,
                limit: pageSize,
                offset: offset,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: dealerDiscount[0] || null, // Trả về phần tử đầu tiên hoặc null nếu không có kết quả
        message: null,
    });
};

const create = async (req, res) => {
    const dealerDiscount = await DealerDiscount.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: dealerDiscount,
        message: null,
    });
};

const update = async (req, res) => {
    await DealerDiscount.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                chiet_khau_id: req.params.id,
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
    const dealerDiscount = await DealerDiscount.findOne({
        where: {
            chiet_khau_id: req.params.id,
        },
        raw: true,
    });

    if (dealerDiscount) {
        const newTrangThai = !dealerDiscount.trang_thai; // Đảo ngược trạng thái trang_thai
        await DealerDiscount.update(
            { trang_thai: newTrangThai, nguoi_sua: req.userId },
            {
                where: {
                    chiet_khau_id: req.params.id,
                },
            }
        );

        return res.status(200).send({
            status: 'success',
            data: null,
            message: null,
        });
    } else {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'Dealer discount not found.',
        });
    }
};

const remove = async (req, res) => {
    await DetailedDiscount.destroy({
        where: {
            chiet_khau_id: req.params.id,
        },
    });
    await DealerDiscount.destroy({
        where: {
            chiet_khau_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

module.exports = {
    getDealerByAdmin,
    findAll,
    findOne,
    create,
    update,
    remove,
    stateChange,
    findOnev2,
};
