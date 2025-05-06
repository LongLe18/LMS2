const fs = require('fs');

const { Lesson } = require('../models');
const sequelize = require('../utils/db');
const security = require('../utils/security');

//[GET] lesson?id
// const getAllv2 = async (req, res) => {
//     const lessons = await sequelize.query(
//         `
//         SELECT bai_giang.*, chuyen_de.ten_chuyen_de FROM bai_giang LEFT JOIN chuyen_de
//         ON bai_giang.chuyen_de_id=chuyen_de.chuyen_de_id ORDER BY bai_giang.chuyen_de_id ASC`,
//         { type: sequelize.QueryTypes.SELECT }
//     );
//     const rows = [];
//     let videos = [];
//     let pdf = [];
//     let id = 0;
//     let ten_chuyen_de;
//     if (lessons) {
//         for (let lesson of lessons) {
//             if (lesson.chuyen_de_id !== id && id !== 0) {
//                 rows.push({
//                     chuyen_de_id: id,
//                     ten_chuyen_de: ten_chuyen_de,
//                     videos: videos,
//                     pdf: pdf,
//                 });
//                 pdf = [];
//                 videos = [];
//             }
//             if (lesson.loai_bai_giang === 'pdf') {
//                 pdf.push(lesson);
//             } else {
//                 videos.push(lesson);
//             }
//             id = lesson.chuyen_de_id;
//             ten_chuyen_de = lesson.ten_chuyen_de;
//         }
//         rows.push({
//             chuyen_de_id: id,
//             ten_chuyen_de: ten_chuyen_de,
//             videos: videos,
//             pdf: pdf,
//         });
//     }
//     res.status(200).send({
//         status: 'success',
//         data: rows,
//         message: null,
//     });
// };

