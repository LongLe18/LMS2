const { Course, CourseStudent, Program } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const sequelize = require('../utils/db');

//[GET] course?id
const getAll = async (req, res) => {
    let search = 1;
    let index = 0;
    let sum = 100;
    let trang_thai = 1;
    let kct_id = 1;
    if (req.query.limit) {
        sum = req.query.limit;
    }
    if (req.query.offset) {
        index = req.query.offset;
    }
    if (req.query.kct_id) {
        kct_id = 'khoa_hoc.kct_id=:kct_id';
    }
    if (req.query.trang_thai) {
        trang_thai = 'khoa_hoc.trang_thai=:trang_thai';
    }
    if (req.query.search) {
        search = 'khoa_hoc.ten_khoa_hoc LIKE :search';
    }
    let filter = `WHERE ${kct_id} AND ${trang_thai} AND ${search}`;
    const count = await sequelize.query(
        `
        SELECT COUNT(*) AS tong FROM khoa_hoc ${filter}`,
        {
            replacements: {
                search: `%${decodeURI(req.query.search)}%`,
                kct_id: parseInt(req.query.kct_id),
                ngay_bat_dau1: req.query.ngay_bat_dau,
                ngay_ket_thuc2: req.query.ngay_ket_thuc,
                trang_thai: parseInt(req.query.trang_thai),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    const courses = await sequelize.query(
        `
        SELECT khoa_hoc.*, khung_chuong_trinh.ten_khung_ct, khung_chuong_trinh.loai_kct FROM khoa_hoc LEFT JOIN 
        khung_chuong_trinh ON khoa_hoc.kct_id=khung_chuong_trinh.kct_id ${filter}
        ORDER BY khoa_hoc.ngay_tao DESC LIMIT :index, :sum`,
        {
            replacements: {
                kct_id: parseInt(req.query.kct_id),
                trang_thai: parseInt(req.query.trang_thai),
                search: `%${decodeURI(req.query.search)}%`,
                index: parseInt(index),
                sum: parseInt(sum),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.status(200).send({
        status: 'success',
        data: courses,
        count: count[0].tong,
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
    let ten_hoc_vien = 1;
    let tinh = 1;
    let offset = 0;
    let limit = 100;
    if (req.query.offset) {
        offset = req.query.offset;
    }
    if (req.query.limit) {
        limit = req.query.limit;
    }
    if (req.query.ten_hoc_vien) {
        ten_hoc_vien = 'hoc_vien.ho_ten LIKE :ten_hoc_vien';
    }
    if (req.query.tinh) {
        tinh = 'tinh_thanhpho.ten LIKE :tinh';
    }
    let filter = `WHERE ${tinh} AND ${ten_hoc_vien}`;
    const count = await sequelize.query(
        `
        SELECT ((SELECT COUNT(*) FROM hoc_vien ${filter})-(SELECT COUNT(DISTINCT hoc_vien.hoc_vien_id) 
        FROM hoc_vien JOIN khoa_hoc_hoc_vien ON hoc_vien.hoc_vien_id=khoa_hoc_hoc_vien.hoc_vien_id
        LEFT JOIN tinh_thanhpho ON hoc_vien.ttp_id=tinh_thanhpho.ttp_id ${filter} AND 
        khoa_hoc_hoc_vien.khoa_hoc_id=:khoa_hoc_id )) AS SL`,
        {
            replacements: {
                tinh: `%${decodeURI(req.query.tinh)}%`,
                ten_hoc_vien: `%${decodeURI(req.query.ten_hoc_vien)}%`,
                khoa_hoc_id: parseInt(req.params.id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    const students = await sequelize.query(
        `
        SELECT hoc_vien.hoc_vien_id, hoc_vien.ho_ten, hoc_vien.truong_hoc, tinh_thanhpho.ten AS tinh, 
        hoc_vien.ngay_tao FROM hoc_vien LEFT JOIN tinh_thanhpho ON hoc_vien.ttp_id=tinh_thanhpho.ttp_id ${filter} AND hoc_vien.hoc_vien_id 
        NOT IN (SELECT hoc_vien.hoc_vien_id FROM hoc_vien JOIN khoa_hoc_hoc_vien ON 
        hoc_vien.hoc_vien_id=khoa_hoc_hoc_vien.hoc_vien_id ${filter} AND khoa_hoc_hoc_vien.khoa_hoc_id=:khoa_hoc_id) 
        ORDER BY hoc_vien.ngay_tao DESC LIMIT :offset, :limit`,
        {
            replacements: {
                tinh: `%${decodeURI(req.query.tinh)}%`,
                ten_hoc_vien: `%${decodeURI(req.query.ten_hoc_vien)}%`,
                khoa_hoc_id: parseInt(req.params.id),
                offset: parseInt(offset),
                limit: parseInt(limit),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.status(200).send({
        status: 'success',
        data: students,
        count: count[0].SL,
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
    let search = 1;
    let ngay_bat_dau = 1;
    let ngay_ket_thuc = 1;
    let trang_thai = 1;
    let offset = 0;
    let limit = 100;
    if (req.query.offset) {
        offset = req.query.offset;
    }
    if (req.query.limit) {
        limit = req.query.limit;
    }
    if (req.query.search) {
        search = 'khoa_hoc.ten_khoa_hoc LIKE :search';
    }
    if (req.query.ngay_bat_dau) {
        ngay_bat_dau = `khoa_hoc.ngay_bat_dau BETWEEN '2000-1-1' AND :ngay_bat_dau`;
    }
    if (req.query.ngay_ket_thuc) {
        ngay_ket_thuc = `khoa_hoc.ngay_ket_thuc BETWEEN '2000-1-1' AND :ngay_ket_thuc`;
    }
    if (req.query.trang_thai) {
        trang_thai = 'khoa_hoc.trang_thai=:trang_thai';
    }
    let filter = `WHERE ${trang_thai} AND ${ngay_bat_dau} AND ${ngay_ket_thuc} AND ${search}`;
    const count = await sequelize.query(
        `
        SELECT COUNT(*) AS tong FROM khoa_hoc ${filter}`,
        {
            replacements: {
                search: `%${decodeURI(req.query.search)}%`,
                ngay_bat_dau1: req.query.ngay_bat_dau,
                ngay_ket_thuc2: req.query.ngay_ket_thuc,
                trang_thai: parseInt(req.query.trang_thai),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    const courses = await sequelize.query(
        `
        SELECT khoa_hoc.khoa_hoc_id, khoa_hoc.ten_khoa_hoc, khoa_hoc.anh_dai_dien, khung_chuong_trinh.ten_khung_ct, 
        khoa_hoc.trang_thai, khoa_hoc.ngay_bat_dau, khoa_hoc.ngay_ket_thuc FROM khoa_hoc LEFT JOIN khung_chuong_trinh ON 
        khoa_hoc.kct_id=khung_chuong_trinh.kct_id ${filter} ORDER BY khoa_hoc.ngay_tao DESC LIMIT :offset, :limit`,
        {
            replacements: {
                search: `%${decodeURI(req.query.search)}%`,
                ngay_bat_dau1: req.query.ngay_bat_dau,
                ngay_ket_thuc2: req.query.ngay_ket_thuc,
                trang_thai: parseInt(req.query.trang_thai),
                offset: parseInt(offset),
                limit: parseInt(limit),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.status(200).send({
        status: 'success',
        data: courses,
        count: count[0].tong,
        message: null,
    });
};

const getStudents = async (req, res) => {
    let ten_hoc_vien = 1;
    let tinh = 1;
    let offset = 0;
    let limit = 100;
    if (req.query.offset) {
        offset = req.query.offset;
    }
    if (req.query.limit) {
        limit = req.query.limit;
    }
    if (req.query.ten_hoc_vien) {
        ten_hoc_vien = 'hoc_vien.ho_ten LIKE :ten_hoc_vien';
    }
    if (req.query.tinh) {
        tinh = 'tinh_thanhpho.ten LIKE :tinh';
    }
    let filter = `AND ${tinh} AND ${ten_hoc_vien}`;
    const count = await sequelize.query(
        `
        SELECT COUNT(DISTINCT hoc_vien.hoc_vien_id) AS SL FROM hoc_vien JOIN khoa_hoc_hoc_vien ON 
        hoc_vien.hoc_vien_id=khoa_hoc_hoc_vien.hoc_vien_id LEFT JOIN tinh_thanhpho ON hoc_vien.ttp_id=tinh_thanhpho.ttp_id
        WHERE khoa_hoc_hoc_vien.khoa_hoc_id=:khoa_hoc_id ${filter}`,
        {
            replacements: {
                tinh: `%${decodeURI(req.query.tinh)}%`,
                ten_hoc_vien: `%${decodeURI(req.query.ten_hoc_vien)}%`,
                khoa_hoc_id: parseInt(req.params.id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    const students = await sequelize.query(
        `
        SELECT hoc_vien.hoc_vien_id, hoc_vien.ho_ten, hoc_vien.email, hoc_vien.sdt, hoc_vien.truong_hoc, tinh_thanhpho.ten AS tinh, khoa_hoc_hoc_vien.ngay_tao, khoa_hoc_hoc_vien.khhv_id
        FROM hoc_vien JOIN khoa_hoc_hoc_vien ON hoc_vien.hoc_vien_id=khoa_hoc_hoc_vien.hoc_vien_id LEFT JOIN tinh_thanhpho ON 
        hoc_vien.ttp_id=tinh_thanhpho.ttp_id WHERE khoa_hoc_hoc_vien.khoa_hoc_id=:khoa_hoc_id ${filter}
        ORDER BY khoa_hoc_hoc_vien.ngay_tao DESC LIMIT :offset, :limit`,
        {
            replacements: {
                tinh: `%${decodeURI(req.query.tinh)}%`,
                ten_hoc_vien: `%${decodeURI(req.query.ten_hoc_vien)}%`,
                khoa_hoc_id: parseInt(req.params.id),
                offset: parseInt(offset),
                limit: parseInt(limit),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.status(200).send({
        status: 'success',
        data: students,
        count: count[0].SL,
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
    let search = '1';
    let kct_id = '1';
    let offset = 0;
    let limit = 100;
    let trang_thai = '1';
    if (req.query.trang_thai) {
        trang_thai = `khoa_hoc.trang_thai=:trang_thai`;
    }
    if (req.query.kct_id) {
        kct_id = `khung_chuong_trinh.kct_id=:kct_id`;
    }
    if (req.query.search) {
        search = 'khoa_hoc.ten_khoa_hoc LIKE :search';
    }
    if (req.query.offset) {
        offset = req.query.offset;
    }
    if (req.query.limit) {
        limit = req.query.limit;
    }
    let filter = `WHERE ${search} AND ${kct_id} AND ${trang_thai}`;
    const count = await sequelize.query(
        `
        SELECT COUNT(*) AS tong FROM khoa_hoc ${filter}`,
        {
            replacements: {
                search: `%${decodeURI(req.query.search)}%`,
                kct_id: parseInt(req.query.kct_id),
                trang_thai: parseInt(req.query.trang_thai),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    let courses = await sequelize.query(
        `
        SELECT khoa_hoc.khoa_hoc_id, khoa_hoc.ten_khoa_hoc, khoa_hoc.trang_thai, khoa_hoc.ngay_bat_dau, khoa_hoc.ngay_ket_thuc, 
        khung_chuong_trinh.ten_khung_ct, (SELECT COUNT(DISTINCT khoa_hoc_hoc_vien.hoc_vien_id) FROM khoa_hoc_hoc_vien 
        WHERE khoa_hoc_hoc_vien.khoa_hoc_id=khoa_hoc.khoa_hoc_id) AS so_luong FROM khoa_hoc LEFT JOIN 
        khung_chuong_trinh ON khoa_hoc.kct_id=khung_chuong_trinh.kct_id ${filter} ORDER BY khoa_hoc.ngay_tao DESC LIMIT :offset, :limit`,
        {
            replacements: {
                search: `%${decodeURI(req.query.search)}%`,
                kct_id: parseInt(req.query.kct_id),
                trang_thai: parseInt(req.query.trang_thai),
                limit: parseInt(limit),
                offset: parseInt(offset),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.status(200).send({
        status: 'success',
        data: courses,
        count: count[0].tong,
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
};
