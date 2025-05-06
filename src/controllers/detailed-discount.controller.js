const { DetailedDiscount, DealerDiscount } = require('../models');
const sequelize = require('../utils/db');
const { makeid } = require('../utils/security');

const getDetailByUser = async (req, res) => {
    let whereConditions = [];
    let replacements = {
        giao_vien_id: req.userId, // Mặc định theo userId
    };

    if (req.query.trang_thai_su_dung) {
        whereConditions.push(
            'chiet_khau_chi_tiet.trang_thai_su_dung = :trang_thai_su_dung'
        );
        replacements.trang_thai_su_dung = parseInt(
            req.query.trang_thai_su_dung
        );
    }
    if (req.query.trang_thai_quyet_toan) {
        whereConditions.push(
            'chiet_khau_chi_tiet.trang_thai_quyet_toan = :trang_thai_quyet_toan'
        );
        replacements.trang_thai_quyet_toan = parseInt(
            req.query.trang_thai_quyet_toan
        );
    }
    if (req.query.khoa_hoc_id) {
        whereConditions.push('khoa_hoc.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = parseInt(req.query.khoa_hoc_id);
    }

    let filter =
        whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

    const pageIndex = parseInt(req.query.pageIndex) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (pageIndex - 1) * pageSize;

    const disCounts = await sequelize.query(
        `
            SELECT khoa_hoc.ten_khoa_hoc, chiet_khau_dai_ly.chiet_khau_gv, chiet_khau_chi_tiet.*, mo_ta_khoa_hoc.gia_goc,
            (mo_ta_khoa_hoc.gia_goc * chiet_khau_dai_ly.chiet_khau_gv) / 100 AS thuc_linh 
            FROM khoa_hoc 
            JOIN chiet_khau_dai_ly ON chiet_khau_dai_ly.khoa_hoc_id = khoa_hoc.khoa_hoc_id 
            JOIN chiet_khau_chi_tiet ON chiet_khau_chi_tiet.chiet_khau_id = chiet_khau_dai_ly.chiet_khau_id 
            JOIN mo_ta_khoa_hoc ON mo_ta_khoa_hoc.khoa_hoc_id = khoa_hoc.khoa_hoc_id 
            ${filter} 
            LIMIT :limit OFFSET :offset`,
        {
            replacements: {
                ...replacements,
                limit: pageSize,
                offset: offset,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCountResult = await sequelize.query(
        `
            SELECT COUNT(*) AS total 
            FROM khoa_hoc 
            JOIN chiet_khau_dai_ly ON chiet_khau_dai_ly.khoa_hoc_id = khoa_hoc.khoa_hoc_id 
            JOIN chiet_khau_chi_tiet ON chiet_khau_chi_tiet.chiet_khau_id = chiet_khau_dai_ly.chiet_khau_id 
            JOIN mo_ta_khoa_hoc ON mo_ta_khoa_hoc.khoa_hoc_id = khoa_hoc.khoa_hoc_id 
            ${filter}`,
        {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = totalCountResult[0].total;
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

const findAll = async (req, res) => {
    const { count, rows } = await DetailedDiscount.findAndCountAll({
        where: {
            ...(req.query.trang_thai_su_dung && {
                trang_thai_su_dung: parseInt(req.query.trang_thai_su_dung),
            }),
            ...(req.query.chiet_khau_id && {
                chiet_khau_id: parseInt(req.query.chiet_khau_id),
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
    const detailedDiscount = await DetailedDiscount.findOne({
        where: {
            chiet_khau_chi_tiet_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: detailedDiscount,
        message: null,
    });
};

const checkCode = async (req, res) => {
    let dealerDiscount;
    if (req.query.chiet_khau_ma) {
        let detailedDiscount = await sequelize.query(
            `
                SELECT chiet_khau_chi_tiet.*, chiet_khau_dai_ly.khoa_hoc_id 
                FROM chiet_khau_dai_ly 
                JOIN chiet_khau_chi_tiet ON chiet_khau_dai_ly.chiet_khau_id = chiet_khau_chi_tiet.chiet_khau_id 
                WHERE chiet_khau_chi_tiet.chiet_khau_ma = :chiet_khau_ma`,
            {
                replacements: {
                    chiet_khau_ma: decodeURI(req.query.chiet_khau_ma),
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!detailedDiscount || detailedDiscount.length === 0) {
            return res.status(404).send({
                status: 'error',
                data: null,
                message: 'Code does not exist',
            });
        }

        detailedDiscount = detailedDiscount[0]; // Lấy chi tiết giảm giá đầu tiên

        if (detailedDiscount.khoa_hoc_id != req.query.khoa_hoc_id) {
            return res.status(404).send({
                status: 'error',
                data: null,
                message: 'Code does not exist',
            });
        }
        if (detailedDiscount.trang_thai_su_dung === 1) {
            return res.status(404).send({
                status: 'error',
                data: null,
                message: 'Used code',
            });
        } else if (detailedDiscount.trang_thai_su_dung === 2) {
            return res.status(404).send({
                status: 'error',
                data: null,
                message: 'Code stopped using',
            });
        }

        dealerDiscount = await sequelize.query(
            `SELECT chiet_khau_dai_ly.chiet_khau_sv, chiet_khau_chi_tiet.chiet_khau_chi_tiet_id 
                FROM chiet_khau_dai_ly 
                JOIN chiet_khau_chi_tiet ON chiet_khau_dai_ly.chiet_khau_id = chiet_khau_chi_tiet.chiet_khau_id 
                WHERE chiet_khau_chi_tiet.chiet_khau_ma = :chiet_khau_ma`,
            {
                replacements: {
                    chiet_khau_ma: req.query.chiet_khau_ma,
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        return res.status(200).send({
            status: 'success',
            data: dealerDiscount[0] ?? 0, // Trả về 0 nếu không có kết quả
            message: null,
        });
    }

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const create = async (req, res) => {
    const dealerDiscount = await DealerDiscount.findOne({
        where: {
            chiet_khau_id: req.body.chiet_khau_id,
        },
        raw: true,
    });
    
    if (!dealerDiscount) {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'Dealer discount not found',
        });
    }
    
    let detailedDiscounts = [];
    for (let i = 0; i < dealerDiscount.so_luong; i++) {
        const chiet_khau_ma = `${makeid(4)}-${makeid(4)}-${makeid(4)}`;
        detailedDiscounts.push({
            chiet_khau_id: req.body.chiet_khau_id,
            chiet_khau_ma: chiet_khau_ma,
        });
    }
    
    // Bulk create the detailed discounts
    await DetailedDiscount.bulkCreate(detailedDiscounts);
    
    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
    
};

const update = async (req, res) => {
    await DetailedDiscount.update(
        {
            ...req.body,
            nguoi_sua: req.userId
        },
        {
            where: {
                chiet_khau_chi_tiet_id: req.params.id,
            },
        }
    );
    
    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const changeState = async (req, res) => {
    if (!req.body.gia_tri || !Array.isArray(req.body.gia_tri) || req.body.gia_tri.length === 0) {
        return res.status(400).send({
            status: 'error',
            data: null,
            message: 'Invalid or empty "gia_tri" array',
        });
    }
    
    const giaTriArray = req.body.gia_tri;
    
    await sequelize.query(
        `
            UPDATE chiet_khau_chi_tiet 
            SET trang_thai_quyet_toan = 1 
            WHERE chiet_khau_chi_tiet_id IN (:gia_tri) 
            AND trang_thai_su_dung = 1`,
        {
            replacements: {
                gia_tri: giaTriArray,
            },
            type: sequelize.QueryTypes.UPDATE,
        }
    );
    
    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'Update successful',
    });    
};

const remove = async (req, res) => {
    await DetailedDiscount.destroy({
        where: {
            chiet_khau_chi_tiet_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const deleteList = async (req, res) => {
    if (!req.body.gia_tri || !Array.isArray(req.body.gia_tri) || req.body.gia_tri.length === 0) {
        return res.status(400).send({
            status: 'error',
            data: null,
            message: 'Invalid or empty "gia_tri" array',
        });
    }
    
    const giaTriArray = req.body.gia_tri;
    
    await sequelize.query(
        `
        DELETE FROM chiet_khau_chi_tiet 
        WHERE chiet_khau_chi_tiet_id IN (:gia_tri)`,
        {
            replacements: {
                gia_tri: giaTriArray,
            },
            type: sequelize.QueryTypes.DELETE,
        }
    );
    
    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'Delete successful',
    });    
};

module.exports = {
    findAll,
    findOne,
    getDetailByUser,
    checkCode,
    create,
    update,
    remove,
    changeState,
    deleteList,
};
