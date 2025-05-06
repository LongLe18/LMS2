const {
    DetailedInvoice,
    DetailedDiscount,
    Student,
    Invoice,
    CourseStudent,
} = require('../models');
const sendMail = require('../services/mail.service');
const sequelize = require('../utils/db');

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

const findAll = async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const pageIndex = Number(req.query.pageIndex) || 1;
    const offset = (pageIndex - 1) * pageSize;

    const detailedInvoices = await sequelize.query(
        `
        SELECT 
            hoa_don_chi_tiet.*, 
            khoa_hoc.ten_khoa_hoc 
        FROM 
            hoa_don_chi_tiet 
        JOIN 
            khoa_hoc ON hoa_don_chi_tiet.san_pham_id = khoa_hoc.khoa_hoc_id 
        WHERE 
            hoa_don_chi_tiet.loai_san_pham = 'Khóa học'
        ORDER BY 
            hoa_don_chi_tiet.ngay_tao DESC 
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements: { limit: pageSize, offset: offset },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalResult = await sequelize.query(
        `
        SELECT COUNT(*) AS total
        FROM 
            hoa_don_chi_tiet 
        JOIN 
            khoa_hoc ON hoa_don_chi_tiet.san_pham_id = khoa_hoc.khoa_hoc_id 
        WHERE 
            hoa_don_chi_tiet.loai_san_pham = 'Khóa học'
        `,
        {
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = totalResult[0].total;
    const totalPage = Math.ceil(totalCount / pageSize);

    return res.status(200).send({
        status: 'success',
        data: detailedInvoices,
        pageIndex,
        pageSize,
        totalCount,
        totalPage,
        message: null,
    });
};

const findOne = async (req, res) => {
    const detailedInvoice = await DetailedInvoice.findOne({
        where: {
            hoa_don_chi_tiet_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: detailedInvoice,
        message: null,
    });
};

const getByTxnRef = async (req, res) => {
    let replacements = {
        hoa_don_ma: req.params.TxnRef,
    };

    await Invoice.update(
        {
            trang_thai: true,
            ngay_lap: Date.now(),
        },
        {
            where: {
                hoa_don_ma: req.params.TxnRef,
            },
        }
    );

    const detailedInvoice = await sequelize.query(
        `
            SELECT hoa_don_chi_tiet.*, hoc_vien.ho_ten AS ten_nguoi_mua, hoc_vien.email, hoc_vien.hoc_vien_id, 
                khoa_hoc.ten_khoa_hoc AS ten_san_pham, ${req.params.TxnRef} AS hoa_don_ma 
            FROM hoa_don_chi_tiet 
            JOIN hoa_don ON hoa_don_chi_tiet.hoa_don_id = hoa_don.hoa_don_id 
            JOIN khoa_hoc ON hoa_don_chi_tiet.san_pham_id = khoa_hoc.khoa_hoc_id 
            JOIN hoc_vien ON hoa_don.hoc_vien_id = hoc_vien.hoc_vien_id 
            WHERE hoa_don.hoa_don_ma = :hoa_don_ma`,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    if (detailedInvoice.length > 0) {
        const invoiceDetails = detailedInvoice[0];

        if (invoiceDetails.chiet_khau_ma) {
            await DetailedDiscount.update(
                {
                    trang_thai_su_dung: true,
                },
                {
                    where: {
                        chiet_khau_ma: invoiceDetails.chiet_khau_ma,
                    },
                }
            );
        }
        if (invoiceDetails.san_pham_id) {
            const courseStudent = await CourseStudent.findOne({
                where: {
                    khoa_hoc_id: invoiceDetails.san_pham_id,
                    hoc_vien_id: invoiceDetails.hoc_vien_id,
                },
            });
            if (courseStudent === null) {
                await CourseStudent.create({
                    hoc_vien_id: invoiceDetails.hoc_vien_id,
                    khoa_hoc_id: invoiceDetails.san_pham_id,
                });
            }
        }

        const content = {
            gmail: invoiceDetails.email,
            ho_ten: invoiceDetails.ten_nguoi_mua,
            ma_hoa_don: req.params.TxnRef,
            tong_tien: invoiceDetails.tong_tien,
            ngay: invoiceDetails.ngay_tao,
            ten_khoa_hoc: invoiceDetails.ten_san_pham,
        };
        await sendMail(content, 5);

        return res.status(200).send({
            status: 'success',
            data: invoiceDetails,
            message: null,
        });
    } else {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'Invoice not found.',
        });
    }
};

const getByUser = async (req, res) => {
    let whereConditions = [];
    let replacements = {
        hoc_vien_id: req.userId, // Mặc định theo userId
    };

    if (req.query.trang_thai) {
        whereConditions.push('hoa_don.trang_thai = :trang_thai');
        replacements.trang_thai = req.query.trang_thai;
    }

    const pageSize = Number(req.query.pageSize || 10); // Mặc định 10 nếu không có pageSize
    const pageIndex = Number(req.query.pageIndex || 1); // Mặc định 1 nếu không có pageIndex
    const offset = (pageIndex - 1) * pageSize;

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    let detailedInvoices = await sequelize.query(
        `
        SELECT hoa_don_chi_tiet.*, khoa_hoc.ten_khoa_hoc 
        FROM hoa_don 
        JOIN hoa_don_chi_tiet ON hoa_don.hoa_don_id = hoa_don_chi_tiet.hoa_don_id 
        JOIN hoc_vien ON hoa_don.hoc_vien_id = hoc_vien.hoc_vien_id 
        JOIN khoa_hoc ON hoa_don_chi_tiet.san_pham_id = khoa_hoc.khoa_hoc_id 
        ${whereClause} 
        ORDER BY hoa_don.ngay_lap DESC 
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

    const totalResult = await sequelize.query(
        `
        SELECT COUNT(*) AS total 
        FROM hoa_don 
        JOIN hoa_don_chi_tiet ON hoa_don.hoa_don_id = hoa_don_chi_tiet.hoa_don_id 
        JOIN hoc_vien ON hoa_don.hoc_vien_id = hoc_vien.hoc_vien_id 
        JOIN khoa_hoc ON hoa_don_chi_tiet.san_pham_id = khoa_hoc.khoa_hoc_id 
        ${whereClause}`,
        {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = totalResult[0].total;
    const totalPage = Math.ceil(totalCount / pageSize);

    return res.status(200).send({
        status: 'success',
        data: detailedInvoices,
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPage: totalPage,
        message: null,
    });
};

const create = async (req, res) => {
    const detailedInvoice = await DetailedInvoice.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    if (req.body.chiet_khau_ma) {
        await DetailedDiscount.update(
            {
                trang_thai: 2,
            },
            {
                where: {
                    chiet_khau_ma: req.body.chiet_khau_ma,
                },
            }
        );
    }
    const student = await Student.findOne({
        where: {
            hoc_vien_id: req.userId,
        },
        raw: true,
    });

    var date = new Date();
    const content = {
        gmail: student.email,
        tong_tien: detailedInvoice.tong_tien,
        date: date.addDays(2),
    };
    //await sendMail(content, 4);

    return res.status(200).send({
        status: 'success',
        data: detailedInvoice,
        message: null,
    });
};

const update = async (req, res) => {
    await DetailedInvoice.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                hoa_don_chi_tiet_id: req.params.id,
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
    await DetailedInvoice.destroy({
        where: {
            hoa_don_chi_tiet_id: req.params.id,
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
    getByUser,
    getByTxnRef,
    create,
    update,
    remove,
};
