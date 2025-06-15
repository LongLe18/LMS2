const fs = require('fs');
const { Op } = require('sequelize');

const { Comment, Notification, Course, Modun, Student } = require('../models');
const sequelize = require('../utils/db');

const findAll = async (req, res) => {
    const pageIndex = Number(req.query.pageIndex || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const offset = (pageIndex - 1) * pageSize;
    const limit = pageSize;
    const order = req.query.sortBy
        ? req.query.sortBy.split(',')
        : ['binh_luan.ngay_tao', 'DESC'];

    const whereConditions = [];
    const replacements = { offset, limit };

    if (req.query.khoa_hoc_id) {
        whereConditions.push('binh_luan.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = parseInt(req.query.khoa_hoc_id);
    }
    if (req.query.mo_dun_id) {
        whereConditions.push('binh_luan.mo_dun_id = :mo_dun_id');
        replacements.mo_dun_id = parseInt(req.query.mo_dun_id);
    }
    if (req.query.lien_ket_id) {
        whereConditions.push('binh_luan.lien_ket_id = :lien_ket_id');
        replacements.lien_ket_id = parseInt(req.query.lien_ket_id);
    }
    if (req.query.loai_hoi_dap) {
        whereConditions.push('binh_luan.loai_hoi_dap = :loai_hoi_dap');
        replacements.loai_hoi_dap = parseInt(req.query.loai_hoi_dap);
    }

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const countResult = await sequelize.query(
        `SELECT COUNT(*) AS tong FROM binh_luan ${whereClause}`,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const comments = await sequelize.query(
        `
        SELECT binh_luan.binh_luan_id, binh_luan.noi_dung, binh_luan.anh_dinh_kem, binh_luan.khoa_hoc_id,
            binh_luan.mo_dun_id, binh_luan.loai_hoi_dap, binh_luan.lien_ket_id, binh_luan.hoc_vien_id,
            binh_luan.tra_loi, binh_luan.phu_trach_id, binh_luan.ngay_tao,
            khoa_hoc.ten_khoa_hoc, mo_dun.ten_mo_dun, hoc_vien.anh_dai_dien,
            hoc_vien.ho_ten AS ten_hoc_vien,
            (SELECT COUNT(binh_luan_phu.binh_luan_phu_id)
             FROM binh_luan_phu WHERE binh_luan_phu.binh_luan_id = binh_luan.binh_luan_id
            ) AS so_binh_luan_phu,
            giao_vien.ho_ten AS ten_giao_vien
        FROM binh_luan
        JOIN hoc_vien ON hoc_vien.hoc_vien_id = binh_luan.hoc_vien_id
        LEFT JOIN khoa_hoc ON khoa_hoc.khoa_hoc_id = binh_luan.khoa_hoc_id
        LEFT JOIN mo_dun ON mo_dun.mo_dun_id = binh_luan.mo_dun_id
        LEFT JOIN giao_vien ON giao_vien.giao_vien_id = binh_luan.phu_trach_id
        ${whereClause}
        ORDER BY ${order[0]} ${order[1]}
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: comments,
        pageIndex,
        pageSize,
        totalCount: Number(countResult[0].tong),
        totalPage: Math.ceil(countResult[0].tong / pageSize),
        message: null,
    });
};

const findAllv2 = async (req, res) => {
    const { count, rows } = await Comment.findAndCountAll({
        include: [
            {
                model: Course,
                attributes: ['khoa_hoc_id', 'ten_khoa_hoc'],
            },
            {
                model: Modun,
                attributes: ['mo_dun_id', 'ten_mo_dun'],
            },
            {
                model: Student,
                attributes: ['hoc_vien_id', 'ho_ten'],
            },
        ],
        where: {
            phu_trach_id: req.userId,
            ...(req.query.search && {
                [Op.or]: [
                    { noi_dung: { [Op.like]: `%${req.query.search}%` } },
                    {
                        '$mo_dun.ten_mo_dun$': {
                            [Op.like]: `%${req.query.search}%`,
                        },
                    },
                    {
                        '$khoa_hoc.ten_khoa_hoc$': {
                            [Op.like]: `%${req.query.search}%`,
                        },
                    },
                    {
                        '$hoc_vien.ho_ten$': {
                            [Op.like]: `%${req.query.search}%`,
                        },
                    },
                ],
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
    let replacements = { binhLuanId: req.params.id };
    let query = `
        SELECT binh_luan.*, hoc_vien.ho_ten, hoc_vien.anh_dai_dien 
        FROM binh_luan 
        JOIN hoc_vien ON binh_luan.hoc_vien_id = hoc_vien.hoc_vien_id 
        WHERE binh_luan.binh_luan_id = :binhLuanId
    `;

    // Nếu không phải nhân viên (role 1 hoặc 2), thì thêm điều kiện kiểm tra học viên
    if (req.role !== 1 && req.role !== 2) {
        query += ` AND binh_luan.hoc_vien_id = :hocVienId`;
        replacements.hocVienId = req.userId;
    }

    const comment = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT,
    });
    if (!comment[0]) {
        return res.status(403).send({
            status: 'failed',
            data: null,
            message: 'Bạn không có quyền đọc bình luận này',
        });
    }

    return res.status(200).send({
        status: 'success',
        data: comment[0],
        message: null,
    });
};

const create = async (req, res) => {
    if (req.body.loai_hoi_dap == 0) {
        const modun = await sequelize.query(
            `
            SELECT giao_vien.giao_vien_id 
            FROM mo_dun 
            JOIN giao_vien ON mo_dun.giao_vien_id = giao_vien.giao_vien_id
            WHERE mo_dun.mo_dun_id = :mo_dun_id
            `,
            {
                replacements: { mo_dun_id: req.body.mo_dun_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        if (modun.length > 0) {
            req.body.phu_trach_id = modun[0].giao_vien_id;
        }
    } else if (req.body.loai_hoi_dap == 1) {
        const de_thi_id = req.body.lien_ket_id.split('/')[0];
        const exam = await sequelize.query(
            `
            SELECT giao_vien.giao_vien_id 
            FROM giao_vien 
            JOIN mo_dun ON giao_vien.giao_vien_id = mo_dun.giao_vien_id 
            JOIN de_thi ON mo_dun.mo_dun_id = de_thi.mo_dun_id 
            WHERE de_thi.de_thi_id = :de_thi_id
            `,
            {
                replacements: { de_thi_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        if (exam.length > 0) {
            req.body.phu_trach_id = exam[0].giao_vien_id;
        }
    }
    if (req.body.anh_dinh_kem && req.files?.length > 0) {
        const links = req.files.map((file) => `/image/${file.filename}`);
        req.body.anh_dinh_kem = links.join(',');
    }

    const comment = await Comment.create({
        ...req.body,
        hoc_vien_id: req.userId,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: comment,
        message: null,
    });
};

const update = async (req, res) => {
    if (req.body.anh_dinh_kem && Array.isArray(req.files)) {
        const newLinks = req.files.map((file) => `/image/${file.filename}`);
        req.body.anh_dinh_kem = newLinks.join(',');

        const comment = await Comment.findOne({
            where: { binh_luan_id: req.params.id },
            raw: true,
        });

        if (comment?.anh_dinh_kem) {
            const oldLinks = comment.anh_dinh_kem.split(',');
            for (const oldPath of oldLinks) {
                const fullPath = `public${oldPath}`;
                if (fs.existsSync(fullPath)) {
                    try {
                        fs.unlinkSync(fullPath);
                    } catch (err) {
                        console.error(`Không thể xóa file: ${fullPath}`, err);
                    }
                }
            }
        }
    }
    await Comment.update(
        { ...req.body, nguoi_sua: req.userId },
        { where: { binh_luan_id: req.params.id } }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const remove = async (req, res) => {
    const comment = await Comment.findOne({
        where: { binh_luan_id: req.params.id },
    });
    if (comment?.anh_dinh_kem) {
        const attachments = comment.anh_dinh_kem.split(',');
        for (const path of attachments) {
            const fullPath = `public${path}`;
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                } catch (err) {
                    console.error(`Không thể xóa ảnh: ${fullPath}`, err);
                }
            }
        }
    }

    const whereClause =
        req.role === 0
            ? { binh_luan_id: req.params.id, hoc_vien_id: req.userId }
            : { binh_luan_id: req.params.id };

    await Comment.destroy({ where: whereClause });
    await Notification.destroy({
        where: {
            loai_thong_bao: 0,
            lien_ket_id: req.params.id,
        },
    });

    await sequelize.query(
        `
        DELETE FROM thong_bao 
        WHERE loai_thong_bao = 1 
          AND lien_ket_id IN (
            SELECT binh_luan_phu_id 
            FROM binh_luan_phu 
            WHERE binh_luan_id = :binh_luan_id
        )`,
        {
            replacements: { binh_luan_id: req.params.id },
            type: sequelize.QueryTypes.DELETE,
        }
    );

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
    remove,
    findAllv2,
};
