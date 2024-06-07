const { Invoice, Student, CourseStudent, DetailedInvoice, Course, DetailedDiscount } = require('../models');
const sequelize = require('../utils/db');
const sendMail = require('../services/mail');
const {Op}=require('sequelize');
const security = require('../utils/security');

const getAll = async (req, res) => {
    let search = 1;
    let ngay_tao=1;
    let trang_thai=1;
    let nhan_vien_id = 1;
    let offset = 0;
    let limit =100;
    if(req.query.offset){
        offset=req.query.offset;
    }
    if(req.query.limit){
        limit=req.query.limit;
    }
    if (req.query.trang_thai) {
        trang_thai = `hoa_don.trang_thai=:trang_thai`;
    }
    if (req.query.nhan_vien_id) {
        nhan_vien_id = `hoa_don.nhan_vien_id=:nhan_vien_id`;
    }
    if (req.query.search) {
        search = 'hoc_vien.hoc_vien LIKE :search';
    }
    if (req.query.ngay_bat_dau&&req.query.ngay_ket_thuc) {
        ngay_tao='ngay_tao BETWEEN :ngay_bat_dau AND :ngay_ket_thuc'
    }
    let filter=`WHERE ${search} AND ${ngay_tao} AND ${nhan_vien_id} AND ${trang_thai}`;
    const count =await Invoice.count();

    if (req.role === 2) {
        let invoices =await sequelize.query(`
            SELECT hoa_don.*, hoc_vien.ho_ten AS ten_hoc_vien, hoc_vien.email, 
            hoc_vien.sdt AS so_dien_thoai, nhan_vien.ho_ten AS ten_nhan_vien,
            hoa_don_chi_tiet.tong_tien FROM hoa_don LEFT JOIN hoa_don_chi_tiet
            ON hoa_don_chi_tiet.hoa_don_id=hoa_don.hoa_don_id LEFT JOIN hoc_vien 
            ON hoa_don.hoc_vien_id=hoc_vien.hoc_vien_id LEFT JOIN nhan_vien ON 
            hoa_don.nhan_vien_id=nhan_vien.nhan_vien_id ${filter}
            ORDER BY hoa_don.trang_thai ASC, hoa_don.ngay_tao DESC LIMIT :offset, :limit`,
            {
                replacements: {
                    trang_thai: parseInt(req.query.trang_thai),
                    nhan_vien_id: parseInt(req.query.nhan_vien_id),
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
            data: invoices,
            count: count,
            message: null,
        });
    } else if (req.role === 0) {
        let filter = `WHERE ${search} AND ${ngay_tao} AND ${nhan_vien_id} AND ${trang_thai} ` + 'AND hoa_don.hoc_vien_id=' + req.userId;
        let invoices =await sequelize.query(`
            SELECT hoa_don.*, hoc_vien.ho_ten AS ten_hoc_vien, hoc_vien.email, 
            hoc_vien.sdt AS so_dien_thoai, nhan_vien.ho_ten AS ten_nhan_vien,
            hoa_don_chi_tiet.tong_tien FROM hoa_don LEFT JOIN hoa_don_chi_tiet
            ON hoa_don_chi_tiet.hoa_don_id=hoa_don.hoa_don_id LEFT JOIN hoc_vien 
            ON hoa_don.hoc_vien_id=hoc_vien.hoc_vien_id LEFT JOIN nhan_vien ON 
            hoa_don.nhan_vien_id=nhan_vien.nhan_vien_id ${filter}
            ORDER BY hoa_don.trang_thai ASC, hoa_don.ngay_tao DESC LIMIT :offset, :limit`,
            {
                replacements: {
                    trang_thai: parseInt(req.query.trang_thai),
                    nhan_vien_id: parseInt(req.query.nhan_vien_id),
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
            data: invoices,
            count: count,
            message: null,
        });
    }
    else {
        res.status(401).send({
            status: 'success',
            data: null,
            message: 'Bạn không có quyền đọc thông tin này',
        });
    }
};

const getById = async (req, res) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            res.status(401).send({
                status: 'success',
                data: null,
                message: 'Bạn không có quyền đọc thông tin này',
            });
        } else {
            const decodedToken = security.verifyToken(token);
            if (decodedToken.role === 2) {
                const invoice = await sequelize.query(
                    `SELECT hoc_vien.ho_ten AS ten_hoc_vien, hoc_vien.email, hoc_vien.sdt, 
                    khoa_hoc.ten_khoa_hoc, nhan_vien.ho_ten AS ten_nhan_vien, hoa_don.hoa_don_ma, 
                    hoa_don_chi_tiet.* FROM hoc_vien JOIN hoa_don ON hoc_vien.hoc_vien_id=hoa_don.hoc_vien_id 
                    JOIN hoa_don_chi_tiet ON hoa_don.hoa_don_id=hoa_don_chi_tiet.hoa_don_id JOIN 
                    khoa_hoc ON hoa_don_chi_tiet.san_pham_id=khoa_hoc.khoa_hoc_id
                    LEFT JOIN nhan_vien ON nhan_vien.nhan_vien_id=hoa_don.nhan_vien_id 
                    WHERE hoa_don.hoa_don_id=${req.params.id} AND hoa_don_chi_tiet.loai_san_pham='Khóa học'`,
                    { type: sequelize.QueryTypes.SELECT }
                );
                res.status(200).send({
                    status: 'success',
                    data: invoice,
                    message: null,
                });
            } else if (decodedToken.role === 0) {
                const invoice = await sequelize.query(
                    `SELECT hoc_vien.ho_ten AS ten_hoc_vien, hoc_vien.email, hoc_vien.sdt, 
                    khoa_hoc.ten_khoa_hoc, nhan_vien.ho_ten AS ten_nhan_vien, hoa_don.hoa_don_ma, 
                    hoa_don_chi_tiet.* FROM hoc_vien JOIN hoa_don ON hoc_vien.hoc_vien_id=hoa_don.hoc_vien_id 
                    JOIN hoa_don_chi_tiet ON hoa_don.hoa_don_id=hoa_don_chi_tiet.hoa_don_id JOIN 
                    khoa_hoc ON hoa_don_chi_tiet.san_pham_id=khoa_hoc.khoa_hoc_id
                    LEFT JOIN nhan_vien ON nhan_vien.nhan_vien_id=hoa_don.nhan_vien_id 
                    WHERE hoa_don.hoa_don_id=${req.params.id} AND hoa_don_chi_tiet.loai_san_pham='Khóa học' AND hoa_don.hoc_vien_id=${decodedToken.userId}`,
                    { type: sequelize.QueryTypes.SELECT }
                );
                res.status(200).send({
                    status: 'success',
                    data: invoice,
                    message: null,
                });
            }
            else {
                res.status(401).send({
                    status: 'success',
                    data: null,
                    message: 'Bạn không có quyền đọc thông tin này',
                });
            }
        }
    } catch (error) {
        res.status(401).send({
            status: 'success',
            data: null,
            message: 'Bạn không có quyền đọc thông tin người dùng này ' + error,
        });
    }  
    
};

