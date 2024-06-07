const {
    DetailedInvoice,
    DetailedDiscount,
    Student,
    Invoice,
    CourseStudent,
} = require('../models');
const sendMail = require('../services/mail');
const sequelize = require('../utils/db');

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

const getAll = async (req, res) => {
    let offset = 0;
    let limit=100;
    if(req.query.offset){
        offset = req.query.offset;
    }
    if(req.query.limit){
        limit = req.query.limit;
    }
    const detailedInvoices = await sequelize.query(
        `
        SELECT hoa_don_chi_tiet.*, khoa_hoc.ten_khoa_hoc FROM hoa_don_chi_tiet JOIN khoa_hoc ON 
        hoa_don_chi_tiet.san_pham_id=khoa_hoc.khoa_hoc_id WHERE hoa_don_chi_tiet.loai_san_pham='Khóa học'
        ORDER BY hoa_don_chi_tiet.ngay_tao DESC LIMIT :offset, :limit`,
        { 
            replacements: {
                offset: parseInt(offset),
                limit: parseInt(limit)
            },
            type: sequelize.QueryTypes.SELECT 
        }
    );
    res.status(200).send({
        status: 'success',
        data: detailedInvoices,
        message: null,
    });
};

const getById = async (req, res) => {
    let detailedInvoice = await DetailedInvoice.findOne({
        where: {
            hoa_don_chi_tiet_id: req.params.id,
        },
        raw: true,
    });
    res.status(200).send({
        status: 'success',
        data: detailedInvoice,
        message: null,
    });
};

const getByTxnRef = async (req, res) => {
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
        SELECT hoa_don_chi_tiet.*, hoc_vien.ho_ten AS ten_nguoi_mua, hoc_vien.email, hoc_vien.hoc_vien_id, khoa_hoc.ten_khoa_hoc AS ten_san_pham, 
        ${req.params.TxnRef} AS hoa_don_ma FROM hoa_don_chi_tiet JOIN hoa_don ON hoa_don_chi_tiet.hoa_don_id=hoa_don.hoa_don_id 
        JOIN khoa_hoc ON hoa_don_chi_tiet.san_pham_id=khoa_hoc.khoa_hoc_id JOIN
        hoc_vien ON hoa_don.hoc_vien_id=hoc_vien.hoc_vien_id WHERE hoa_don.hoa_don_ma=${req.params.TxnRef}`,
        { type: sequelize.QueryTypes.SELECT }
    );
    if (detailedInvoice[0].chiet_khau_ma) {
        await DetailedDiscount.update(
            {
                trang_thai_su_dung: true,
            },
            {
                where: {
                    chiet_khau_ma: detailedInvoice[0].chiet_khau_ma,
                },
            }
        );
    };
    if (detailedInvoice[0].san_pham_id) {
        const courseStudent = await CourseStudent.findOne({
            where: {
                khoa_hoc_id: detailedInvoice[0].san_pham_id,
                hoc_vien_id: detailedInvoice[0].hoc_vien_id,
            },
        });
        if (courseStudent === null) {
            await CourseStudent.create({
                hoc_vien_id: detailedInvoice[0].hoc_vien_id,
                khoa_hoc_id: detailedInvoice[0].san_pham_id,
            })
        }
    };
    const content = {
        gmail: detailedInvoice[0].email,
        ho_ten: detailedInvoice[0].ten_nguoi_mua,
        ma_hoa_don: req.params.TxnRef,
        tong_tien: detailedInvoice[0].tong_tien,
        ngay: detailedInvoice[0].ngay_tao,
        ten_khoa_hoc: detailedInvoice[0].ten_san_pham,
    };
    await sendMail(content, 5);
    res.status(200).send({
        status: 'success',
        data: detailedInvoice[0],
        message: null,
    });
};

const getByUser = async (req, res) => {
    let filter;
    let trang_thai = '1';
    if (req.query.trang_thai) {
        trang_thai = `hoa_don.trang_thai=${req.query.trang_thai}`;
    }
    filter = ` WHERE ${trang_thai} AND hoc_vien.hoc_vien_id=${req.userId}`;
    let detailedInvoices = await sequelize.query(
        `
        SELECT hoa_don_chi_tiet.*, khoa_hoc.ten_khoa_hoc FROM hoa_don JOIN hoa_don_chi_tiet ON 
        hoa_don.hoa_don_id=hoa_don_chi_tiet.hoa_don_id JOIN hoc_vien ON hoa_don.hoc_vien_id=hoc_vien.hoc_vien_id 
        JOIN khoa_hoc ON hoa_don_chi_tiet.san_pham_id=khoa_hoc.khoa_hoc_id ${filter} ORDER BY hoa_don.ngay_lap DESC LIMIT 100`,
        { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).send({
        status: 'success',
        data: detailedInvoices,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const detailedInvoice = await DetailedInvoice.create({
        ...req.body,
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
    res.status(200).send({
        status: 'success',
        data: detailedInvoice,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    await DetailedInvoice.update(
        {
            ...req.body,
        },
        {
            where: {
                hoa_don_chi_tiet_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const deleteById = async (req, res) => {
    await DetailedInvoice.destroy({
        where: {
            hoa_don_chi_tiet_id: req.params.id,
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
    getByUser,
    getByTxnRef,
    postCreate,
    putUpdate,
    deleteById,
};