const getByThematicId = async (req, res) => {
    const { id: chuyen_de_id } = req.params;
    const { loai_bai_giang } = req.query;
    const hoc_vien_id = parseInt(req.userId);

    const [countResult] = await sequelize.query(
        `
        SELECT COUNT(DISTINCT mo_dun.khoa_hoc_id) AS tong 
        FROM chuyen_de 
        JOIN mo_dun ON chuyen_de.mo_dun_id = mo_dun.mo_dun_id 
        JOIN khoa_hoc_hoc_vien ON mo_dun.khoa_hoc_id = khoa_hoc_hoc_vien.khoa_hoc_id
        WHERE khoa_hoc_hoc_vien.hoc_vien_id = :hoc_vien_id 
        AND chuyen_de.chuyen_de_id = :chuyen_de_id
        `,
        {
            replacements: {
                hoc_vien_id,
                chuyen_de_id: parseInt(chuyen_de_id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    if (parseInt(countResult.tong) === 0) {
        return res.status(401).send({
            status: 'error',
            data: null,
            message: 'Bạn chưa mua khóa học',
        });
    }

    const lessons = await sequelize.query(
        `
        SELECT bai_giang.* 
        FROM bai_giang 
        WHERE trang_thai = true
        AND loai_bai_giang = :loai_bai_giang
        AND chuyen_de_id = :chuyen_de_id
        `,
        {
            replacements: {
                loai_bai_giang: decodeURI(loai_bai_giang),
                chuyen_de_id: parseInt(chuyen_de_id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: lessons,
        message: null,
    });
};

const getByFilter = async (req, res) => {
    let whereConditions = [];
    let replacements = {};

    const pageSize = Number(req.query.pageSize) || 10;
    const pageIndex = Number(req.query.pageIndex) || 1;
    const offset = (pageIndex - 1) * pageSize;

    if (req.query.search) {
        whereConditions.push('bai_giang.ten_bai_giang LIKE :search');
        replacements.search = `%${decodeURI(req.query.search)}%`;
    }
    if (req.query.ngay_bat_dau && req.query.ngay_ket_thuc) {
        whereConditions.push(
            'bai_giang.ngay_tao BETWEEN :ngay_bat_dau AND :ngay_ket_thuc'
        );
        replacements.ngay_bat_dau = req.query.ngay_bat_dau;
        replacements.ngay_ket_thuc = req.query.ngay_ket_thuc;
    }
    if (req.query.trang_thai) {
        whereConditions.push('bai_giang.trang_thai = :trang_thai');
        replacements.trang_thai = parseInt(req.query.trang_thai);
    }
    if (req.query.chuyen_de_id) {
        whereConditions.push('bai_giang.chuyen_de_id = :chuyen_de_id');
        replacements.chuyen_de_id = parseInt(req.query.chuyen_de_id);
    }
    if (req.query.mo_dun_id) {
        whereConditions.push('chuyen_de.mo_dun_id = :mo_dun_id');
        replacements.mo_dun_id = parseInt(req.query.mo_dun_id);
    }
    if (req.query.khoa_hoc_id) {
        whereConditions.push('mo_dun.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = parseInt(req.query.khoa_hoc_id);
    }

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const countResult = await sequelize.query(
        `
        SELECT COUNT(*) as total
        FROM bai_giang
        JOIN chuyen_de ON bai_giang.chuyen_de_id = chuyen_de.chuyen_de_id
        JOIN mo_dun ON chuyen_de.mo_dun_id = mo_dun.mo_dun_id
        ${whereClause}
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = countResult[0]?.total || 0;
    const totalPage = Math.ceil(totalCount / pageSize);

    const lessons = await sequelize.query(
        `
        SELECT bai_giang.*, chuyen_de.ten_chuyen_de
        FROM bai_giang
        JOIN chuyen_de ON bai_giang.chuyen_de_id = chuyen_de.chuyen_de_id
        JOIN mo_dun ON chuyen_de.mo_dun_id = mo_dun.mo_dun_id
        ${whereClause}
        ORDER BY bai_giang.ngay_tao DESC
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements: {
                ...replacements,
                limit: pageSize,
                offset,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: lessons,
        pageIndex,
        pageSize,
        totalCount,
        totalPage,
        message: null,
    });
};

const findAll = async (req, res) => {
    const whereConditions = [];
    const replacements = {
        hoc_vien_id: parseInt(req.userId),
    };

    if (req.query.khoa_hoc_id) {
        whereConditions.push('khoa_hoc_hoc_vien.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = parseInt(req.query.khoa_hoc_id);
    }

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const countResult = await sequelize.query(
        `
        SELECT COUNT(DISTINCT mo_dun.khoa_hoc_id) AS tong 
        FROM bai_giang 
        JOIN chuyen_de ON bai_giang.chuyen_de_id = chuyen_de.chuyen_de_id 
        JOIN mo_dun ON chuyen_de.mo_dun_id = mo_dun.mo_dun_id 
        JOIN khoa_hoc_hoc_vien ON mo_dun.khoa_hoc_id = khoa_hoc_hoc_vien.khoa_hoc_id 
        ${whereClause}
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    if (countResult[0].tong == 0) {
        const firstThematic = await sequelize.query(
            `
            SELECT chuyen_de.chuyen_de_id 
            FROM chuyen_de 
            JOIN mo_dun ON chuyen_de.mo_dun_id = mo_dun.mo_dun_id 
            JOIN khoa_hoc ON khoa_hoc.khoa_hoc_id = mo_dun.khoa_hoc_id 
            WHERE khoa_hoc.khoa_hoc_id = :khoa_hoc_id 
            AND mo_dun.mo_dun_id = :mo_dun_id 
            LIMIT 1
            `,
            {
                replacements: {
                    khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
                    mo_dun_id: parseInt(req.query.mo_dun_id),
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (
            firstThematic.length > 0 &&
            parseInt(req.query.id) === firstThematic[0].chuyen_de_id
        ) {
            const filter = {
                chuyen_de_id: req.query.id,
                trang_thai: true,
            };

            const video = await Lesson.findAll({
                where: {
                    ...filter,
                    loai_bai_giang: 'video',
                },
                order: [['ten_bai_giang', 'ASC']],
            });

            const pdf = await Lesson.findOne({
                where: {
                    ...filter,
                    loai_bai_giang: 'pdf',
                },
            });

            return res.status(200).send({
                status: 'success',
                data: { video, pdf },
                message: null,
            });
        } else {
            return res.status(402).send({
                status: 'fail',
                data: null,
                message: 'Bạn chưa mua khóa học',
            });
        }
    } else {
        const filter = {
            chuyen_de_id: req.query.id,
            trang_thai: true,
        };

        const video = await Lesson.findAll({
            where: {
                ...filter,
                loai_bai_giang: 'video',
            },
            order: [['ten_bai_giang', 'ASC']],
        });

        const pdf = await Lesson.findOne({
            where: {
                ...filter,
                loai_bai_giang: 'pdf',
            },
        });

        return res.status(200).send({
            status: 'success',
            data: { video, pdf },
            message: null,
        });
    }
};

const findOne = async (req, res) => {
    if (req.role === 2) {
        const lesson = await Lesson.findOne({
            where: {
                bai_giang_id: req.params.id,
            },
        });

        return res.status(200).send({
            status: 'success',
            data: lesson,
            message: null,
        });
    }

    if (req.role === 0) {
        const whereConditions = [];
        const replacements = {
            hoc_vien_id: parseInt(req.userId),
            bai_giang_id: parseInt(req.params.id),
        };

        whereConditions.push('khoa_hoc_hoc_vien.hoc_vien_id = :hoc_vien_id');
        whereConditions.push('bai_giang.bai_giang_id = :bai_giang_id');

        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

        const countResult = await sequelize.query(
            `
            SELECT COUNT(DISTINCT mo_dun.khoa_hoc_id) AS tong 
            FROM bai_giang 
            JOIN chuyen_de ON bai_giang.chuyen_de_id = chuyen_de.chuyen_de_id 
            JOIN mo_dun ON chuyen_de.mo_dun_id = mo_dun.mo_dun_id 
            JOIN khoa_hoc_hoc_vien ON mo_dun.khoa_hoc_id = khoa_hoc_hoc_vien.khoa_hoc_id 
            ${whereClause}
            `,
            {
                replacements,
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (countResult[0].tong == 0) {
            return res.status(401).send({
                status: 'error',
                data: null,
                message: 'Bạn chưa mua khóa học',
            });
        }

        const lesson = await Lesson.findOne({
            where: {
                bai_giang_id: req.params.id,
            },
        });

        return res.status(200).send({
            status: 'success',
            data: lesson,
            message: null,
        });
    }

    return res.status(404).send({
        status: 'error',
        data: null,
        message: 'Không xác định quyền truy cập',
    });
};

const create = async (req, res) => {
    if (req.body.loai_bai_giang === 'pdf') {
        await Lesson.update(
            {
                trang_thai: false,
                nguoi_sua: req.userId,
            },
            {
                where: {
                    chuyen_de_id: req.body.chuyen_de_id,
                    loai_bai_giang: 'pdf',
                },
            }
        );
    }
    const lesson = await Lesson.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: lesson,
        message: null,
    });
};

const uploadVideos = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send({
            status: 'fail',
            data: null,
            message: 'Không có file nào được upload',
        });
    }

    const lessonsData = req.files.map((file) => ({
        ten_bai_giang: file.originalname.slice(
            0,
            file.originalname.lastIndexOf('.')
        ),
        loai_bai_giang: 'video',
        link_bai_giang: `/video/${file.filename}`,
        chuyen_de_id: req.body.chuyen_de_id,
        nguoi_tao: req.userId,
    }));

    const lessons = await Lesson.bulkCreate(lessonsData);

    return res.status(200).send({
        status: 'success',
        data: lessons,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const replacements = {
        bai_giang_id: req.params.id,
    };

    const lessonResult = await sequelize.query(
        `
        SELECT bai_giang.*, chuyen_de.mo_dun_id, mo_dun.khoa_hoc_id, khoa_hoc.kct_id
        FROM bai_giang 
        LEFT JOIN chuyen_de ON bai_giang.chuyen_de_id = chuyen_de.chuyen_de_id 
        LEFT JOIN mo_dun ON chuyen_de.mo_dun_id = mo_dun.mo_dun_id 
        LEFT JOIN khoa_hoc ON mo_dun.khoa_hoc_id = khoa_hoc.khoa_hoc_id
        WHERE bai_giang.bai_giang_id = :bai_giang_id
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    if (!lessonResult || lessonResult.length === 0) {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'Không tìm thấy bài giảng',
        });
    }

    return res.status(200).send({
        status: 'success',
        data: lessonResult[0],
        message: null,
    });
};

const update = async (req, res) => {
    // Nếu là PDF và được bật trạng thái, tắt tất cả các PDF khác cùng chuyên đề
    if (req.body.trang_thai === 'true' && req.body.loai_bai_giang === 'pdf') {
        await Lesson.update(
            { trang_thai: false },
            {
                where: {
                    chuyen_de_id: req.body.chuyen_de_id,
                    loai_bai_giang: 'pdf',
                },
            }
        );
    }

    if (req.file) {
        const lesson = await Lesson.findOne({
            where: { bai_giang_id: req.params.id },
            attributes: ['link_bai_giang'],
        });

        const oldPath = `public${lesson?.link_bai_giang || ''}`;

        if (lesson?.link_bai_giang && fs.existsSync(oldPath)) {
            try {
                fs.unlinkSync(oldPath);
            } catch (error) {
                console.error(`Không thể xóa file: ${oldPath}`, error);
            }
        }
    }

    await Lesson.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                bai_giang_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const deleteById = async (req, res) => {
    await Lesson.update(
        {
            trang_thai: false,
        },
        {
            where: {
                bai_giang_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const restore = async (req, res) => {
    await Lesson.update(
        {
            trang_thai: true,
        },
        {
            where: {
                bai_giang_id: req.params.id,
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
    const lesson = await Lesson.findOne({
        where: {
            bai_giang_id: req.params.id,
        },
        attributes: ['link_bai_giang'],
    });

    if (lesson?.link_bai_giang) {
        const filePath = `public${lesson.link_bai_giang}`;
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (error) {
                console.error('Lỗi khi xóa file:', error);
            }
        }
    }

    await Lesson.destroy({
        where: {
            bai_giang_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    //getAllv2,
    findAll,
    findOne,
    getByFilter,
    create,
    uploadVideos,
    getByThematicId,
    getUpdate,
    update,
    deleteById,
    restore,
    remove,
};