const postCreate = async (req, res) => {
    const invoice = await Invoice.create({
        ...req.body,
        hoa_don_ma: Date.now().toString().substr(-8),
        hoc_vien_id: req.userId,
    });
    res.status(200).send({
        status: 'success',
        data: invoice,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    await Invoice.update(
        {
            ...req.body,
        },
        {
            where: {
                hoa_don_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const stateChange = async (req, res) => {
    if (req.body.trang_thai == 1) {
        req.body.ngay_lap = Date.now();
        const detailedInvoice = await sequelize.query(`
            SELECT hoa_don_chi_tiet.*, hoa_don.hoa_don_ma, hoc_vien.ho_ten, hoc_vien.hoc_vien_id, hoc_vien.email 
            FROM hoa_don_chi_tiet JOIN hoa_don ON hoa_don.hoa_don_id=hoa_don_chi_tiet.hoa_don_id JOIN hoc_vien ON 
            hoc_vien.hoc_vien_id=hoa_don.hoc_vien_id WHERE hoa_don.hoa_don_id=:hoa_don_id`,
            {
                replacements:{
                    hoa_don_id: parseInt(req.params.id)
                },
                type: sequelize.QueryTypes.SELECT
            });
        let product;
        if (detailedInvoice[0].loai_san_pham == 'Khóa học') {
            product = await Course.findOne({
                where: {
                    khoa_hoc_id: detailedInvoice[0].san_pham_id,
                },
            });
        }
        const content = {
            gmail: detailedInvoice[0].email,
            ho_ten: detailedInvoice[0].ho_ten,
            ma_hoa_don: detailedInvoice[0].hoa_don_ma,
            tong_tien: detailedInvoice[0].tong_tien,
            ngay: detailedInvoice[0].ngay_tao,
            ten_khoa_hoc: product.ten_khoa_hoc,
        };
        await DetailedDiscount.update({
            trang_thai_su_dung: true
        },{
            where:{
                chiet_khau_ma: detailedInvoice[0].chiet_khau_ma
            }
        })
        await CourseStudent.create({
            khoa_hoc_id: detailedInvoice[0].san_pham_id,
            hoc_vien_id: detailedInvoice[0].hoc_vien_id
        })
        await sendMail(content, 5);
    }
    await Invoice.update(
        {
            ...req.body,
            nhan_vien_id: req.userId,
        },
        {
            where: {
                hoa_don_id: req.params.id,
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
            hoa_don_id: req.params.id,
        },
    });
    await Invoice.destroy({
        where: {
            hoa_don_id: req.params.id,
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
    stateChange,
    deleteById,
};
