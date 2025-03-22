const {
    Course,
    CourseStudent,
    Program,
    Student,
    Province,
    CourseType,
    CourseMedia,
    Media,
} = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const sequelize = require('../utils/db');
const { checkFileType } = require('../middlewares/upload');

//[GET] course?id
const getAll = async (req, res) => {
    const { count, rows } = await Course.findAndCountAll({
        include: [
            {
                model: Program,
                attributes: ['kct_id', 'ten_khung_ct', 'loai_kct'],
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

    res.status(200).send({
        status: 'success',
        data: rows,
        pageIndex: Number(req.query.pageIndex || 1),
        pageSize: Number(req.query.pageSize || 10),
        totalCount: count,
        totalPage: Math.ceil(count / Number(req.query.pageSize || 10)),
        message: null,
    });
};

const getAllByProgram = async (req, res) => {
    const courses = await Program.findAll({
        include: [
            {
                model: Course,
                attributes: ['khoa_hoc_id', 'ten_khoa_hoc'],
            },
        ],
    });
    res.status(200).send({
        status: 'success',
        data: courses,
        message: null,
    });
};

//lay danh sach hoc vien chua duoc them vao khoa hoc
const getAddStudents = async (req, res) => {
    const studentIds = await sequelize.query(
        `SELECT hoc_vien_id FROM khoa_hoc_hoc_vien
        WHERE khoa_hoc_hoc_vien.khoa_hoc_id = :khoa_hoc_id `,
        {
            replacements: {
                khoa_hoc_id: Number(req.params.id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

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
            hoc_vien_id: {
                [Op.notIn]: studentIds.map((item) => item.hoc_vien_id),
            },
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

    res.status(200).send({
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
    await sequelize.query(
        `INSERT INTO khoa_hoc_hoc_vien(khoa_hoc_id, hoc_vien_id)
        SELECT :khoa_hoc_id, hoc_vien_id FROM hoc_vien WHERE hoc_vien_id IN (${req.body.hoc_vien_id
            .split(',')
            .map((item) => parseInt(item))
            .join(',')})
        AND hoc_vien_id NOT IN (SELECT hoc_vien_id FROM khoa_hoc_hoc_vien WHERE khoa_hoc_id = :khoa_hoc_id)`,
        {
            replacements: {
                khoa_hoc_id: parseInt(req.params.id),
            },
            type: sequelize.QueryTypes.INSERT,
        }
    );

    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const getThematicOfUsers = async (req, res) => {
    let khoa_hoc_id = 1;
    if (req.query.khoa_hoc_id) {
        khoa_hoc_id = `khoa_hoc.khoa_hoc_id=:khoa_hoc_id`;
    }
    let filter = `WHERE ${khoa_hoc_id} AND khoa_hoc_hoc_vien.hoc_vien_id=${req.userId}`;
    let thematics = await sequelize.query(
        `
        SELECT khoa_hoc.khoa_hoc_id, khoa_hoc.ten_khoa_hoc, (SELECT COUNT(DISTINCT de_thi.chuyen_de_id) FROM de_thi 
        JOIN de_thi_hoc_vien ON de_thi.de_thi_id=de_thi_hoc_vien.de_thi_id WHERE de_thi_hoc_vien.hoc_vien_id=${req.userId} AND 
        de_thi.loai_de_thi_id=1 AND de_thi.khoa_hoc_id=khoa_hoc.khoa_hoc_id AND de_thi_hoc_vien.dat_yeu_cau=true) AS 
        chuyen_de_da_hoc, (SELECT COUNT(chuyen_de_id) FROM chuyen_de JOIN mo_dun ON chuyen_de.mo_dun_id=mo_dun.mo_dun_id 
        WHERE mo_dun.khoa_hoc_id=khoa_hoc.khoa_hoc_id) AS tong_chuyen_de FROM khoa_hoc JOIN khoa_hoc_hoc_vien ON 
        khoa_hoc.khoa_hoc_id=khoa_hoc_hoc_vien.khoa_hoc_id ${filter}`,
        {
            replacements: {
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    const mark = await sequelize.query(
        `
        SELECT SUM(de_thi_hoc_vien.ket_qua_diem) AS diem FROM de_thi_hoc_vien WHERE de_thi_hoc_vien.hoc_vien_id=${req.userId}`,
        { type: sequelize.QueryTypes.SELECT }
    );
    const num = await sequelize.query(
        `
        SELECT COUNT(de_thi_hoc_vien.de_thi_id) AS so_bai_lam FROM de_thi_hoc_vien WHERE de_thi_hoc_vien.hoc_vien_id=${req.userId}`,
        { type: sequelize.QueryTypes.SELECT }
    );
    let data = {
        chuyen_de: thematics,
        diem: mark[0].diem,
        so_bai_lam: num[0].so_bai_lam,
    };
    res.status(200).send({
        status: 'success',
        data: data,
        message: null,
    });
};

const getThematicOfUserv2 = async (req, res) => {
    const courses = await sequelize.query(
        `
        SELECT khoa_hoc.* FROM khoa_hoc JOIN khoa_hoc_hoc_vien ON khoa_hoc.khoa_hoc_id=khoa_hoc_hoc_vien.khoa_hoc_id 
        WHERE khoa_hoc_hoc_vien.hoc_vien_id=${req.userId} LIMIT 100`,
        { type: sequelize.QueryTypes.SELECT }
    );
    let thematics = [];
    let thematic;
    let data = [];
    if (req.query.loai == 1) {
        for (const course of courses) {
            thematics = [];
            for (var index = 29; index >= 0; index--) {
                thematic = await sequelize.query(
                    `
                    SELECT COUNT(DISTINCT de_thi.chuyen_de_id) AS chuyen_de_da_hoc FROM de_thi JOIN de_thi_hoc_vien ON 
                    de_thi.de_thi_id=de_thi_hoc_vien.de_thi_id WHERE de_thi_hoc_vien.hoc_vien_id=${req.userId} AND de_thi.loai_de_thi_id=1 
                    AND de_thi.khoa_hoc_id=${course.khoa_hoc_id} AND de_thi_hoc_vien.dat_yeu_cau=true AND 
                    DATEDIFF(NOW(), de_thi_hoc_vien.ngay_tao)=${index}`,
                    { type: sequelize.QueryTypes.SELECT }
                );
                thematics.push(thematic[0]);
            }
            data.push({
                khoa_hoc_id: course.khoa_hoc_id,
                ten_khoa_hoc: course.ten_khoa_hoc,
                chuyen_de_da_hocs: thematics,
            });
        }
    } else if (req.query.loai == 2) {
        for (const course of courses) {
            thematics = [];
            for (var index = 15; index >= 0; index--) {
                thematic = await sequelize.query(
                    `
                    SELECT COUNT(DISTINCT de_thi.chuyen_de_id) AS chuyen_de_da_hoc FROM de_thi JOIN de_thi_hoc_vien ON 
                    de_thi.de_thi_id=de_thi_hoc_vien.de_thi_id WHERE de_thi_hoc_vien.hoc_vien_id=8 AND de_thi.loai_de_thi_id=1 
                    AND de_thi.khoa_hoc_id=${
                        course.khoa_hoc_id
                    } AND de_thi_hoc_vien.dat_yeu_cau=true AND 
                    DATEDIFF(NOW(), de_thi_hoc_vien.ngay_tao)<${
                        (index + 1) * 7
                    } AND DATEDIFF(NOW(), de_thi_hoc_vien.ngay_tao)>=${
                        index * 7
                    }`,
                    { type: sequelize.QueryTypes.SELECT }
                );
                thematics.push(thematic[0]);
            }
            data.push({
                khoa_hoc_id: course.khoa_hoc_id,
                ten_khoa_hoc: course.ten_khoa_hoc,
                chuyen_de_da_hocs: thematics,
            });
        }
    }
    res.status(200).send({
        status: 'success',
        data: data,
        message: null,
    });
};

const getOfNews = async (req, res) => {
    let limit = 10;
    if (req.query.limit) {
        limit = req.query.limit;
    }
    const courses = await sequelize.query(
        `
        SELECT khoa_hoc.*, khung_chuong_trinh.ten_khung_ct FROM khoa_hoc 
        JOIN khung_chuong_trinh ON khoa_hoc.kct_id=khung_chuong_trinh.kct_id WHERE khoa_hoc.trang_thai=true 
        ORDER BY khoa_hoc.ngay_bat_dau DESC LIMIT :limit`,
        {
            replacements: {
                limit: parseInt(limit),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.status(200).send({
        status: 'success',
        data: courses,
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

    res.status(200).send({
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

const getByIDProgram = async (req, res) => {
    const courses = await sequelize.query(
        `
        SELECT khoa_hoc.* FROM khoa_hoc WHERE trang_thai=true AND kct_id=${req.params.id}`,
        { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).send({
        status: 'success',
        data: courses,
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

    res.status(200).send({
        status: 'success',
        data: rows,
        pageIndex: Number(req.query.pageIndex || 1),
        pageSize: Number(req.query.pageSize || 10),
        totalCount: count,
        totalPage: Math.ceil(count / Number(req.query.pageSize || 10)),
        message: null,
    });
};

//[GET] course/:id
const getById = async (req, res) => {
    const course = await Course.findOne({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });
    const program = await Program.findOne({
        where: {
            kct_id: course.kct_id,
        },
    });
    course.dataValues.loai_kct = program.loai_kct;
    res.status(200).send({
        status: 'success',
        data: course,
        message: null,
    });
};

//[POST] course/create
const postCreate = async (req, res) => {
    const course = await Course.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: course,
        message: null,
    });
};

//[GET] course/:id/edit
const getUpdate = async (req, res) => {
    const course = await Course.findOne({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: course,
        message: null,
    });
};

//[PUT] course/:id
const putUpdate = async (req, res) => {
    if (req.files) {
        const course = await Course.findOne({
            where: {
                khoa_hoc_id: req.params.id,
            },
            attributes: ['video_mo_ta', 'anh_dai_dien'],
        });
        if (
            req.files['video_mo_ta'] &&
            course.video_mo_ta &&
            fs.existsSync(`public${course.video_mo_ta}`)
        )
            fs.unlinkSync(`public${course.video_mo_ta}`);
        if (
            req.files['anh_dai_dien'] &&
            course.anh_dai_dien &&
            fs.existsSync(`public${course.anh_dai_dien}`)
        )
            fs.unlinkSync(`public${course.anh_dai_dien}`);
    }
    await Course.update(
        {
            ...req.body,
        },
        {
            where: {
                khoa_hoc_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[DELETE] course/:id
const deleteById = async (req, res) => {
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
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const getByUser = async (req, res) => {
    const courses = await sequelize.query(
        `
        SELECT khoa_hoc.khoa_hoc_id, khoa_hoc.anh_dai_dien, khoa_hoc.ten_khoa_hoc, hoa_don.trang_thai FROM khoa_hoc JOIN 
        hoa_don_chi_tiet ON khoa_hoc.khoa_hoc_id=hoa_don_chi_tiet.san_pham_id JOIN hoa_don ON 
        hoa_don_chi_tiet.hoa_don_id=hoa_don.hoa_don_id WHERE hoa_don.trang_thai=true AND khoa_hoc.trang_thai=true 
        AND hoa_don_chi_tiet.loai_san_pham='Khóa học' AND hoa_don.hoc_vien_id=:hoc_vien_id LIMIT 100`,
        {
            replacements: {
                hoc_vien_id: req.params.id,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.status(200).send({
        status: 'success',
        data: courses,
        message: null,
    });
};

const getByUserv2 = async (req, res) => {
    let filter;
    let trang_thai = '1';
    if (req.query.trang_thai) {
        trang_thai = `hoa_don.trang_thai=${req.query.trang_thai}`;
    }
    filter = `WHERE hoa_don_chi_tiet.san_pham_id=khoa_hoc.khoa_hoc_id AND hoa_don_chi_tiet.loai_san_pham='Khóa học' AND hoa_don.hoc_vien_id=${req.params.id} AND ${trang_thai}`;
    let courses;
    if (req.query.trang_thai == '0') {
        courses = await sequelize.query(
            `
            SELECT * FROM (SELECT khoa_hoc.anh_dai_dien, khoa_hoc.ten_khoa_hoc, khoa_hoc.ngay_tao, (SELECT hoa_don.trang_thai 
            FROM hoa_don JOIN hoa_don_chi_tiet ON hoa_don.hoa_don_id=hoa_don_chi_tiet.hoa_don_id ${filter} LIMIT 1) 
            AS trang_thai FROM khoa_hoc
            EXCEPT
            SELECT khoa_hoc.anh_dai_dien, khoa_hoc.ten_khoa_hoc, hoa_don.trang_thai, khoa_hoc.ngay_tao FROM khoa_hoc
            JOIN hoa_don_chi_tiet ON khoa_hoc.khoa_hoc_id=hoa_don_chi_tiet.san_pham_id 
            JOIN hoa_don ON hoa_don_chi_tiet.hoa_don_id=hoa_don.hoa_don_id ${filter}) AS course
            ORDER BY course.ngay_tao DESC LIMIT 100`,
            { type: sequelize.QueryTypes.SELECT }
        );
    } else if (req.query.trang_thai == '1') {
        courses = await sequelize.query(
            `
            SELECT khoa_hoc.anh_dai_dien, khoa_hoc.ten_khoa_hoc, hoa_don.trang_thai FROM khoa_hoc
            JOIN hoa_don_chi_tiet ON khoa_hoc.khoa_hoc_id=hoa_don_chi_tiet.san_pham_id 
            JOIN hoa_don ON hoa_don_chi_tiet.hoa_don_id=hoa_don.hoa_don_id ${filter}
            ORDER BY khoa_hoc.ngay_tao DESC LIMIT 100`,
            { type: sequelize.QueryTypes.SELECT }
        );
    } else {
        courses = await sequelize.query(
            `
            SELECT khoa_hoc.anh_dai_dien, khoa_hoc.ten_khoa_hoc, (SELECT hoa_don.trang_thai 
            FROM hoa_don JOIN hoa_don_chi_tiet ON hoa_don.hoa_don_id=hoa_don_chi_tiet.hoa_don_id ${filter} LIMIT 1) 
            AS trang_thai FROM khoa_hoc ORDER BY khoa_hoc.ngay_tao DESC LIMIT 100`,
            { type: sequelize.QueryTypes.SELECT }
        );
    }
    res.status(200).send({
        status: 'success',
        data: courses,
        message: null,
    });
};

//[PATCH] course/:id/restore
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
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[DELETE] course/:id/force
const forceDelete = async (req, res) => {
    const course = await Course.findOne({
        where: {
            khoa_hoc_id: req.params.id,
        },
        attributes: ['video_mo_ta', 'anh_dai_dien'],
    });
    if (course.anh_dai_dien && fs.existsSync(`public${course.anh_dai_dien}`))
        fs.unlinkSync(`public${course.anh_dai_dien}`);
    if (course.video_mo_ta && fs.existsSync(`public${course.video_mo_ta}`))
        fs.unlinkSync(`public${course.video_mo_ta}`);
    await Course.destroy({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
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
                        attributes: ['tep_tin_id', 'ten', 'duong_dan'],
                        required: true,
                    },
                ],
            },
        ],
        where: {
            khoa_hoc_id: req.params.id,
        },
    });

    res.status(200).send({
        status: 'success',
        data: course,
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
            '$khoa_hoc_hoc_viens.hoc_vien_id$': req.userId
        },
    });

    res.status(200).send({
        status: 'success',
        data: course,
        message: null,
    });
};

const deleteExamSet = async (req, res) => {
    const course = await Course.findOne({
        where: {
            khoa_hoc_id: req.params.id,
        },
        attributes: ['anh_dai_dien'],
    });
    if (course.anh_dai_dien && fs.existsSync(`public${Course.anh_dai_dien}`))
        fs.unlinkSync(`public${course.anh_dai_dien}`);

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
        });
        if (media.duong_dan && fs.existsSync(`public${media.duong_dan}`))
            fs.unlinkSync(`public${media.duong_dan}`);
        await Media.destroy({
            where: {
                tep_tin_id: courseMedia.tep_tin_id,
            },
        });
    }

    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const uploadFileExams = async (req, res) => {
    const { files } = req.files;

    if (files.length === 0) {
        res.status(400).send({
            status: 'error',
            data: null,
            message: null,
        });
    }

    for (const file of files) {
        const media = await Media.create({
            loai: checkFileType(file),
            ten: file.originalname,
            duong_dan: `${file.destination.replace('public', '')}/${
                file.filename
            }`,
        });
        await CourseMedia.create({
            tep_tin_id: media.tep_tin_id,
            khoa_hoc_id: req.params.id,
        });
    }

    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const deleteFileExam = async (req, res) => {
    const courseMedia = await CourseMedia.findOne({
        where: {
            khtt_id: req.params.id,
        },
    });
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
    if (media.duong_dan && fs.existsSync(`public${media.duong_dan}`))
        fs.unlinkSync(`public${media.duong_dan}`);
    await Media.destroy({
        where: {
            tep_tin_id: courseMedia.tep_tin_id,
        },
    });

    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    getStatistical,
    getAll,
    getById,
    getOfNews,
    getByFilter,
    getAllByProgram,
    postCreate,
    getUpdate,
    getByUser,
    putUpdate,
    deleteById,
    restore,
    getByIDProgram,
    getThematicOfUsers,
    forceDelete,
    getThematicOfUserv2,
    getByUserv2,
    addStudent,
    getStudents,
    getAddStudents,
    getExamSet,
    deleteExamSet,
    uploadFileExams,
    deleteFileExam,
    getExamSetByUser
};
