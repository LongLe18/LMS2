const { Op } = require('sequelize');

const { DiscountCode } = require('../models');
const sequelize = require('../utils/db');

const findAll = async (req, res) => {
    let whereConditions = [];
    let replacements = {};

    if (req.query.khoa_hoc_id) {
        whereConditions.push('ma_giam_gia.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = parseInt(req.query.khoa_hoc_id);
    }
    if (req.query.trang_thai) {
        whereConditions.push('ma_giam_gia.trang_thai = :trang_thai');
        replacements.trang_thai = parseInt(req.query.trang_thai);
    }

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const pageSize = Number(req.query.pageSize || 10); // Mặc định 100 nếu không truyền
    const pageIndex = Number(req.query.pageIndex || 1); // Mặc định 1 nếu không truyền
    const offset = (pageIndex - 1) * pageSize;
    replacements.limit = pageSize;
    replacements.offset = offset;

    const discountCodes = await sequelize.query(
        `
        SELECT ma_giam_gia.*, khoa_hoc.ten_khoa_hoc 
        FROM ma_giam_gia 
        JOIN khoa_hoc ON ma_giam_gia.khoa_hoc_id = khoa_hoc.khoa_hoc_id 
        ${whereClause} 
        ORDER BY ma_giam_gia.ngay_tao DESC 
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalResult = await sequelize.query(
        `
        SELECT COUNT(*) AS total 
        FROM ma_giam_gia 
        JOIN khoa_hoc ON ma_giam_gia.khoa_hoc_id = khoa_hoc.khoa_hoc_id 
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
        data: discountCodes,
        pageIndex,
        pageSize,
        totalCount,
        totalPage,
        message: null,
    });
};

const findOne = async (req, res) => {
    const discountCode = await DiscountCode.findOne({
        where: {
            giam_gia_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: discountCode,
        message: null,
    });
};

const create = async (req, res) => {
    const discountCode = await DiscountCode.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: discountCode,
        message: null,
    });
};

const update = async (req, res) => {
    await DiscountCode.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                giam_gia_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const getByCourse = async (req, res) => {
    const discountCode = await DiscountCode.findOne({
        where: {
            khoa_hoc_id: req.params.id,
            trang_thai: true,
            ngay_bat_dau: {
                [Op.lte]: Date.now(),
            },
            ngay_ket_thuc: {
                [Op.gte]: Date.now(),
            },
        },
        order: [['muc_giam_gia', 'DESC']],
    });

    return res.status(200).send({
        status: 'success',
        data: discountCode ?? 0,
        message: null,
    });
};

const stateChange = async (req, res) => {
    const discountCode = await DiscountCode.findOne({
        where: { giam_gia_id: req.params.id },
        raw: true,
    });

    if (!discountCode) {
        return res.status(404).send({
            status: 'error',
            message: 'Discount code not found',
        });
    }

    await DiscountCode.update(
        { trang_thai: !discountCode.trang_thai }, // Đảo ngược trạng thái
        { where: { giam_gia_id: req.params.id } } // Đúng key
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'Updated discount code status successfully',
    });
};

const remove = async (req, res) => {
    await DiscountCode.destroy({
        where: {
            giam_gia_id: req.params.id,
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
    getByCourse,
    update,
    stateChange,
    remove,
};
