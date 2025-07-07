const fs = require('fs');
const { fn, literal } = require('sequelize');

const { Modun, Exam, StudentExam, Course, Thematic } = require('../models');
const sequelize = require('../utils/db');

const getTeaching = async (req, res) => {
    const pageSize = parseInt(req.query.pageSize || 10);
    const pageIndex = parseInt(req.query.pageIndex || 1);
    const offset = (pageIndex - 1) * pageSize;

    const replacements = {
        giao_vien_id: parseInt(req.userId),
        limit: pageSize,
        offset: offset,
    };

    const moduns = await sequelize.query(
        `
        SELECT mo_dun.*, khoa_hoc.ten_khoa_hoc, khoa_hoc.trang_thai,
            (
                SELECT COUNT(DISTINCT khoa_hoc_hoc_vien.hoc_vien_id)
                FROM khoa_hoc_hoc_vien
                WHERE khoa_hoc_hoc_vien.khoa_hoc_id = khoa_hoc.khoa_hoc_id
            ) AS so_luong
        FROM mo_dun
        JOIN khoa_hoc ON mo_dun.khoa_hoc_id = khoa_hoc.khoa_hoc_id
        WHERE mo_dun.giao_vien_id = :giao_vien_id
        ORDER BY mo_dun.mo_dun_id DESC
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
        FROM mo_dun
        JOIN khoa_hoc ON mo_dun.khoa_hoc_id = khoa_hoc.khoa_hoc_id
        WHERE mo_dun.giao_vien_id = :giao_vien_id
        `,
        {
            replacements: { giao_vien_id: replacements.giao_vien_id },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = totalResult[0]?.total || 0;
    const totalPage = Math.ceil(totalCount / pageSize);

    return res.status(200).send({
        status: 'success',
        data: moduns,
        pageIndex,
        pageSize,
        totalCount,
        totalPage,
        message: null,
    });
};

const findAll = async (req, res) => {
    let whereConditions = [];
    let replacements = {};

    const pageSize = Number(req.query.pageSize) || 10;
    const pageIndex = Number(req.query.pageIndex) || 1;
    const offset = (pageIndex - 1) * pageSize;

    if (req.query.khoa_hoc_id) {
        whereConditions.push('mo_dun.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = parseInt(req.query.khoa_hoc_id);
    }
    if (req.query.trang_thai) {
        whereConditions.push('mo_dun.trang_thai = :trang_thai');
        replacements.trang_thai = parseInt(req.query.trang_thai);
    }

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const countResult = await sequelize.query(
        `
        SELECT COUNT(*) AS total
        FROM mo_dun
        LEFT JOIN giao_vien ON giao_vien.giao_vien_id = mo_dun.giao_vien_id
        LEFT JOIN khoa_hoc ON mo_dun.khoa_hoc_id = khoa_hoc.khoa_hoc_id
        LEFT JOIN tieu_chi_de_mo_dun ON mo_dun.mo_dun_id = tieu_chi_de_mo_dun.mo_dun_id
        ${whereClause}
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = countResult[0]?.total || 0;
    const totalPage = Math.ceil(totalCount / pageSize);

    let moduns = await sequelize.query(
        `
        SELECT mo_dun.*, giao_vien.ho_ten, khoa_hoc.ten_khoa_hoc, tieu_chi_de_mo_dun.yeu_cau AS muc_tieu
        FROM mo_dun
        LEFT JOIN giao_vien ON giao_vien.giao_vien_id = mo_dun.giao_vien_id
        LEFT JOIN khoa_hoc ON mo_dun.khoa_hoc_id = khoa_hoc.khoa_hoc_id
        LEFT JOIN tieu_chi_de_mo_dun ON mo_dun.mo_dun_id = tieu_chi_de_mo_dun.mo_dun_id
        ${whereClause}
        ORDER BY mo_dun.loai_tong_hop ASC, mo_dun.ngay_tao DESC
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

    let percentAchieved;
    for (let modun of moduns) {
        let totalExam = await Exam.count({
            where: {
                loai_de_thi_id: 1,
                trang_thai: true,
                mo_dun_id: modun.mo_dun_id,
            },
        });
        let passingExam = await Exam.count({
            include: {
                model: StudentExam,
            },
            where: {
                loai_de_thi_id: 1,
                mo_dun_id: modun.mo_dun_id,
                trang_thai: true,
                '$de_thi_hoc_viens.hoc_vien_id$': req.userId,
                '$de_thi_hoc_viens.dat_yeu_cau$': true,
            },
        });
        if (totalExam != 0) {
            percentAchieved = parseFloat(passingExam / totalExam);
            modun.percentAchieved = Math.round(percentAchieved * 10000) / 100;
        } else {
            modun.percentAchieved = 0;
        }
    }

    return res.status(200).send({
        status: 'success',
        data: moduns,
        pageIndex,
        pageSize,
        totalCount,
        totalPage,
        message: null,
    });
};

const getByCourseId = async (req, res) => {
    const replacements = {
        khoa_hoc_id: parseInt(req.params.id),
    };

    const moduns = await sequelize.query(
        `
        SELECT 
            mo_dun.mo_dun_id, mo_dun.mo_dun_ma, mo_dun.ten_mo_dun, mo_dun.linh_vuc,
            mo_dun.mo_ta, mo_dun.video_gioi_thieu, mo_dun.anh_dai_dien,
            mo_dun.loai_tong_hop, mo_dun.giao_vien_id,
            0 AS tien_do,
            COUNT(chuyen_de.chuyen_de_id) AS so_chuyen_de
        FROM mo_dun
        LEFT JOIN chuyen_de ON mo_dun.mo_dun_id = chuyen_de.mo_dun_id
        WHERE mo_dun.khoa_hoc_id = :khoa_hoc_id
        GROUP BY 
            mo_dun.mo_dun_id, mo_dun.mo_dun_ma, mo_dun.ten_mo_dun, mo_dun.linh_vuc,
            mo_dun.mo_ta, mo_dun.video_gioi_thieu, mo_dun.anh_dai_dien,
            mo_dun.loai_tong_hop, mo_dun.giao_vien_id
        LIMIT 100
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    // Xử lý tiến độ nếu có học viên
    if (req.query.hoc_vien_id) {
        const hoc_vien_id = parseInt(req.query.hoc_vien_id);
        for (const modun of moduns) {
            const [nums] = await sequelize.query(
                `
                SELECT 
                    (SELECT COUNT(*) FROM de_thi 
                        JOIN de_thi_hoc_vien ON de_thi.de_thi_id = de_thi_hoc_vien.de_thi_id
                        WHERE de_thi.loai_de_thi_id = 1 
                        AND de_thi.trang_thai = true 
                        AND de_thi.mo_dun_id = :mo_dun_id 
                        AND de_thi_hoc_vien.hoc_vien_id = :hoc_vien_id 
                        AND de_thi_hoc_vien.dat_yeu_cau = true
                    ) AS so_de_dat,
                    (SELECT COUNT(*) FROM de_thi 
                        WHERE loai_de_thi_id = 1 
                        AND trang_thai = true 
                        AND mo_dun_id = :mo_dun_id
                    ) AS tong_so_de
                `,
                {
                    replacements: {
                        mo_dun_id: modun.mo_dun_id,
                        hoc_vien_id,
                    },
                    type: sequelize.QueryTypes.SELECT,
                }
            );

            if (nums.tong_so_de !== 0) {
                modun.tien_do =
                    Math.round((nums.so_de_dat / nums.tong_so_de) * 10000) /
                    100;
            } else {
                modun.tien_do = 0;
            }
        }
    }

    return res.status(200).send({
        status: 'success',
        data: moduns,
        message: null,
    });
};

const getByUserCourse = async (req, res) => {
    const moduns = await sequelize.query(
        `
        SELECT 
            mo_dun.*,
            (
                (
                    SELECT COUNT(DISTINCT de_thi.chuyen_de_id)
                    FROM de_thi
                    JOIN de_thi_hoc_vien ON de_thi.de_thi_id = de_thi_hoc_vien.de_thi_id
                    WHERE 
                        de_thi.loai_de_thi_id = 1
                        AND de_thi.trang_thai = true
                        AND de_thi_hoc_vien.dat_yeu_cau = true
                        AND de_thi_hoc_vien.hoc_vien_id = :hoc_vien_id
                        AND de_thi.mo_dun_id = mo_dun.mo_dun_id
                ) / 
                NULLIF(
                    (SELECT COUNT(*) FROM chuyen_de WHERE chuyen_de.mo_dun_id = mo_dun.mo_dun_id),
                    0
                )
            ) AS tien_do
        FROM mo_dun
        WHERE mo_dun.khoa_hoc_id = :khoa_hoc_id
        LIMIT 100
        `,
        {
            replacements: {
                khoa_hoc_id: parseInt(req.params.id),
                hoc_vien_id: parseInt(req.userId),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: moduns,
        message: null,
    });
};

const getAllv2 = async (req, res) => {
    let whereConditions = [];
    let replacements = {};

    const pageSize = Number(req.query.pageSize) || 10;
    const pageIndex = Number(req.query.pageIndex) || 1;
    const offset = (pageIndex - 1) * pageSize;

    if (req.query.khoa_hoc_id) {
        whereConditions.push('mo_dun.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = parseInt(req.query.khoa_hoc_id);
    }
    if (req.query.trang_thai) {
        whereConditions.push('mo_dun.trang_thai = :trang_thai');
        replacements.trang_thai = parseInt(req.query.trang_thai);
    }

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const countResult = await sequelize.query(
        `
        SELECT COUNT(*) AS total
        FROM mo_dun
        LEFT JOIN tieu_chi_de_mo_dun ON mo_dun.mo_dun_id = tieu_chi_de_mo_dun.mo_dun_id
        ${whereClause}
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = countResult[0]?.total || 0;
    const totalPage = Math.ceil(totalCount / pageSize);

    const moduns = await sequelize.query(
        `
        SELECT 
            mo_dun.*, 
            IF(tieu_chi_de_mo_dun.yeu_cau IS NULL, 0, tieu_chi_de_mo_dun.yeu_cau) AS muc_tieu 
        FROM mo_dun 
        LEFT JOIN tieu_chi_de_mo_dun ON mo_dun.mo_dun_id = tieu_chi_de_mo_dun.mo_dun_id
        ${whereClause}
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
        data: moduns,
        pageIndex,
        pageSize,
        totalCount,
        totalPage,
        message: null,
    });
};

const getStatistical = async (req, res) => {
    const pageSize = Number(req.query.limit) || 100;
    const pageIndex = Math.max(Number(req.query.offset) || 0, 0);
    const offset = pageIndex * pageSize;

    let whereConditions = 'mo_dun.giao_vien_id = :giao_vien_id';
    let replacements = {
        giao_vien_id: parseInt(req.params.id),
        limit: pageSize,
        offset,
    };

    if (req.query.search) {
        whereConditions += ' AND mo_dun.ten_mo_dun LIKE :search';
        replacements.search = `%${decodeURIComponent(req.query.search)}%`;
    }
    if (req.query.trang_thai) {
        whereConditions += ' AND khoa_hoc.trang_thai = :trang_thai';
        replacements.trang_thai = parseInt(req.query.trang_thai);
    }

    const moduns = await sequelize.query(
        `
        SELECT 
            khoa_hoc.trang_thai, 
            khoa_hoc.ten_khoa_hoc, 
            mo_dun.ten_mo_dun, 
            mo_dun.mo_dun_id,

            -- Số học viên trong khóa học
            (
                SELECT COUNT(DISTINCT khoa_hoc_hoc_vien.hoc_vien_id) 
                FROM khoa_hoc_hoc_vien 
                WHERE khoa_hoc_hoc_vien.khoa_hoc_id = khoa_hoc.khoa_hoc_id
            ) AS so_hoc_vien,

            -- Số học viên hoàn thành mô đun
            (
                SELECT COUNT(DISTINCT hoc_vien.hoc_vien_id) 
                FROM hoc_vien 
                WHERE 
                    (
                        SELECT COUNT(DISTINCT de_thi.chuyen_de_id) 
                        FROM de_thi_hoc_vien 
                        JOIN de_thi ON de_thi_hoc_vien.de_thi_id = de_thi.de_thi_id 
                        WHERE 
                            de_thi_hoc_vien.hoc_vien_id = hoc_vien.hoc_vien_id 
                            AND de_thi.loai_de_thi_id = 1 
                            AND de_thi.mo_dun_id = mo_dun.mo_dun_id 
                            AND de_thi_hoc_vien.dat_yeu_cau = true
                    ) = (
                        SELECT COUNT(chuyen_de.chuyen_de_id) 
                        FROM chuyen_de 
                        WHERE chuyen_de.mo_dun_id = mo_dun.mo_dun_id
                    )
                    AND 
                    (
                        SELECT COUNT(*) 
                        FROM de_thi_hoc_vien 
                        JOIN de_thi ON de_thi_hoc_vien.de_thi_id = de_thi.de_thi_id 
                        WHERE 
                            hoc_vien.hoc_vien_id = de_thi_hoc_vien.hoc_vien_id 
                            AND de_thi.loai_de_thi_id = 2 
                            AND de_thi.mo_dun_id = mo_dun.mo_dun_id 
                            AND de_thi_hoc_vien.dat_yeu_cau = true
                    ) > 0
            ) AS so_luong

        FROM khoa_hoc 
        JOIN mo_dun ON khoa_hoc.khoa_hoc_id = mo_dun.khoa_hoc_id
        WHERE ${whereConditions}
        LIMIT :limit OFFSET :offset
    `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCountResult = await sequelize.query(
        `
        SELECT COUNT(*) AS totalCount
        FROM khoa_hoc 
        JOIN mo_dun ON khoa_hoc.khoa_hoc_id = mo_dun.khoa_hoc_id
        WHERE ${whereConditions}
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = totalCountResult[0].totalCount;
    const totalPage = Math.ceil(totalCount / pageSize);

    return res.status(200).send({
        status: 'success',
        data: moduns,
        pageSize,
        pageIndex,
        totalCount,
        totalPage,
        message: null,
    });
};

const getByFilter = async (req, res) => {
    let whereConditions = [];
    let replacements = {};

    const pageSize = Number(req.query.pageSize) || 10; // mặc định 10 item / trang
    const pageIndex = Number(req.query.pageIndex) || 1; // mặc định trang 1
    const offset = (pageIndex - 1) * pageSize;

    if (req.query.search) {
        whereConditions.push('mo_dun.ten_mo_dun LIKE :search');
        replacements.search = `%${decodeURI(req.query.search)}%`;
    }
    if (req.query.ngay_bat_dau && req.query.ngay_ket_thuc) {
        whereConditions.push(
            'mo_dun.ngay_tao BETWEEN :ngay_bat_dau AND :ngay_ket_thuc'
        );
        replacements.ngay_bat_dau = req.query.ngay_bat_dau;
        replacements.ngay_ket_thuc = req.query.ngay_ket_thuc;
    }
    if (req.query.khoa_hoc_id) {
        whereConditions.push('mo_dun.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = parseInt(req.query.khoa_hoc_id);
    }
    if (req.query.trang_thai) {
        whereConditions.push('mo_dun.trang_thai = :trang_thai');
        replacements.trang_thai = parseInt(req.query.trang_thai);
    }

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const countResult = await sequelize.query(
        `
        SELECT COUNT(*) AS totalCount
        FROM mo_dun
        LEFT JOIN khoa_hoc ON mo_dun.khoa_hoc_id = khoa_hoc.khoa_hoc_id
        LEFT JOIN giao_vien ON mo_dun.giao_vien_id = giao_vien.giao_vien_id
        ${whereClause}
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = countResult[0]?.totalCount || 0;
    const totalPage = Math.ceil(totalCount / pageSize);

    const moduns = await sequelize.query(
        `
        SELECT mo_dun.*, khoa_hoc.ten_khoa_hoc, giao_vien.ho_ten AS ten_giao_vien 
        FROM mo_dun
        LEFT JOIN khoa_hoc ON mo_dun.khoa_hoc_id = khoa_hoc.khoa_hoc_id
        LEFT JOIN giao_vien ON mo_dun.giao_vien_id = giao_vien.giao_vien_id
        ${whereClause}
        ORDER BY mo_dun.ngay_tao DESC
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
        data: moduns,
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPage: totalPage,
        message: null,
    });
};

const findOne = async (req, res) => {
    const modun = await sequelize.query(
        `
        SELECT mo_dun.*, khoa_hoc.kct_id, giao_vien.chuyen_nganh_id, giao_vien.ho_ten AS ten_giao_vien
        FROM mo_dun
        LEFT JOIN giao_vien ON mo_dun.giao_vien_id = giao_vien.giao_vien_id
        LEFT JOIN khoa_hoc ON mo_dun.khoa_hoc_id = khoa_hoc.khoa_hoc_id
        WHERE mo_dun.mo_dun_id = :mo_dun_id`,
        {
            replacements: {
                mo_dun_id: parseInt(req.params.id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: modun[0], // Trả về phần tử đầu tiên vì ID là duy nhất
        message: null,
    });
};

const create = async (req, res) => {
    if (req.body.loai_tong_hop === '1') {
        const existingModun = await Modun.findOne({
            where: {
                khoa_hoc_id: req.body.khoa_hoc_id,
                loai_tong_hop: true,
            },
        });

        if (existingModun) {
            return res.status(404).send({
                status: 'fail',
                data: null,
                message: 'Synthesis module already exists',
            });
        }
    }

    const course = await Course.findOne({
        where: {
            khoa_hoc_id: req.body.khoa_hoc_id,
        },
    });

    const newModun = await Modun.create({
        ...req.body,
        giao_vien_id: course.giao_vien_id,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: newModun,
        message: null,
    });
};

const update = async (req, res) => {
    if (req.body.loai_tong_hop === 'true') {
        const existingModun = await Modun.findOne({
            where: {
                khoa_hoc_id: req.body.khoa_hoc_id,
                loai_tong_hop: true,
            },
        });

        if (existingModun) {
            return res.status(400).send({
                status: 'fail',
                data: null,
                message: 'Synthesis module already exists',
            });
        }
    }

    const modunToUpdate = await Modun.findOne({
        where: {
            mo_dun_id: req.params.id,
        },
    });

    if (req.files) {
        if (
            req.files['anh_dai_dien'] &&
            modunToUpdate.anh_dai_dien &&
            fs.existsSync(`public${modunToUpdate.anh_dai_dien}`)
        ) {
            fs.unlinkSync(`public${modunToUpdate.anh_dai_dien}`);
        }

        if (
            req.files['video_gioi_thieu'] &&
            modunToUpdate.video_gioi_thieu &&
            fs.existsSync(`public${modunToUpdate.video_gioi_thieu}`)
        ) {
            fs.unlinkSync(`public${modunToUpdate.video_gioi_thieu}`);
        }
    }

    if (Number(req.body.khoa_hoc_id) !== modunToUpdate.khoa_hoc_id) {
        const course = await Course.findOne({
            khoa_hoc_id: Number(req.body.khoa_hoc_id),
        });
        req.body = { ...req.body, giao_vien_id: course.giao_vien_id };

        await Thematic.update(
            {
                giao_vien_id: course.giao_vien_id,
            },
            {
                where: {
                    mo_dun_id: req.params.id,
                },
            }
        );
    }

    await Modun.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                mo_dun_id: req.params.id,
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
    await Modun.update(
        {
            trang_thai: false,
            nguoi_sua: req.userId,
        },
        {
            where: {
                mo_dun_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

const restore = async (req, res) => {
    await Modun.update(
        {
            trang_thai: true,
            nguoi_sua: req.userId,
        },
        {
            where: {
                mo_dun_id: req.params.id,
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
    const modun = await Modun.findOne({
        where: {
            mo_dun_id: req.params.id,
        },
    });

    if (!modun) {
        return res.status(404).send({
            status: 'fail',
            data: null,
            message: 'Module not found',
        });
    }

    if (modun.anh_dai_dien && fs.existsSync(`public${modun.anh_dai_dien}`)) {
        fs.unlinkSync(`public${modun.anh_dai_dien}`);
    }
    if (
        modun.video_gioi_thieu &&
        fs.existsSync(`public${modun.video_gioi_thieu}`)
    ) {
        fs.unlinkSync(`public${modun.video_gioi_thieu}`);
    }

    await Modun.destroy({
        where: {
            mo_dun_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'Module deleted successfully',
    });
};

const findAllv2 = async (req, res) => {
    const { count, rows } = await Modun.findAndCountAll({
        include: [
            {
                model: Thematic,
                attributes: [],
                where: {
                    trang_thai: true,
                },
                required: false,
            },
            {
                model: Exam,
                attributes: [],
                where: {
                    trang_thai: true,
                    loai_de_thi_id: 2,
                },
                required: false,
            },
        ],
        attributes: {
            include: [
                // Đếm số lượng modun
                [
                    fn(
                        'COUNT',
                        literal('DISTINCT `chuyen_des`.`chuyen_de_id`')
                    ),
                    'so_luong_chuyen_de',
                ],
                // Đếm số lượng thematic
                [
                    fn('COUNT', literal('DISTINCT `de_this`.`de_thi_id`')),
                    'so_luong_de_thi',
                ],
            ],
        },
        where: {
            giao_vien_id: req.userId,
            ...(req.query.trang_thai && { trang_thai: req.query.trang_thai }),
            ...(req.query.khoa_hoc_id && {
                khoa_hoc_id: req.query.khoa_hoc_id,
            }),
            ...(req.query.search && {
                [Op.or]: [
                    { ten_mo_dun: { [Op.like]: `%${req.query.search}%` } },
                    { mo_ta: { [Op.like]: `%${req.query.search}%` } },
                ],
            }),
        },
        subQuery: false, // QUAN TRỌNG để `COUNT(DISTINCT)` hoạt động chính xác với include
        group: ['mo_dun.mo_dun_id'],
        offset:
            (Number(req.query.pageIndex || 1) - 1) *
            Number(req.query.pageSize || 10),
        limit: Number(req.query.pageSize || 10),
        order: [
            ['loai_tong_hop', 'ASC'],
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
        totalCount: count.length,
        totalPage: Math.ceil(count.length / Number(req.query.pageSize || 10)),
        message: null,
    });
};

module.exports = {
    findAll,
    getAllv2,
    getTeaching,
    findOne,
    getByFilter,
    getStatistical,
    create,
    update,
    deleteById,
    restore,
    remove,
    getByCourseId,
    getByUserCourse,
    findAllv2,
};
