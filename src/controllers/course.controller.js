const path = require('path');
const { Op, fn, literal } = require('sequelize');
const fs = require('fs');

const {
    Course,
    CourseStudent,
    Program,
    Student,
    Province,
    CourseType,
    CourseMedia,
    Media,
    Staff,
    ExamSetStudent,
    Teacher,
    Modun,
    Thematic,
    CourseDescription,
} = require('../models');
const sequelize = require('../utils/db');
const { checkFileType } = require('../middlewares/upload.middleware');

const findAll = async (req, res) => {
    const { count, rows } = await Course.findAndCountAll({
        include: [
            {
                model: Program,
                attributes: ['kct_id', 'ten_khung_ct', 'loai_kct', 'thu_tu'],
            },
            {
                model: CourseType,
                attributes: ['lkh_id', 'ten'],
            },
        ],
        where: {
            ...(req.query.kct_id && { kct_id: req.query.kct_id }),
            ...(req.query.trang_thai && { trang_thai: req.query.trang_thai }),
            ...(req.query.lkh_id && {
                lkh_id: req.query.lkh_id,
            }),
            ...(req.query.loai_kct && {
                '$khung_chuong_trinh.loai_kct$': req.query.loai_kct,
            }),
            ...(req.query.search && {
                [Op.or]: [
                    { ten_khoa_hoc: { [Op.like]: `%${req.query.search}%` } },
                    {
                        '$khung_chuong_trinh.ten_khung_ct$': {
                            [Op.like]: `%${req.query.search}%`,
                        },
                    },
                    {
                        '$loai_khoa_hoc.ten$': {
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

const findAllv2 = async (req, res) => {
    const { count, rows } = await Course.findAndCountAll({
        include: [
            {
                model: CourseType,
                attributes: ['lkh_id', 'ten'],
            },
            {
                model: CourseStudent,
                attributes: [],
            },
            {
                model: Modun,
                attributes: [],
                where: {
                    trang_thai: true,
                },
                include: [
                    {
                        model: Thematic,
                        attributes: [],
                        where: {
                            trang_thai: true,
                        },
                    },
                ],
                required: false,
            },
        ],
        attributes: {
            include: [
                // Đếm số lượng modun
                [
                    fn('COUNT', literal('DISTINCT `mo_duns`.`mo_dun_id`')),
                    'so_luong_modun',
                ],
                // Đếm số lượng thematic
                [
                    fn(
                        'COUNT',
                        literal('DISTINCT `mo_duns->chuyen_des`.`chuyen_de_id`')
                    ),
                    'so_luong_chuyen_de',
                ],
                // Đếm số lượng
                [
                    fn(
                        'COUNT',
                        literal('DISTINCT `khoa_hoc_hoc_viens`.`hoc_vien_id`')
                    ),
                    'so_luong_hoc_vien',
                ],
            ],
        },
        where: {
            giao_vien_id: req.userId,
            ...(req.query.trang_thai && { trang_thai: req.query.trang_thai }),
            ...(req.query.lkh_id && { lkh_id: req.query.lkh_id }),
            ...(req.query.search && {
                [Op.or]: [
                    { ten_khoa_hoc: { [Op.like]: `%${req.query.search}%` } },
                    {
                        '$loai_khoa_hoc.ten$': {
                            [Op.like]: `%${req.query.search}%`,
                        },
                    },
                ],
            }),
        },
        subQuery: false, // QUAN TRỌNG để `COUNT(DISTINCT)` hoạt động chính xác với include
        group: ['khoa_hoc.khoa_hoc_id'],
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
        totalCount: count.length,
        totalPage: Math.ceil(count.length / Number(req.query.pageSize || 10)),
        message: null,
    });
};

const getAllByProgram = async (req, res) => {
    const { count, rows } = await Program.findAndCountAll({
        include: [
            {
                model: Course,
                attributes: ['khoa_hoc_id', 'ten_khoa_hoc'],
            },
        ],
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

//Lấy danh sách học viên chưa có trong khóa học
const getAddStudents = async (req, res) => {
    const studentIds = await sequelize.query(
        `SELECT hoc_vien_id FROM khoa_hoc_hoc_vien
     WHERE khoa_hoc_id = :khoa_hoc_id`,
        {
            replacements: { khoa_hoc_id: Number(req.params.id) },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    const excludedIds = studentIds.map((item) => item.hoc_vien_id);

    const { count, rows } = await Student.findAndCountAll({
        attributes: [
            'hoc_vien_id',
            'ho_ten',
            'ngay_sinh',
            'gioi_tinh',
            'email',
            'sdt',
        ],
        include: {
            model: Province,
        },
        where: {
            ...(req.query.tinh && {
                ttp_id: Number(req.query.tinh),
            }),
            ...(req.query.ten_hoc_vien && {
                ho_ten: {
                    [Op.like]: `%${req.query.ten_hoc_vien}%`,
                },
            }),
            ...(excludedIds.length > 0 && {
                hoc_vien_id: {
                    [Op.notIn]: excludedIds,
                },
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

const addStudent = async (req, res) => {
    const hocVienIds = req.body.hoc_vien_id
        .split(',')
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
    if (hocVienIds.length === 0) {
        return res.status(400).send({
            status: 'failed',
            data: null,
            message: 'Danh sách học viên không hợp lệ.',
        });
    }

    await sequelize.query(
        `
        INSERT INTO khoa_hoc_hoc_vien(khoa_hoc_id, hoc_vien_id)
        SELECT :khoa_hoc_id, hoc_vien_id 
        FROM hoc_vien 
        WHERE hoc_vien_id IN (:hocVienIds)
        AND hoc_vien_id NOT IN (
            SELECT hoc_vien_id 
            FROM khoa_hoc_hoc_vien 
            WHERE khoa_hoc_id = :khoa_hoc_id
        )
        `,
        {
            replacements: {
                khoa_hoc_id: parseInt(req.params.id),
                hocVienIds,
            },
            type: sequelize.QueryTypes.INSERT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const getThematicOfUsers = async (req, res) => {
    const hocVienId = req.userId;
    const khoaHocId = parseInt(req.query.khoa_hoc_id);
    let filter = `
        WHERE khoa_hoc_hoc_vien.hoc_vien_id = :hocVienId
        ${khoaHocId ? 'AND khoa_hoc.khoa_hoc_id = :khoaHocId' : ''}
    `;

    const thematics = await sequelize.query(
        `
        SELECT 
            khoa_hoc.khoa_hoc_id, 
            khoa_hoc.ten_khoa_hoc,
    
            -- Số chuyên đề đã học (đạt yêu cầu)
            (
                SELECT COUNT(DISTINCT de_thi.chuyen_de_id)
                FROM de_thi 
                JOIN de_thi_hoc_vien ON de_thi.de_thi_id = de_thi_hoc_vien.de_thi_id
                WHERE 
                    de_thi_hoc_vien.hoc_vien_id = :hocVienId
                    AND de_thi.loai_de_thi_id = 1
                    AND de_thi.khoa_hoc_id = khoa_hoc.khoa_hoc_id
                    AND de_thi_hoc_vien.dat_yeu_cau = true
            ) AS chuyen_de_da_hoc,
    
            -- Tổng số chuyên đề của khóa học
            (
                SELECT COUNT(chuyen_de_id)
                FROM chuyen_de 
                JOIN mo_dun ON chuyen_de.mo_dun_id = mo_dun.mo_dun_id
                WHERE mo_dun.khoa_hoc_id = khoa_hoc.khoa_hoc_id
            ) AS tong_chuyen_de
    
        FROM khoa_hoc
        JOIN khoa_hoc_hoc_vien ON khoa_hoc.khoa_hoc_id = khoa_hoc_hoc_vien.khoa_hoc_id
        ${filter}
        `,
        {
            replacements: {
                hocVienId,
                ...(khoaHocId && { khoaHocId }),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const [mark] = await sequelize.query(
        `
        SELECT SUM(de_thi_hoc_vien.ket_qua_diem) AS diem 
        FROM de_thi_hoc_vien 
        WHERE hoc_vien_id = :hocVienId
        `,
        {
            replacements: { hocVienId },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const [num] = await sequelize.query(
        `
        SELECT COUNT(de_thi_id) AS so_bai_lam 
        FROM de_thi_hoc_vien 
        WHERE hoc_vien_id = :hocVienId
        `,
        {
            replacements: { hocVienId },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const data = {
        chuyen_de: thematics,
        diem: mark.diem || 0,
        so_bai_lam: num.so_bai_lam || 0,
    };

    return res.status(200).send({
        status: 'success',
        data,
        message: null,
    });
};

const getThematicOfUserv2 = async (req, res) => {
    const hocVienId = req.userId;
    const loai = Number(req.query.loai); // 1: theo ngày, 2: theo tuần
    const data = [];

    const courses = await sequelize.query(
        `
        SELECT khoa_hoc.* 
        FROM khoa_hoc 
        JOIN khoa_hoc_hoc_vien ON khoa_hoc.khoa_hoc_id = khoa_hoc_hoc_vien.khoa_hoc_id 
        WHERE khoa_hoc_hoc_vien.hoc_vien_id = :hocVienId 
        LIMIT 100
        `,
        {
            replacements: { hocVienId },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    for (const course of courses) {
        const thematics = [];
        const loopLimit = loai === 1 ? 30 : 16; // ngày: 30, tuần: 16

        for (let index = loopLimit - 1; index >= 0; index--) {
            let dateCondition = '';

            if (loai === 1) {
                dateCondition = `DATEDIFF(NOW(), de_thi_hoc_vien.ngay_tao) = ${index}`;
            } else if (loai === 2) {
                dateCondition = `
                DATEDIFF(NOW(), de_thi_hoc_vien.ngay_tao) < ${(index + 1) * 7}
                AND DATEDIFF(NOW(), de_thi_hoc_vien.ngay_tao) >= ${index * 7}
            `;
            } else {
                continue;
            }

            const [thematic] = await sequelize.query(
                `
                SELECT COUNT(DISTINCT de_thi.chuyen_de_id) AS chuyen_de_da_hoc
                FROM de_thi
                JOIN de_thi_hoc_vien ON de_thi.de_thi_id = de_thi_hoc_vien.de_thi_id
                WHERE 
                    de_thi_hoc_vien.hoc_vien_id = :hocVienId
                    AND de_thi.loai_de_thi_id = 1
                    AND de_thi.khoa_hoc_id = :khoaHocId
                    AND de_thi_hoc_vien.dat_yeu_cau = true
                    AND ${dateCondition}
                `,
                {
                    replacements: {
                        hocVienId,
                        khoaHocId: course.khoa_hoc_id,
                    },
                    type: sequelize.QueryTypes.SELECT,
                }
            );

            thematics.push(thematic);
        }

        data.push({
            khoa_hoc_id: course.khoa_hoc_id,
            ten_khoa_hoc: course.ten_khoa_hoc,
            chuyen_de_da_hocs: thematics,
        });
    }

    return res.status(200).send({
        status: 'success',
        data,
        message: null,
    });
};

const getOfNews = async (req, res) => {
    const pageSize = Number(req.query.pageSize || 10);
    const pageIndex = Number(req.query.pageIndex || 1);
    const offset = (pageIndex - 1) * pageSize;

    const totalCountResult = await sequelize.query(
        `
        SELECT COUNT(*) AS total FROM khoa_hoc 
        WHERE khoa_hoc.trang_thai = true
        `,
        { type: sequelize.QueryTypes.SELECT }
    );
    const totalCount = totalCountResult[0].total;

    const courses = await sequelize.query(
        `
        SELECT khoa_hoc.*, khung_chuong_trinh.ten_khung_ct 
        FROM khoa_hoc 
        JOIN khung_chuong_trinh ON khoa_hoc.kct_id = khung_chuong_trinh.kct_id 
        WHERE khoa_hoc.trang_thai = true 
        ORDER BY khoa_hoc.ngay_bat_dau DESC 
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements: {
                limit: pageSize,
                offset,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: courses,
        pageIndex,
        pageSize,
        totalCount,
        totalPage: Math.ceil(totalCount / pageSize),
        message: null,
    });
};

const getByFilter = async (req, res) => {
    const { count, rows } = await Course.findAndCountAll({
        include: [
            {
                model: Program,
                attributes: ['kct_id', 'ten_khung_ct'],
            },
            {
                model: CourseType,
                attributes: ['lkh_id', 'ten'],
            },
            {
                model: Teacher,
                attributes: ['giao_vien_id', 'ho_ten'],
            },
        ],
        where: {
            ...(req.query.search && {
                [Op.or]: [
                    { ten_khoa_hoc: { [Op.like]: `%${req.query.search}%` } },
                    {
                        '$khung_chuong_trinh.ten_khung_ct$': {
                            [Op.like]: `%${req.query.search}%`,
                        },
                    },
                    {
                        '$loai_khoa_hoc.ten$': {
                            [Op.like]: `%${req.query.search}%`,
                        },
                    },
                ],
            }),
            ...(req.query.kct_id && {
                kct_id: req.query.kct_id,
            }),
            ...(req.query.giao_vien_id && {
                giao_vien_id: req.query.giao_vien_id,
            }),
            ...(req.query.ngay_bat_dau &&
                req.query.ngay_ket_thuc && {
                    ngay_bat_dau: {
                        [Op.gte]: req.query.ngay_bat_dau,
                    },
                    ngay_ket_thuc: {
                        [Op.lte]: req.query.ngay_ket_thuc,
                    },
                }),
            ...(req.query.trang_thai && { trang_thai: req.query.trang_thai }),
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

const getStudents = async (req, res) => {
    const { count, rows } = await Student.findAndCountAll({
        attributes: ['hoc_vien_id', 'ho_ten', 'email', 'sdt', 'truong_hoc'],
        include: [
            { model: CourseStudent, attributes: [] },
            {
                model: Province,
                attributes: ['ttp_id', 'ten'],
            },
        ],
        where: {
            '$khoa_hoc_hoc_vien.khoa_hoc_id$': Number(req.params.id),
            ...(req.query.search && {
                ten_hoc_vien: {
                    [Op.like]: `%${decodeURI(req.query.search)}%`,
                },
            }),
            ...(req.query.ttp_id && { ttp_id: req.query.ttp_id }),
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

const getStudentsv2 = async (req, res) => {
    const { count, rows } = await Student.findAndCountAll({
        attributes: ['hoc_vien_id', 'ho_ten', 'email', 'sdt', 'truong_hoc'],
        include: [
            { model: ExamSetStudent, attributes: [], required: true },
            {
                model: Province,
                attributes: ['ttp_id', 'ten'],
            },
        ],
        where: {
            '$bo_de_hoc_vien.khtt_id$': Number(req.params.khttId),
            ...(req.query.search && {
                ten_hoc_vien: {
                    [Op.like]: `%${decodeURI(req.query.search)}%`,
                },
                sdt: {
                    [Op.like]: `%${decodeURI(req.query.search)}%`,
                },
            }),
            ...(req.query.ttp_id && { ttp_id: req.query.ttp_id }),
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

const getByProgramId = async (req, res) => {
    const courses = await sequelize.query(
        `
            SELECT khoa_hoc.* FROM khoa_hoc 
            WHERE trang_thai = true AND kct_id = :kct_id
        `,
        {
            replacements: {
                kct_id: parseInt(req.params.id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: courses,
        totalCount: courses.length,
        message: null,
    });
};

const getStatistical = async (req, res) => {
    const { count, rows } = await Course.findAndCountAll({
        attributes: [
            'khoa_hoc_id',
            'ten_khoa_hoc',
            'trang_thai',
            'ngay_bat_dau',
            'ngay_ket_thuc',
            [
                sequelize.literal(`(SELECT COUNT(khoa_hoc_hoc_vien.hoc_vien_id) 
                                   FROM khoa_hoc_hoc_vien 
                                   WHERE khoa_hoc_hoc_vien.khoa_hoc_id = khoa_hoc.khoa_hoc_id)`),
                'so_luong',
            ],
        ],
        include: [
            {
                model: Program,
                attributes: ['kct_id', 'ten_khung_ct'],
            },
            {
                model: CourseType,
                attributes: ['lkh_id', 'ten'],
            },
        ],
        where: {
            ...(req.query.kct_id && { kct_id: req.query.kct_id }),
            ...(req.query.lkh_id && { lkh_id: req.query.lkh_id }),
            ...(req.query.trang_thai && { trang_thai: req.query.trang_thai }),
            ...(req.query.search && {
                [Op.or]: [
                    { ten_khoa_hoc: { [Op.like]: `%${req.query.search}%` } },
                    {
                        '$khung_chuong_trinh.ten_khung_ct$': {
                            [Op.like]: `%${req.query.search}%`,
                        },
                    },
                    {
                        '$loai_khoa_hoc.ten$': {
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
    const course = await Course.findOne({
        where: {
            khoa_hoc_id: req.params.id,
        },
        include: [
            {
                model: Program,
                attributes: ['kct_id', 'loai_kct'],
            },
            {
                model: CourseType,
                attributes: ['lkh_id', 'ten'],
            },
        ],
    });

    return res.status(200).send({
        status: 'success',
        data: course,
        message: null,
    });
};

const create = async (req, res) => {
    const course = await Course.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: course,
        message: null,
    });
};

const update = async (req, res) => {
    const existingCourse = await Course.findOne({
        where: {
            khoa_hoc_id: req.params.id,
        },
        attributes: [
            'khoa_hoc_id',
            'video_mo_ta',
            'anh_dai_dien',
            'giao_vien_id',
        ],
    });

    if (req.files) {
        const filesToDelete = [
            { key: 'video_mo_ta', path: existingCourse.video_mo_ta },
            { key: 'anh_dai_dien', path: existingCourse.anh_dai_dien },
        ];

        for (const file of filesToDelete) {
            if (
                req.files[file.key] &&
                file.path &&
                fs.existsSync(`public${file.path}`)
            ) {
                fs.unlinkSync(`public${file.path}`);
            }
        }
    }

    if (Number(req.body.giao_vien_id) !== existingCourse.giao_vien_id) {
        await Modun.update(
            {
                giao_vien_id: Number(req.body.giao_vien_id),
            },
            {
                where: {
                    khoa_hoc_id: req.params.id,
                },
            }
        );

        await sequelize.query(
            `
            UPDATE chuyen_de 
            SET giao_vien_id = :giao_vien_id 
            WHERE mo_dun_id IN (
                SELECT mo_dun_id
                FROM mo_dun
                WHERE khoa_hoc_id = :khoa_hoc_id)`,
            {
                replacements: {
                    giao_vien_id: Number(req.body.giao_vien_id),
                    khoa_hoc_id: req.params.id,
                },
                type: sequelize.QueryTypes.UPDATE,
            }
        );
    }

    await Course.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                khoa_hoc_id: req.params.id,
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
    await Course.update(
        {
            trang_thai: false,
        },
        {
            where: {
                khoa_hoc_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const getByUser = async (req, res) => {
    const courses = await sequelize.query(
        `
        SELECT 
            khoa_hoc.khoa_hoc_id, 
            khoa_hoc.anh_dai_dien, 
            khoa_hoc.ten_khoa_hoc, 
            hoa_don.trang_thai 
        FROM khoa_hoc 
        JOIN hoa_don_chi_tiet ON khoa_hoc.khoa_hoc_id = hoa_don_chi_tiet.san_pham_id 
        JOIN hoa_don ON hoa_don_chi_tiet.hoa_don_id = hoa_don.hoa_don_id 
        WHERE hoa_don.trang_thai = true 
        AND khoa_hoc.trang_thai = true 
        AND hoa_don_chi_tiet.loai_san_pham = 'Khóa học' 
        AND hoa_don.hoc_vien_id = :hoc_vien_id 
        LIMIT 100`,
        {
            replacements: {
                hoc_vien_id: req.params.id,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: courses,
        message: null,
    });
};

const getByUserv2 = async (req, res) => {
    let filter = `WHERE hoa_don_chi_tiet.san_pham_id = khoa_hoc.khoa_hoc_id 
              AND hoa_don_chi_tiet.loai_san_pham = 'Khóa học' 
              AND hoa_don.hoc_vien_id = :hoc_vien_id`;
    let trang_thai = '1';
    if (req.query.trang_thai) {
        trang_thai = req.query.trang_thai;
    }

    filter += ` AND hoa_don.trang_thai = :trang_thai`;

    let courses;

    if (trang_thai === '0') {
        courses = await sequelize.query(
            `
        SELECT * FROM (
            SELECT khoa_hoc.anh_dai_dien, khoa_hoc.ten_khoa_hoc, khoa_hoc.ngay_tao, 
            (SELECT hoa_don.trang_thai 
             FROM hoa_don 
             JOIN hoa_don_chi_tiet ON hoa_don.hoa_don_id = hoa_don_chi_tiet.hoa_don_id
             ${filter} LIMIT 1) AS trang_thai
            FROM khoa_hoc
            EXCEPT
            SELECT khoa_hoc.anh_dai_dien, khoa_hoc.ten_khoa_hoc, hoa_don.trang_thai, khoa_hoc.ngay_tao 
            FROM khoa_hoc
            JOIN hoa_don_chi_tiet ON khoa_hoc.khoa_hoc_id = hoa_don_chi_tiet.san_pham_id 
            JOIN hoa_don ON hoa_don_chi_tiet.hoa_don_id = hoa_don.hoa_don_id
            ${filter}
        ) AS course
        ORDER BY course.ngay_tao DESC LIMIT 100`,
            {
                replacements: {
                    hoc_vien_id: req.params.id,
                    trang_thai: trang_thai,
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );
    } else if (trang_thai === '1') {
        courses = await sequelize.query(
            `
        SELECT khoa_hoc.anh_dai_dien, khoa_hoc.ten_khoa_hoc, hoa_don.trang_thai 
        FROM khoa_hoc
        JOIN hoa_don_chi_tiet ON khoa_hoc.khoa_hoc_id = hoa_don_chi_tiet.san_pham_id 
        JOIN hoa_don ON hoa_don_chi_tiet.hoa_don_id = hoa_don.hoa_don_id
        ${filter}
        ORDER BY khoa_hoc.ngay_tao DESC LIMIT 100`,
            {
                replacements: {
                    hoc_vien_id: req.params.id,
                    trang_thai: trang_thai,
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );
    } else {
        courses = await sequelize.query(
            `
        SELECT khoa_hoc.anh_dai_dien, khoa_hoc.ten_khoa_hoc, 
        (SELECT hoa_don.trang_thai 
         FROM hoa_don 
         JOIN hoa_don_chi_tiet ON hoa_don.hoa_don_id = hoa_don_chi_tiet.hoa_don_id
         ${filter} LIMIT 1) AS trang_thai
        FROM khoa_hoc
        ORDER BY khoa_hoc.ngay_tao DESC LIMIT 100`,
            {
                replacements: {
                    hoc_vien_id: req.params.id,
                    trang_thai: trang_thai,
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );
    }

    return res.status(200).send({
        status: 'success',
        data: courses,
        message: null,
    });
};

const restore = async (req, res) => {
    await Course.update(
        {
            trang_thai: true,
        },
        {
            where: {
                khoa_hoc_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    const course = await Course.findOne({
        where: {
            khoa_hoc_id: req.params.id,
        },
        attributes: ['video_mo_ta', 'anh_dai_dien'],
    });

    if (!course) {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'Course not found',
        });
    }

    if (course.anh_dai_dien && fs.existsSync(`public${course.anh_dai_dien}`)) {
        fs.unlinkSync(`public${course.anh_dai_dien}`);
    }
    if (course.video_mo_ta && fs.existsSync(`public${course.video_mo_ta}`)) {
        fs.unlinkSync(`public${course.video_mo_ta}`);
    }

    await Course.destroy({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });

    await CourseDescription.destroy({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

const getExamSet = async (req, res) => {
    const course = await Course.findOne({
        include: [
            {
                model: CourseMedia,
                required: true,
                include: [
                    {
                        model: Media,
                        attributes: [
                            'tep_tin_id',
                            'ten',
                            'duong_dan',
                            'ngay_tao',
                            'nguoi_tao',
                        ],
                        required: true,
                        include: [
                            {
                                model: Staff,
                                attributes: ['nhan_vien_id', 'ho_ten'],
                            },
                        ],
                    },
                ],
            },
        ],
        where: {
            khoa_hoc_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: course,
        message: null,
    });
};

const getExamSetv2 = async (req, res) => {
    const course = await Course.findOne({
        include: [
            {
                model: CourseMedia,
                // required: true,
                include: [
                    {
                        model: Media,
                        attributes: [
                            'tep_tin_id',
                            'ten',
                            'duong_dan',
                            'ngay_tao',
                            'nguoi_tao',
                        ],
                        // required: true,
                        include: [
                            {
                                model: Staff,
                                attributes: ['nhan_vien_id', 'ho_ten'],
                            },
                        ],
                    },
                ],
            },
        ],
        where: {
            khoa_hoc_id: req.params.id,
        },
    });

    const plainCourse = course.get({ plain: true });

    for (const khoa_hoc_tep_tin of plainCourse.khoa_hoc_tep_tins) {
        if (!khoa_hoc_tep_tin.tep_tin_cha_id) {
            delete khoa_hoc_tep_tin.tep_tin.duong_dan;
        }
    }

    return res.status(200).send({
        status: 'success',
        data: plainCourse,
        message: null,
    });
};

const getExamSetByUser = async (req, res) => {
    const course = await Course.findOne({
        include: [
            {
                model: CourseMedia,
                required: true,
                include: [
                    {
                        model: Media,
                        attributes: ['tep_tin_id', 'ten', 'duong_dan'],
                        required: true,
                    },
                ],
            },
            {
                model: CourseStudent,
                required: true,
            },
        ],
        where: {
            khoa_hoc_id: req.params.id,
            '$khoa_hoc_hoc_viens.hoc_vien_id$': req.userId,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: course,
        message: null,
    });
};

const getReviewExamSet = async (req, res) => {
    const course = await CourseMedia.findOne({
        include: [
            {
                model: Media,
                attributes: ['tep_tin_id', 'ten', 'duong_dan'],
                required: true,
            },
        ],
        where: {
            tep_tin_cha_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: course,
        message: null,
    });
};

const removeExamSet = async (req, res) => {
    const course = await Course.findOne({
        where: {
            khoa_hoc_id: req.params.id,
        },
        attributes: ['anh_dai_dien'],
    });

    if (course && course.anh_dai_dien) {
        const imagePath = `public${course.anh_dai_dien}`;
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    await Course.destroy({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });

    const courseMedias = await CourseMedia.findAll({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });

    for (const courseMedia of courseMedias) {
        const media = await Media.findOne({
            where: {
                tep_tin_id: courseMedia.tep_tin_id,
            },
            attributes: ['duong_dan'], // Chỉ lấy cột 'duong_dan' để tối ưu truy vấn
        });
        if (media && media.duong_dan) {
            const mediaPath = `public${media.duong_dan}`;
            if (fs.existsSync(mediaPath)) {
                fs.unlinkSync(mediaPath);
            }

            await Media.destroy({
                where: {
                    tep_tin_id: courseMedia.tep_tin_id,
                },
            });
        }
    }

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'Course and associated media deleted successfully',
    });
};

const uploadFileExams = async (req, res) => {
    const { files, file_review } = req.files;

    if (
        !files ||
        files.length === 0 ||
        !file_review ||
        file_review.length === 0
    ) {
        return res.status(400).send({
            status: 'error',
            data: null,
            message: 'Both files and file review must be provided.',
        });
    }

    const media = await Media.create({
        loai: checkFileType(files[0]),
        ten: files[0].originalname,
        duong_dan: `${files[0].destination.replace('public', '')}/${
            files[0].filename
        }`,
    });

    await CourseMedia.create({
        tep_tin_id: media.tep_tin_id,
        khoa_hoc_id: req.params.id,
    });

    const media_review = await Media.create({
        loai: checkFileType(file_review[0]),
        ten: file_review[0].originalname,
        duong_dan: `${file_review[0].destination.replace('public', '')}/${
            file_review[0].filename
        }`,
    });

    await CourseMedia.create({
        tep_tin_id: media_review.tep_tin_id,
        khoa_hoc_id: req.params.id,
        tep_tin_cha_id: media.tep_tin_id,
    });

    await Course.update(
        { tai_de: true },
        {
            where: {
                khoa_hoc_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'Files uploaded and course updated successfully.',
    });
};

const updateExamSet = async (req, res) => {
    await CourseMedia.update(
        {
            gia_tien: req.body.gia_tien,
        },
        {
            where: {
                khtt_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const downloadExamSet = async (req, res) => {
    const media = await Media.findOne({
        where: {
            tep_tin_id: req.params.id,
        },
    });

    const course = await Course.findOne({
        include: [
            {
                model: CourseMedia,
                required: true,
                where: {
                    tep_tin_id: req.params.id, // Truy vấn trực tiếp trong include thay vì `where` bên ngoài
                },
            },
            {
                model: CourseStudent,
                required: true,
                where: {
                    hoc_vien_id: req.userId, // Truy vấn trực tiếp trong include thay vì `where` bên ngoài
                },
            },
        ],
    });

    const examSetStudent = await ExamSetStudent.findOne({
        include: [
            {
                model: CourseMedia,
                required: true,
            },
        ],
        where: {
            '$khoa_hoc_tep_tin.tep_tin_id$': req.params.id,
            hoc_vien_id: req.userId,
        },
    });

    if (course || examSetStudent) {
        const filePath = path.join(process.cwd(), '/public', media.duong_dan);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${media.ten}"`
        );
        res.setHeader('Content-Type', 'application/octet-stream');

        return res.sendFile(filePath);
    }

    return res.status(404).json({
        status: 'error',
        message: 'Bạn không có quyền truy cập vào tệp này',
    });
};

const removeFileExam = async (req, res) => {
    const courseMedia = await CourseMedia.findOne({
        where: {
            khtt_id: req.params.id,
        },
    });

    if (!courseMedia) {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'Course media not found.',
        });
    }

    await CourseMedia.destroy({
        where: {
            khtt_id: req.params.id,
        },
    });

    const media = await Media.findOne({
        where: {
            tep_tin_id: courseMedia.tep_tin_id,
        },
    });

    if (media) {
        if (media.duong_dan && fs.existsSync(`public${media.duong_dan}`)) {
            fs.unlinkSync(`public${media.duong_dan}`);
        }

        await Media.destroy({
            where: {
                tep_tin_id: courseMedia.tep_tin_id,
            },
        });
    } else {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'Media not found.',
        });
    }

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'Deleted successfully',
    });
};

const dashboardByTeacher = async (req, res) => {
    const result = await Course.findAll({
        attributes: [
            'giao_vien_id',
            [
                fn('COUNT', literal('DISTINCT `khoa_hoc`.`khoa_hoc_id`')),
                'so_khoa_hoc',
            ],
            [
                fn('COUNT', literal('DISTINCT `mo_duns`.`mo_dun_id`')),
                'so_modun',
            ],
            [
                fn(
                    'COUNT',
                    literal('DISTINCT `mo_duns->chuyen_des`.`chuyen_de_id`')
                ),
                'so_chuyen_de',
            ],
            [
                fn(
                    'COUNT',
                    literal('DISTINCT `khoa_hoc_hoc_viens`.`hoc_vien_id`')
                ),
                'so_hoc_vien',
            ],
        ],
        include: [
            {
                model: Modun,
                attributes: [],
                required: true,
                include: [
                    {
                        model: Thematic,
                        attributes: [],
                        required: true,
                    },
                ],
            },
            {
                model: CourseStudent,
                attributes: [],
                required: true,
            },
        ],
        where: {
            giao_vien_id: req.userId,
        },
        group: ['giao_vien_id'],
        raw: true,
    });

    return res.status(200).send({
        status: 'success',
        data: result,
        message: null,
    });
};

const removeStudent = async (req, res) => {
    const examSetStudent = await ExamSetStudent.findOne({
        where: {
            khtt_id: req.params.khttId,
            hoc_vien_id: req.params.studentId,
        },
    });

    if (!examSetStudent) {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'ExamSet student not found.',
        });
    }

    await ExamSetStudent.destroy({
        where: {
            khtt_id: req.params.khttId,
            hoc_vien_id: req.params.studentId,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'Deleted successfully',
    });
};

module.exports = {
    getStatistical,
    findAll,
    findOne,
    getOfNews,
    getByFilter,
    getAllByProgram,
    create,
    getByUser,
    update,
    remove,
    restore,
    getByProgramId,
    getThematicOfUsers,
    forceDelete,
    getThematicOfUserv2,
    getByUserv2,
    addStudent,
    getStudents,
    getAddStudents,
    getExamSet,
    removeExamSet,
    uploadFileExams,
    removeFileExam,
    getExamSetByUser,
    getReviewExamSet,
    getExamSetv2,
    updateExamSet,
    downloadExamSet,
    dashboardByTeacher,
    findAllv2,
    getStudentsv2,
    removeStudent,
};
