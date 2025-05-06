const {
    Invoice,
    CourseStudent,
    DetailedInvoice,
    Course,
    DetailedDiscount,
} = require('../models');
const sequelize = require('../utils/db');
const sendMail = require('../services/mail.service');

const findAll = async (req, res) => {
    let whereConditions = [];
    let replacements = {};

    const pageSize = Number(req.query.pageSize) || 10; // mặc định 10 item / trang
    const pageIndex = Number(req.query.pageIndex) || 1; // mặc định trang 1
    const offset = (pageIndex - 1) * pageSize;

    if (req.query.trang_thai) {
        whereConditions.push('hoa_don.trang_thai = :trang_thai');
        replacements.trang_thai = parseInt(req.query.trang_thai);
    }
    if (req.query.nhan_vien_id) {
        whereConditions.push('hoa_don.nhan_vien_id = :nhan_vien_id');
        replacements.nhan_vien_id = parseInt(req.query.nhan_vien_id);
    }
    if (req.query.search) {
        whereConditions.push('hoc_vien.ho_ten LIKE :search');
        replacements.search = `%${decodeURI(req.query.search)}%`;
    }
    if (req.query.ngay_bat_dau && req.query.ngay_ket_thuc) {
        whereConditions.push(
            'hoa_don.ngay_tao BETWEEN :ngay_bat_dau AND :ngay_ket_thuc'
        );
        replacements.ngay_bat_dau = req.query.ngay_bat_dau;
        replacements.ngay_ket_thuc = req.query.ngay_ket_thuc;
    }

    if (req.role === 0) {
        whereConditions.push('hoa_don.hoc_vien_id = :hoc_vien_id');
        replacements.hoc_vien_id = req.userId;
    }

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const countResult = await sequelize.query(
        `
        SELECT COUNT(*) as total
        FROM hoa_don
        LEFT JOIN hoa_don_chi_tiet ON hoa_don_chi_tiet.hoa_don_id = hoa_don.hoa_don_id
        LEFT JOIN hoc_vien ON hoa_don.hoc_vien_id = hoc_vien.hoc_vien_id
        LEFT JOIN nhan_vien ON hoa_don.nhan_vien_id = nhan_vien.nhan_vien_id
        ${whereClause}
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = countResult[0]?.total || 0;
    const totalPage = Math.ceil(totalCount / pageSize);

    const invoices = await sequelize.query(
        `
        SELECT hoa_don.*, hoc_vien.ho_ten AS ten_hoc_vien, hoc_vien.email, 
            hoc_vien.sdt AS so_dien_thoai, nhan_vien.ho_ten AS ten_nhan_vien,
            hoa_don_chi_tiet.tong_tien 
        FROM hoa_don
        LEFT JOIN hoa_don_chi_tiet ON hoa_don_chi_tiet.hoa_don_id = hoa_don.hoa_don_id
        LEFT JOIN hoc_vien ON hoa_don.hoc_vien_id = hoc_vien.hoc_vien_id
        LEFT JOIN nhan_vien ON hoa_don.nhan_vien_id = nhan_vien.nhan_vien_id
        ${whereClause}
        ORDER BY hoa_don.trang_thai ASC, hoa_don.ngay_tao DESC
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
        data: invoices,
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPage: totalPage,
        message: null,
    });
};

const findOne = async (req, res) => {
    const { role, userId } = decodedToken;
    const { id } = req.params;

    let whereConditions = [
        'hoa_don.hoa_don_id = :id',
        "hoa_don_chi_tiet.loai_san_pham = 'Khóa học'",
    ];
    let replacements = { id: parseInt(id) };

    if (role === 0) {
        whereConditions.push('hoa_don.hoc_vien_id = :userId');
        replacements.userId = parseInt(userId);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const invoice = await sequelize.query(
        `
        SELECT hoc_vien.ho_ten AS ten_hoc_vien, hoc_vien.email, hoc_vien.sdt, 
            khoa_hoc.ten_khoa_hoc, nhan_vien.ho_ten AS ten_nhan_vien, hoa_don.hoa_don_ma, 
            hoa_don_chi_tiet.* 
        FROM hoc_vien 
        JOIN hoa_don ON hoc_vien.hoc_vien_id = hoa_don.hoc_vien_id 
        JOIN hoa_don_chi_tiet ON hoa_don.hoa_don_id = hoa_don_chi_tiet.hoa_don_id 
        JOIN khoa_hoc ON hoa_don_chi_tiet.san_pham_id = khoa_hoc.khoa_hoc_id
        LEFT JOIN nhan_vien ON nhan_vien.nhan_vien_id = hoa_don.nhan_vien_id 
        ${whereClause}
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: invoice,
        message: null,
    });
};

const create = async (req, res) => {
    const invoice = await Invoice.create({
        ...req.body,
        hoa_don_ma: Date.now().toString().substr(-8),
        hoc_vien_id: req.userId,
    });
    
    return res.status(200).send({
        status: 'success',
        data: invoice,
        message: null,
    });
};

const update = async (req, res) => {
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
    
    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const stateChange = async (req, res) => {
    const { id } = req.params;
    const { trang_thai, ...updateData } = req.body;
    
    if (parseInt(trang_thai) === 1) {
        updateData.ngay_lap = Date.now();
        const detailedInvoice = await sequelize.query(
            `
            SELECT hoa_don_chi_tiet.*, hoa_don.hoa_don_ma, hoc_vien.ho_ten, hoc_vien.hoc_vien_id, hoc_vien.email 
            FROM hoa_don_chi_tiet 
            JOIN hoa_don ON hoa_don.hoa_don_id = hoa_don_chi_tiet.hoa_don_id 
            JOIN hoc_vien ON hoc_vien.hoc_vien_id = hoa_don.hoc_vien_id 
            WHERE hoa_don.hoa_don_id = :hoa_don_id
            `,
            {
                replacements: { hoa_don_id: parseInt(id) },
                type: sequelize.QueryTypes.SELECT,
            }
        );
    
        const invoiceDetail = detailedInvoice[0];
        if (!invoiceDetail) {
            return res.status(404).send({
                status: 'fail',
                data: null,
                message: 'Không tìm thấy chi tiết hóa đơn',
            });
        }
    
        let course = null;
        if (invoiceDetail.loai_san_pham === 'Khóa học') {
            course = await Course.findOne({
                where: { khoa_hoc_id: invoiceDetail.san_pham_id },
            });
        }
    
        const emailContent = {
            gmail: invoiceDetail.email,
            ho_ten: invoiceDetail.ho_ten,
            ma_hoa_don: invoiceDetail.hoa_don_ma,
            tong_tien: invoiceDetail.tong_tien,
            ngay: invoiceDetail.ngay_tao,
            ten_khoa_hoc: course ? course.ten_khoa_hoc : '',
        };
    
        if (invoiceDetail.chiet_khau_ma) {
            await DetailedDiscount.update(
                { trang_thai_su_dung: true },
                {
                    where: { chiet_khau_ma: invoiceDetail.chiet_khau_ma },
                }
            );
        }
    
        await CourseStudent.create({
            khoa_hoc_id: invoiceDetail.san_pham_id,
            hoc_vien_id: invoiceDetail.hoc_vien_id,
        });
    
        await sendMail(emailContent, 5);
    }
    
    await Invoice.update(
        {
            ...updateData,
            nhan_vien_id: req.userId,
        },
        {
            where: { hoa_don_id: id },
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
            hoa_don_id: req.params.id,
        },
    });
    await Invoice.destroy({
        where: {
            hoa_don_id: req.params.id,
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
    update,
    stateChange,
    remove,
};
