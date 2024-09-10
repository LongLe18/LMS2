const {
    Exceprt,
    Answer,
    Question,
    Exam,
    ExamQuestion,
    SyntheticCriteria,
    ModunCriteria,
    ThematicCriteria,
    StudentExam,
    OnlineCriteria,
    Course,
    SelectedAnswer,
    ExceprtType,
} = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../utils/db');
const fs = require('fs');
const { parse, extname } = require('path');
const path = require('path');

const getExamOnline = async (req, res) => {
    let khoa_hoc_id = 1;
    let limit = 100;
    if (req.query.khoa_hoc_id) {
        khoa_hoc_id = 'de_thi.khoa_hoc_id=:khoa_hoc_id';
    }
    if (req.query.limit) {
        limit = req.query.limit;
    }
    const exams = await sequelize.query(
        `
        SELECT * FROM ((SELECT de_thi.de_thi_id, de_thi.ten_de_thi, de_thi.anh_dai_dien, tieu_chi_de_thi_online.so_cau_hoi, tieu_chi_de_thi_online.thoi_gian, de_thi.ngay_tao
        FROM de_thi JOIN tieu_chi_de_thi_online ON de_thi.khoa_hoc_id=tieu_chi_de_thi_online.khoa_hoc_id WHERE de_thi.ten_de_thi 
        IS NOT NULL AND de_thi.khoa_hoc_id=:khoa_hoc_id AND trang_thai=true AND de_thi.loai_de_thi_id=4 ORDER BY de_thi.ten_de_thi ASC) UNION 
        (SELECT de_thi.de_thi_id, de_thi.ten_de_thi, de_thi.anh_dai_dien, tieu_chi_de_thi_online.so_cau_hoi, tieu_chi_de_thi_online.thoi_gian, de_thi.ngay_tao
        FROM de_thi JOIN tieu_chi_de_thi_online ON de_thi.khoa_hoc_id=tieu_chi_de_thi_online.khoa_hoc_id WHERE de_thi.de_thi_ma
        IS NULL AND ${khoa_hoc_id} AND trang_thai=true AND de_thi.loai_de_thi_id=4 ORDER BY de_thi.ten_de_thi ASC)) AS de_thi ORDER BY de_thi.ten_de_thi LIMIT :limit`,
        {
            replacements: {
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
                limit: parseInt(limit),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.status(200).send({
        status: 'success',
        data: exams,
        message: null,
    });
};

// lấy danh sách đề thi đánh giá năng lực
const getExamDGNL = async (req, res) => {
    const { count, rows } = await Exam.findAndCountAll({
        include: [
            {
                model: OnlineCriteria,
            },
            {
                model: Course,
                attributes: ['ten_khoa_hoc'], // Include the ten_khoa_hoc field
            },
        ],
        where: {
            ...(req.query.kct_id && { kct_id: req.query.kct_id }),
            ...(req.query.trang_thai && { trang_thai: req.query.trang_thai }),
            ...(req.query.xuat_ban && { xuat_ban: req.query.xuat_ban }),
            ...(req.query.khoa_hoc_id && {
                khoa_hoc_id: req.query.khoa_hoc_id,
            }),
            de_mau: true,
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

const getSynthetic = async (req, res) => {
    let khoa_hoc_id = 1;
    let limit = 100;
    if (req.query.khoa_hoc_id) {
        khoa_hoc_id = 'de_thi.khoa_hoc_id=:khoa_hoc_id';
    }
    if (req.query.limit) {
        limit = req.query.limit;
    }
    const exams = await sequelize.query(
        `
        SELECT * FROM ((SELECT de_thi.de_thi_id, de_thi.ten_de_thi, de_thi.anh_dai_dien, tieu_chi_de_tong_hop.so_cau_hoi, tieu_chi_de_tong_hop.thoi_gian, de_thi.ngay_tao
        FROM de_thi JOIN tieu_chi_de_tong_hop ON de_thi.khoa_hoc_id=tieu_chi_de_tong_hop.khoa_hoc_id WHERE de_thi.ten_de_thi 
        IS NOT NULL AND de_thi.khoa_hoc_id=:khoa_hoc_id AND trang_thai=true AND de_thi.loai_de_thi_id=3 ORDER BY de_thi.ten_de_thi ASC) UNION 
        (SELECT de_thi.de_thi_id, de_thi.ten_de_thi, de_thi.anh_dai_dien, tieu_chi_de_tong_hop.so_cau_hoi, tieu_chi_de_tong_hop.thoi_gian, de_thi.ngay_tao
        FROM de_thi JOIN tieu_chi_de_tong_hop ON de_thi.khoa_hoc_id=tieu_chi_de_tong_hop.khoa_hoc_id WHERE de_thi.de_thi_ma
        IS NULL AND ${khoa_hoc_id} AND trang_thai=true AND de_thi.loai_de_thi_id=3 ORDER BY de_thi.ten_de_thi ASC)) AS de_thi ORDER BY de_thi.ten_de_thi LIMIT :limit`,
        {
            replacements: {
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
                limit: parseInt(limit),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.status(200).send({
        status: 'success',
        data: exams,
        message: null,
    });
};

const getSyntheticNew = async (req, res) => {
    const exams = await sequelize.query(
        `
        SELECT * FROM de_thi WHERE de_thi.loai_de_thi_id=3 ORDER BY de_thi.ngay_tao LIMIT 10`,
        {
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.status(200).send({
        status: 'success',
        data: exams,
        message: null,
    });
};

const getOneExam = async (req, res) => {
    let filter = {};
    if (req.query.loai_de_thi_id)
        filter.loai_de_thi_id = req.query.loai_de_thi_id;
    if (req.query.mo_dun_id) filter.mo_dun_id = req.query.mo_dun_id;
    if (req.query.chuyen_de_id) filter.chuyen_de_id = req.query.chuyen_de_id;
    const examUseds = await Exam.findAll({
        include: {
            model: StudentExam,
            attributes: [],
        },
        attributes: ['de_thi_id'],
        where: {
            ...filter,
            xuat_ban: true,
            '$de_thi_hoc_viens.hoc_vien_id$': req.userId,
        },
    });
    let de_thi_ids = [];
    for (const examUsed of examUseds) {
        de_thi_ids.push(examUsed.de_thi_id);
    }
    let criteria;
    if (req.query.loai_de_thi_id == 1) {
        criteria = await ThematicCriteria.findOne({
            where: {
                mo_dun_id: req.query.mo_dun_id,
            },
        });
    } else if (req.query.loai_de_thi_id == 2) {
        criteria = await ModunCriteria.findOne({
            where: {
                mo_dun_id: req.query.mo_dun_id,
            },
        });
    }
    if (criteria) {
        if (examUseds.length >= criteria.so_lan_thi) {
            res.status(404).send({
                status: 'fail',
                data: null,
                message: 'enough times',
            });
            return;
        }
    } else {
        res.status(404).send({
            status: 'fail',
            data: null,
            message: 'no criteria',
        });
        return;
    }
    let exam;
    if (req.query.loai_de_thi_id == 1) {
        exam = await Exam.findOne({
            where: {
                ...filter,
                trang_thai: true,
            },
            order: sequelize.literal('rand()'),
        });
    } else {
        exam = await Exam.findOne({
            where: {
                ...filter,
                trang_thai: true,
                // de_thi_id: {
                //     [Op.not]: de_thi_ids,
                // },
            },
            order: sequelize.literal('rand()'),
        });
    }
    if (exam) {
        exam.dataValues.thoi_gian = criteria.thoi_gian;
        exam.dataValues.so_cau_hoi = criteria.so_cau_hoi;
        res.status(200).send({
            status: 'success',
            data: exam,
            message: null,
        });
    } else {
        res.status(404).send({
            status: 'error',
            data: null,
            message: 'no exam',
        });
    }
};

const getAll_admin = async (req, res) => {
    let search = 1;
    let trang_thai = 1;
    let loai_de_thi_id = 1;
    let xuat_ban = 1;
    let khoa_hoc_id = 1;
    let mo_dun_id = 1;
    let chuyen_de_id = 1;
    let ngay_tao = 1;
    let offset = 0;
    let limit = 200;
    if (req.query.offset) {
        offset = req.query.offset;
    }
    if (req.query.limit) {
        limit = req.query.limit;
    }
    if (req.query.search) {
        search = 'de_thi.ten_de_thi LIKE :search';
    }
    if (req.query.ngay_bat_dau && req.query.ngay_ket_thuc) {
        ngay_tao = 'de_thi.ngay_tao BETWEEN :ngay_bat_dau AND :ngay_ket_thuc';
    }
    if (req.query.trang_thai) {
        trang_thai = 'de_thi.trang_thai=:trang_thai';
    }
    if (req.query.loai_de_thi_id) {
        loai_de_thi_id = 'de_thi.loai_de_thi_id=:loai_de_thi_id';
    }
    if (req.query.xuat_ban) {
        xuat_ban = 'de_thi.xuat_ban=:xuat_ban';
    }
    if (req.query.khoa_hoc_id) {
        khoa_hoc_id = 'de_thi.khoa_hoc_id=:khoa_hoc_id';
    }
    if (req.query.mo_dun_id) {
        mo_dun_id = 'de_thi.mo_dun_id=:mo_dun_id';
    }
    if (req.query.chuyen_de_id) {
        chuyen_de_id = 'de_thi.chuyen_de_id=:chuyen_de_id';
    }
    let filter = `${search} AND ${trang_thai} AND ${loai_de_thi_id} AND ${xuat_ban} AND ${khoa_hoc_id} AND ${mo_dun_id} AND ${chuyen_de_id} AND ${ngay_tao}`;
    const totalRecords = await sequelize.query(
        `
        SELECT COUNT(*) as tong FROM (
        (
            SELECT de_thi.de_thi_id, de_thi.anh_dai_dien, de_thi.ten_de_thi, de_thi.trang_thai, de_thi.ngay_tao, loai_de_thi.mo_ta, loai_de_thi.loai_de_thi_id, 
            de_thi.de_mau, khoa_hoc.ten_khoa_hoc, mo_dun.ten_mo_dun, chuyen_de.ten_chuyen_de, de_thi.xuat_ban, tieu_chi_de_chuyen_de.so_cau_hoi, 
            tieu_chi_de_chuyen_de.thoi_gian FROM de_thi LEFT JOIN khoa_hoc ON de_thi.khoa_hoc_id=khoa_hoc.khoa_hoc_id LEFT JOIN 
            mo_dun ON de_thi.mo_dun_id=mo_dun.mo_dun_id LEFT JOIN chuyen_de ON chuyen_de.chuyen_de_id=de_thi.chuyen_de_id 
            LEFT JOIN tieu_chi_de_chuyen_de ON de_thi.mo_dun_id=tieu_chi_de_chuyen_de.mo_dun_id LEFT JOIN loai_de_thi ON 
            loai_de_thi.loai_de_thi_id=de_thi.loai_de_thi_id WHERE de_thi.loai_de_thi_id=1 AND ${filter} AND (de_thi.kct_id <> 1 OR de_thi.kct_id IS NULL)
        ) 
        UNION (
            SELECT de_thi.de_thi_id, de_thi.anh_dai_dien, de_thi.ten_de_thi, de_thi.trang_thai, de_thi.ngay_tao, loai_de_thi.mo_ta, loai_de_thi.loai_de_thi_id,
            de_thi.de_mau, khoa_hoc.ten_khoa_hoc, mo_dun.ten_mo_dun, 'No' AS ten_chuyen_de, de_thi.xuat_ban, tieu_chi_de_mo_dun.so_cau_hoi, 
            tieu_chi_de_mo_dun.thoi_gian FROM de_thi LEFT JOIN khoa_hoc ON de_thi.khoa_hoc_id=khoa_hoc.khoa_hoc_id 
            LEFT JOIN mo_dun ON de_thi.mo_dun_id=mo_dun.mo_dun_id LEFT JOIN tieu_chi_de_mo_dun ON de_thi.mo_dun_id=tieu_chi_de_mo_dun.mo_dun_id 
            LEFT JOIN loai_de_thi ON loai_de_thi.loai_de_thi_id=de_thi.loai_de_thi_id WHERE de_thi.loai_de_thi_id=2 AND ${filter} AND (de_thi.kct_id <> 1 OR de_thi.kct_id IS NULL)
        ) 
        UNION (
            SELECT de_thi.de_thi_id, de_thi.anh_dai_dien, de_thi.ten_de_thi, de_thi.trang_thai, de_thi.ngay_tao, loai_de_thi.mo_ta, loai_de_thi.loai_de_thi_id, 
            de_thi.de_mau, khoa_hoc.ten_khoa_hoc, 'No' AS ten_mo_dun, 'No' AS ten_chuyen_de, de_thi.xuat_ban, tieu_chi_de_tong_hop.so_cau_hoi, 
            tieu_chi_de_tong_hop.thoi_gian FROM de_thi LEFT JOIN khoa_hoc ON de_thi.khoa_hoc_id=khoa_hoc.khoa_hoc_id LEFT JOIN tieu_chi_de_tong_hop ON 
            de_thi.khoa_hoc_id=tieu_chi_de_tong_hop.khoa_hoc_id LEFT JOIN loai_de_thi ON loai_de_thi.loai_de_thi_id=de_thi.loai_de_thi_id 
            WHERE de_thi.loai_de_thi_id=3 AND ${filter} AND (de_thi.kct_id <> 1 OR de_thi.kct_id IS NULL)
        ) 
        UNION (
            SELECT de_thi.de_thi_id, de_thi.anh_dai_dien, de_thi.ten_de_thi, de_thi.trang_thai, de_thi.ngay_tao, loai_de_thi.mo_ta, loai_de_thi.loai_de_thi_id, 
            de_thi.de_mau, khoa_hoc.ten_khoa_hoc, 'No' AS ten_mo_dun, 'No' AS ten_chuyen_de, de_thi.xuat_ban, tieu_chi_de_thi_online.so_cau_hoi, 
            tieu_chi_de_thi_online.thoi_gian FROM de_thi LEFT JOIN khoa_hoc ON de_thi.khoa_hoc_id=khoa_hoc.khoa_hoc_id LEFT JOIN tieu_chi_de_thi_online ON
            de_thi.khoa_hoc_id=tieu_chi_de_thi_online.khoa_hoc_id LEFT JOIN loai_de_thi ON loai_de_thi.loai_de_thi_id=de_thi.loai_de_thi_id 
            WHERE de_thi.loai_de_thi_id=4 AND ${filter} AND (de_thi.kct_id <> 1 OR de_thi.kct_id IS NULL))
        ) AS exam ORDER BY exam.ten_de_thi ASC`,
        {
            replacements: {
                search: `%${decodeURI(req.query.search)}%`,
                ngay_bat_dau: req.query.ngay_bat_dau,
                ngay_ket_thuc: req.query.ngay_ket_thuc,
                trang_thai: parseInt(req.query.trang_thai),
                loai_de_thi_id: parseInt(req.query.loai_de_thi_id),
                xuat_ban: parseInt(req.query.xuat_ban),
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
                mo_dun_id: parseInt(req.query.mo_dun_id),
                chuyen_de_id: parseInt(req.query.chuyen_de_id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    const exams = await sequelize.query(
        `
        SELECT * FROM (
        (
            SELECT de_thi.de_thi_id, de_thi.anh_dai_dien, de_thi.ten_de_thi, de_thi.trang_thai, de_thi.ngay_tao, loai_de_thi.mo_ta, loai_de_thi.loai_de_thi_id, 
            de_thi.de_mau, khoa_hoc.ten_khoa_hoc, mo_dun.ten_mo_dun, chuyen_de.ten_chuyen_de, de_thi.xuat_ban, tieu_chi_de_chuyen_de.so_cau_hoi, 
            tieu_chi_de_chuyen_de.thoi_gian FROM de_thi LEFT JOIN khoa_hoc ON de_thi.khoa_hoc_id=khoa_hoc.khoa_hoc_id LEFT JOIN 
            mo_dun ON de_thi.mo_dun_id=mo_dun.mo_dun_id LEFT JOIN chuyen_de ON chuyen_de.chuyen_de_id=de_thi.chuyen_de_id 
            LEFT JOIN tieu_chi_de_chuyen_de ON de_thi.mo_dun_id=tieu_chi_de_chuyen_de.mo_dun_id LEFT JOIN loai_de_thi ON 
            loai_de_thi.loai_de_thi_id=de_thi.loai_de_thi_id WHERE de_thi.loai_de_thi_id=1 AND ${filter} AND (de_thi.kct_id <> 1 OR de_thi.kct_id IS NULL)
        ) 
        UNION (
            SELECT de_thi.de_thi_id, de_thi.anh_dai_dien, de_thi.ten_de_thi, de_thi.trang_thai, de_thi.ngay_tao, loai_de_thi.mo_ta, loai_de_thi.loai_de_thi_id,
            de_thi.de_mau, khoa_hoc.ten_khoa_hoc, mo_dun.ten_mo_dun, 'No' AS ten_chuyen_de, de_thi.xuat_ban, tieu_chi_de_mo_dun.so_cau_hoi, 
            tieu_chi_de_mo_dun.thoi_gian FROM de_thi LEFT JOIN khoa_hoc ON de_thi.khoa_hoc_id=khoa_hoc.khoa_hoc_id 
            LEFT JOIN mo_dun ON de_thi.mo_dun_id=mo_dun.mo_dun_id LEFT JOIN tieu_chi_de_mo_dun ON de_thi.mo_dun_id=tieu_chi_de_mo_dun.mo_dun_id 
            LEFT JOIN loai_de_thi ON loai_de_thi.loai_de_thi_id=de_thi.loai_de_thi_id WHERE de_thi.loai_de_thi_id=2 AND ${filter} AND (de_thi.kct_id <> 1 OR de_thi.kct_id IS NULL)
        ) 
        UNION (
            SELECT de_thi.de_thi_id, de_thi.anh_dai_dien, de_thi.ten_de_thi, de_thi.trang_thai, de_thi.ngay_tao, loai_de_thi.mo_ta, loai_de_thi.loai_de_thi_id, 
            de_thi.de_mau, khoa_hoc.ten_khoa_hoc, 'No' AS ten_mo_dun, 'No' AS ten_chuyen_de, de_thi.xuat_ban, tieu_chi_de_tong_hop.so_cau_hoi, 
            tieu_chi_de_tong_hop.thoi_gian FROM de_thi LEFT JOIN khoa_hoc ON de_thi.khoa_hoc_id=khoa_hoc.khoa_hoc_id LEFT JOIN tieu_chi_de_tong_hop ON 
            de_thi.khoa_hoc_id=tieu_chi_de_tong_hop.khoa_hoc_id LEFT JOIN loai_de_thi ON loai_de_thi.loai_de_thi_id=de_thi.loai_de_thi_id 
            WHERE de_thi.loai_de_thi_id=3 AND ${filter} AND (de_thi.kct_id <> 1 OR de_thi.kct_id IS NULL)
        ) 
        UNION (
            SELECT de_thi.de_thi_id, de_thi.anh_dai_dien, de_thi.ten_de_thi, de_thi.trang_thai, de_thi.ngay_tao, loai_de_thi.mo_ta, loai_de_thi.loai_de_thi_id, 
            de_thi.de_mau, khoa_hoc.ten_khoa_hoc, 'No' AS ten_mo_dun, 'No' AS ten_chuyen_de, de_thi.xuat_ban, tieu_chi_de_thi_online.so_cau_hoi, 
            tieu_chi_de_thi_online.thoi_gian FROM de_thi LEFT JOIN khoa_hoc ON de_thi.khoa_hoc_id=khoa_hoc.khoa_hoc_id LEFT JOIN tieu_chi_de_thi_online ON
            de_thi.khoa_hoc_id=tieu_chi_de_thi_online.khoa_hoc_id LEFT JOIN loai_de_thi ON loai_de_thi.loai_de_thi_id=de_thi.loai_de_thi_id 
            WHERE de_thi.loai_de_thi_id=4 AND ${filter} AND (de_thi.kct_id <> 1 OR de_thi.kct_id IS NULL))
        ) AS exam ORDER BY exam.ten_de_thi ASC LIMIT :offset, :limit`,
        {
            replacements: {
                search: `%${decodeURI(req.query.search)}%`,
                ngay_bat_dau: req.query.ngay_bat_dau,
                ngay_ket_thuc: req.query.ngay_ket_thuc,
                trang_thai: parseInt(req.query.trang_thai),
                loai_de_thi_id: parseInt(req.query.loai_de_thi_id),
                xuat_ban: parseInt(req.query.xuat_ban),
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
                mo_dun_id: parseInt(req.query.mo_dun_id),
                chuyen_de_id: parseInt(req.query.chuyen_de_id),
                limit: parseInt(limit),
                offset: parseInt(offset) * parseInt(limit),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.status(200).send({
        status: 'success',
        data: exams,
        message: null,
        pageSize: parseInt(limit),
        pageIndex: parseInt(offset),
        total: totalRecords[0].tong,
    });
};

const getById = async (req, res) => {
    let exam = await Exam.findOne({
        where: {
            de_thi_id: req.params.id,
        },
    });
    if (exam.de_mau) {
        exam = await Exam.findOne({
            include: {
                model: ExamQuestion,
                include: {
                    model: Question,
                    include: [
                        {
                            model: Answer,
                        },
                        {
                            model: Exceprt,
                            include: {
                                model: ExceprtType,
                            },
                        },
                    ],
                },
            },
            where: {
                de_thi_id: req.params.id,
            },
            order: [
                [
                    sequelize.literal(
                        `FIELD(cau_hoi_de_this.chuyen_nganh_id, ${[
                            1, 7, 3, 4, 6, 8, 9, 5,
                        ].join(', ')})`
                    ),
                ],
                [sequelize.col('dap_an_id'), 'ASC'],
            ],
        });
    } else {
        let queryOptions = {
            include: {
                model: ExamQuestion,
                include: {
                    model: Question,
                    include: [
                        {
                            model: Answer,
                        },
                        {
                            model: Exceprt,
                            include: {
                                model: ExceprtType,
                            },
                        },
                    ],
                },
            },
            where: {
                de_thi_id: req.params.id,
            },
            order: [
                [sequelize.col('phan'), 'ASC'],
                [sequelize.col('dap_an_id'), 'ASC'],
            ],
        };

        // Nếu có dthv_id trong query, thêm điều kiện SelectedAnswer
        if (req.query.dthv_id) {
            queryOptions.include.include.include.push({
                model: SelectedAnswer,
                where: { dthv_id: Number(req.query.dthv_id) },
            });
        }
        exam = await Exam.findOne(queryOptions);
    }

    let criteria;
    if (exam) {
        if (exam.loai_de_thi_id == 1) {
            criteria = await ThematicCriteria.findOne({
                where: {
                    mo_dun_id: exam.mo_dun_id,
                },
            });
        } else if (exam.loai_de_thi_id == 2) {
            criteria = await ModunCriteria.findOne({
                where: {
                    mo_dun_id: exam.mo_dun_id,
                },
            });
        } else if (exam.loai_de_thi_id == 3) {
            criteria = await SyntheticCriteria.findOne({
                where: {
                    khoa_hoc_id: exam.khoa_hoc_id,
                },
            });
        } else if (exam.loai_de_thi_id == 4) {
            criteria = await OnlineCriteria.findOne({
                where: {
                    khoa_hoc_id: exam.khoa_hoc_id,
                },
            });
        }
        if (criteria && exam.loai_de_thi_id !== 4) {
            exam.dataValues.so_cau_hoi = criteria.so_cau_hoi;
            exam.dataValues.thoi_gian = criteria.thoi_gian;
        } else if (criteria && exam.loai_de_thi_id === 4) {
            exam.dataValues.so_cau_hoi = criteria.so_cau_hoi;
            exam.dataValues.thoi_gian = criteria.thoi_gian;
            exam.dataValues.so_phan = criteria.so_phan;
            for (let i = 0; i < criteria.so_phan; i++) {
                exam.dataValues[`so_cau_hoi_phan_${i + 1}`] =
                    criteria[`so_cau_hoi_phan_${i + 1}`];
                exam.dataValues[`yeu_cau_phan_${i + 1}`] =
                    criteria[`yeu_cau_phan_${i + 1}`];
                exam.dataValues[`thoi_gian_phan_${i + 1}`] =
                    criteria[`thoi_gian_phan_${i + 1}`];
            }
        } else {
            res.status(404).send({
                status: 'error',
                data: null,
                message: 'no criteria',
            });
            return;
        }
    }
    let dap_an_dungs;
    let exceprtFrom;
    let exceprtTo;
    for (var index1 = 0; index1 < exam.cau_hoi_de_this.length; index1++) {
        dap_an_dungs = [];
        if (exam.cau_hoi_de_this[index1].cau_hoi.trich_doan_id) {
            if (
                index1 == 0 ||
                exam.cau_hoi_de_this[index1].cau_hoi.trich_doan_id !=
                    exam.cau_hoi_de_this[index1 - 1].cau_hoi.trich_doan_id
            ) {
                exceprtFrom = exceprtTo = index1;
                for (
                    var index3 = index1 + 1;
                    index3 < exam.cau_hoi_de_this.length;
                    index3++
                ) {
                    if (
                        exam.cau_hoi_de_this[index1].cau_hoi.trich_doan_id ==
                        exam.cau_hoi_de_this[index3].cau_hoi.trich_doan_id
                    )
                        exceprtTo = index3;
                }
                exam.cau_hoi_de_this[index1].cau_hoi.dataValues.exceprtFrom =
                    exceprtFrom;
                exam.cau_hoi_de_this[index1].cau_hoi.dataValues.exceprtTo =
                    exceprtTo;
            }
        }
        for (
            var index2 = 0;
            index2 < exam.cau_hoi_de_this[index1].cau_hoi.dap_ans.length;
            index2++
        ) {
            if (
                exam.cau_hoi_de_this[index1].cau_hoi.dap_ans[index2].dap_an_dung
            )
                dap_an_dungs.push(index2);
            exam.cau_hoi_de_this[index1].cau_hoi.dataValues.dap_an_dungs =
                dap_an_dungs;
        }
    }
    res.status(200).send({
        status: 'success',
        data: exam,
        message: null,
    });
};

// dùng cho thi đánh giá năng lực mới
const getByIdv2 = async (req, res) => {
    let exam = await Exam.findOne({
        where: {
            de_thi_id: req.params.id,
        },
    });
    let criteria;
    if (exam) {
        criteria = await SyntheticCriteria.findOne({
            where: {
                khoa_hoc_id: exam.khoa_hoc_id,
            },
        });
        if (!criteria) {
            res.status(404).send({
                status: 'error',
                data: null,
                message: 'no criteria',
            });
            return;
        }
    }
    if (Number(req.query.phan) === 1) {
        const count = await ExamQuestion.count({
            where: {
                de_thi_id: exam.de_thi_id,
                phan: 1,
            },
        });
        if (count === 0)
            await sequelize.query(
                `
                INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan)
                    SELECT cau_hoi_id, :de_thi_id, 1 FROM cau_hoi
                    WHERE chuyen_nganh_id = 1 AND kct_id = 1
                    ORDER BY RAND() LIMIT ${criteria.so_cau_hoi_phan_1}
            `,
                {
                    type: sequelize.QueryTypes.INSERT,
                    replacements: {
                        de_thi_id: Number(req.params.id),
                    },
                }
            );
    } else if (Number(req.query.phan) === 2) {
        const count = await ExamQuestion.count({
            where: {
                de_thi_id: exam.de_thi_id,
                phan: 2,
            },
        });
        if (count === 0)
            await sequelize.query(
                `
                INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan)
                    SELECT cau_hoi_id, :de_thi_id, 2 FROM cau_hoi
                    WHERE chuyen_nganh_id = 7 AND kct_id = 1
                    ORDER BY trich_doan_id DESC, RAND()
                    LIMIT ${criteria.so_cau_hoi_phan_2}
            `,
                {
                    type: sequelize.QueryTypes.INSERT,
                    replacements: {
                        de_thi_id: Number(req.params.id),
                    },
                }
            );
    } else if (Number(req.query.phan) === 3) {
        const count = await ExamQuestion.count({
            where: {
                de_thi_id: exam.de_thi_id,
                phan: 3,
            },
        });
        if (count === 0) {
            let so_cau_hoi_phan_3 = 0;
            for (const chuyen_nganh_id of req.query.chuyen_nganh_ids.split(
                ','
            )) {
                let so_cau_hoi_chuyen_de =
                    Number(chuyen_nganh_id) === 3
                        ? criteria.so_cau_hoi_chuyen_nganh_1
                        : Number(chuyen_nganh_id) === 4
                        ? criteria.so_cau_hoi_chuyen_nganh_2
                        : Number(chuyen_nganh_id) === 6
                        ? criteria.so_cau_hoi_chuyen_nganh_3
                        : Number(chuyen_nganh_id) === 8
                        ? criteria.so_cau_hoi_chuyen_nganh_4
                        : criteria.so_cau_hoi_chuyen_nganh_5;
                so_cau_hoi_phan_3 += so_cau_hoi_chuyen_de;
                await sequelize.query(
                    `
                INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan)
                    SELECT cau_hoi_id, :de_thi_id, 3 FROM cau_hoi
                    WHERE chuyen_nganh_id = :chuyen_nganh_id AND kct_id = 1
                    ORDER BY RAND() LIMIT ${so_cau_hoi_chuyen_de}
            `,
                    {
                        type: sequelize.QueryTypes.INSERT,
                        replacements: {
                            de_thi_id: Number(req.params.id),
                            chuyen_nganh_id: Number(chuyen_nganh_id),
                        },
                    }
                );
            }
            await sequelize.query(
                `
            INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan)
                SELECT cau_hoi_id, :de_thi_id, 3 FROM cau_hoi
                WHERE chuyen_nganh_id IN (:chuyen_nganh_ids) AND kct_id = 1
                AND cau_hoi_id NOT IN (SELECT cau_hoi_de_thi
                WHERE de_thi_id = :de_thi_id)
                ORDER BY RAND() LIMIT ${
                    criteria.so_cau_hoi_phan_3 - so_cau_hoi_phan_3
                }
        `,
                {
                    type: sequelize.QueryTypes.INSERT,
                    replacements: {
                        de_thi_id: Number(req.params.id),
                        chuyen_nganh_ids: req.query.chuyen_nganh_ids,
                    },
                }
            );
        }
    }
    exam = await Exam.findOne({
        include: {
            model: ExamQuestion,
            include: {
                model: Question,
                include: [
                    {
                        model: Answer,
                    },
                    {
                        model: Exceprt,
                    },
                ],
            },
            where: {
                phan: Number(req.query.phan),
            },
        },
        where: {
            de_thi_id: req.params.id,
        },
        order: [[sequelize.col('dap_an_id'), 'ASC']],
    });
    exam.dataValues.so_cau_hoi = criteria.so_cau_hoi;
    exam.dataValues.thoi_gian = criteria.thoi_gian;
    exam.dataValues.so_cau_hoi_phan_1 = criteria.so_cau_hoi_phan_1;
    exam.dataValues.thoi_gian_phan_1 = criteria.thoi_gian_phan_1;
    exam.dataValues.so_cau_hoi_phan_2 = criteria.so_cau_hoi_phan_2;
    exam.dataValues.thoi_gian_phan_2 = criteria.thoi_gian_phan_2;
    exam.dataValues.so_cau_hoi_phan_3 = criteria.so_cau_hoi_phan_3;
    exam.dataValues.thoi_gian_phan_3 = criteria.thoi_gian_phan_3;
    let dap_an_dungs;
    let exceprtFrom;
    let exceprtTo;
    for (var index1 = 0; index1 < exam.cau_hoi_de_this.length; index1++) {
        dap_an_dungs = [];
        if (exam.cau_hoi_de_this[index1].cau_hoi.trich_doan_id) {
            if (
                index1 == 0 ||
                exam.cau_hoi_de_this[index1].cau_hoi.trich_doan_id !=
                    exam.cau_hoi_de_this[index1 - 1].cau_hoi.trich_doan_id
            ) {
                exceprtFrom = exceprtTo = index1;
                for (
                    var index3 = index1 + 1;
                    index3 < exam.cau_hoi_de_this.length;
                    index3++
                ) {
                    if (
                        exam.cau_hoi_de_this[index1].cau_hoi.trich_doan_id ==
                        exam.cau_hoi_de_this[index3].cau_hoi.trich_doan_id
                    )
                        exceprtTo = index3;
                }
                exam.cau_hoi_de_this[index1].cau_hoi.dataValues.exceprtFrom =
                    exceprtFrom;
                exam.cau_hoi_de_this[index1].cau_hoi.dataValues.exceprtTo =
                    exceprtTo;
            }
        }
        for (
            var index2 = 0;
            index2 < exam.cau_hoi_de_this[index1].cau_hoi.dap_ans.length;
            index2++
        ) {
            if (
                exam.cau_hoi_de_this[index1].cau_hoi.dap_ans[index2].dap_an_dung
            )
                dap_an_dungs.push(index2);
            exam.cau_hoi_de_this[index1].cau_hoi.dataValues.dap_an_dungs =
                dap_an_dungs;
        }
    }
    res.status(200).send({
        status: 'success',
        data: exam,
        message: null,
    });
};

const postCreate = async (req, res) => {
    try {
        let exam;
        if (req.body.de_thi_ma) {
            exam = await Exam.findOne({
                where: {
                    de_thi_ma: req.body.de_thi_ma,
                },
            });
            if (exam) {
                res.status(404).send({
                    status: 'error',
                    data: null,
                    message: 'Đã tồn tại mã đề',
                });
                return;
            }
            let criteria;
            if (req.body.loai_de_thi_id == '1') {
                criteria = await ThematicCriteria.findOne({
                    where: {
                        mo_dun_id: req.body.mo_dun_id,
                    },
                });
            } else if (req.body.loai_de_thi_id == '2') {
                criteria = await ModunCriteria.findOne({
                    where: {
                        mo_dun_id: req.body.mo_dun_id,
                    },
                });
            } else if (req.body.loai_de_thi_id === '3') {
                criteria = await SyntheticCriteria.findOne({
                    where: {
                        khoa_hoc_id: req.body.khoa_hoc_id,
                    },
                });
            } else if (req.body.loai_de_thi_id === '4') {
                criteria = await OnlineCriteria.findOne({
                    where: {
                        khoa_hoc_id: req.body.khoa_hoc_id,
                    },
                });
            } else {
                res.status(404).send({
                    status: 'error',
                    data: null,
                    message: null,
                });
            }
            if (!criteria) {
                res.status(404).send({
                    status: 'fail',
                    data: '100',
                    message: 'Chưa có tiêu chí đề thi',
                });
            } else {
                await Exam.create({
                    ...req.body,
                });

                res.status(200).send({
                    status: 'success',
                    data: exam,
                    message: null,
                });
            }
        } else {
            res.status(404).send({
                status: 'fail',
                data: null,
                message: 'Chưa nhập mã đề thi',
            });
        }
    } catch (error) {
        res.status(404).send({
            status: 'error',
            data: null,
            message: error,
        });
    }
};

const getUpdate = async (req, res) => {
    const exam = await Exam.findOne({
        where: {
            de_thi_id: req.params.id,
        },
    });
    res.send({
        status: 'success',
        data: exam,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    if (req.file) {
        const exam = await Exam.findOne({
            where: {
                de_thi_id: req.params.id,
            },
        });
        if (exam.anh_dai_dien && fs.existsSync(`public${exam.anh_dai_dien}`))
            fs.unlinkSync(`public${exam.anh_dai_dien}`);
    }
    await Exam.update(
        {
            ...req.body,
        },
        {
            where: {
                de_thi_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const publish = async (req, res) => {
    const exam = await Exam.findOne({
        attributes: ['xuat_ban', 'de_mau', 'khoa_hoc_id'],
        where: {
            de_thi_id: req.params.id,
        },
    });
    if (exam.xuat_ban) {
        await Exam.update(
            {
                xuat_ban: false,
                trang_thai: false,
            },
            {
                where: {
                    de_thi_id: req.params.id,
                },
            }
        );
    } else {
        if (exam.de_mau) {
            const condition = await sequelize.query(
                `
                SELECT ((SELECT COUNT(*) FROM cau_hoi_de_thi WHERE de_thi_id = :de_thi_id AND chuyen_nganh_id = 1) >= 50
                AND (SELECT COUNT(*) FROM cau_hoi_de_thi WHERE de_thi_id = :de_thi_id AND chuyen_nganh_id = 7) >= 50
                AND (SELECT COUNT(*) FROM cau_hoi_de_thi WHERE de_thi_id = :de_thi_id AND chuyen_nganh_id = 3) >= 17
                AND (SELECT COUNT(*) FROM cau_hoi_de_thi WHERE de_thi_id = :de_thi_id AND chuyen_nganh_id = 4) >= 17
                AND (SELECT COUNT(*) FROM cau_hoi_de_thi WHERE de_thi_id = :de_thi_id AND chuyen_nganh_id = 5) >= 50
                AND (SELECT COUNT(*) FROM cau_hoi_de_thi WHERE de_thi_id = :de_thi_id AND chuyen_nganh_id = 6) >= 17
                AND (SELECT COUNT(*) FROM cau_hoi_de_thi WHERE de_thi_id = :de_thi_id AND chuyen_nganh_id = 8) >= 17
                AND (SELECT COUNT(*) FROM cau_hoi_de_thi WHERE de_thi_id = :de_thi_id AND chuyen_nganh_id = 9) >= 17
                AND (SELECT COUNT(*) FROM cau_hoi_de_thi WHERE de_thi_id = :de_thi_id) >= 150) AS bool`,
                {
                    replacements: { de_thi_id: Number(req.params.id) },
                    type: sequelize.QueryTypes.SELECT,
                }
            );
            if (condition[0].bool) {
                await Exam.update(
                    {
                        trang_thai: false,
                    },
                    {
                        where: {
                            de_mau: true,
                            khoa_hoc_id: exam.khoa_hoc_id,
                        },
                    }
                );
                let criteria = await OnlineCriteria.findOne({
                    where: {
                        khoa_hoc_id: exam.khoa_hoc_id,
                    },
                });
                if (!criteria) {
                    await OnlineCriteria.create({
                        so_phan: 3,
                        khoa_hoc_id: exam.khoa_hoc_id,
                        so_cau_hoi: 50,
                        thoi_gian: 195,
                        so_cau_hoi_phan_1: 50,
                        thoi_gian_phan_1: 75,
                        yeu_cau_phan_1: 0,
                        so_cau_hoi_phan_2: 50,
                        thoi_gian_phan_2: 60,
                        yeu_cau_phan_2: 0,
                        so_cau_hoi_phan_3: 50,
                        thoi_gian_phan_3: 60,
                        yeu_cau_phan_3: 0,
                    });
                }
            } else {
                return res.status(404).send({
                    status: 'error',
                    data: null,
                    message: 'Số lượng câu hỏi chưa đủ yêu cầu',
                });
            }
        }

        let tong_diem = 0;
        let questions = await sequelize.query(
            `
            SELECT cau_hoi.diem FROM cau_hoi JOIN cau_hoi_de_thi ON 
            cau_hoi.cau_hoi_id=cau_hoi_de_thi.cau_hoi_id WHERE cau_hoi_de_thi.de_thi_id = :de_thi_id
            `,
            {
                replacements: { de_thi_id: req.params.id },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        questions.forEach((question) => {
            if (question.diem) tong_diem += parseFloat(question.diem);
        });
        await Exam.update(
            {
                xuat_ban: true,
                tong_diem: tong_diem,
                trang_thai: true,
            },
            {
                where: {
                    de_thi_id: req.params.id,
                },
            }
        );
    }

    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const stateChange = async (req, res) => {
    const exam = await Exam.findOne({
        where: {
            de_thi_id: req.params.id,
        },
    });
    if (exam.trang_thai) {
        await Exam.update(
            {
                trang_thai: false,
            },
            {
                where: {
                    de_thi_id: req.params.id,
                },
            }
        );
    } else {
        await Exam.update(
            {
                trang_thai: true,
            },
            {
                where: {
                    de_thi_id: req.params.id,
                },
            }
        );
    }
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    try {
        const exam = await Exam.findOne({
            where: {
                de_thi_id: req.params.id,
            },
        });
        if (
            exam &&
            exam.anh_dai_dien &&
            fs.existsSync(`public${exam.anh_dai_dien}`)
        )
            fs.unlinkSync(`public${exam.anh_dai_dien}`);
        if (fs.existsSync(`public/Picture/word/media/${req.params.id}`)) {
            fs.rmSync(`public/Picture/word/media/${req.params.id}`, {
                recursive: true,
                force: true,
            });
        }
        await Exceprt.destroy({
            where: {
                de_thi_id: req.params.id,
            },
        });
        await Question.destroy({
            where: {
                de_thi_id: req.params.id,
            },
        });
        await Answer.destroy({
            where: {
                de_thi_id: req.params.id,
            },
        });
        await Exam.destroy({
            where: {
                de_thi_id: req.params.id,
            },
        });
        await ExamQuestion.destroy({
            where: {
                de_thi_id: req.params.id,
            },
        });
    } catch (err) {
        console.log(err);
    }
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

const clearAll = async (req, res) => {
    const exams = await findAll();
    for (const exam of exams) {
        if (exam.anh_dai_dien && fs.existsSync(`public${exam.anh_dai_dien}`))
            fs.unlinkSync(`public${exam.anh_dai_dien}`);
    }
    await sequelize.query('DELETE FROM de_thi', {
        type: sequelize.QueryTypes.DELETE,
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'cleared',
    });
};

const reuse = async (req, res) => {
    const examOld = await Exam.findOne({
        where: {
            de_thi_id: req.params.id,
        },
        attributes: [
            'ten_de_thi',
            'mo_ta',
            'tong_diem',
            'anh_dai_dien',
            'loai_de_thi_id',
            'kct_id',
            'khoa_hoc_id',
            'mo_dun_id',
            'chuyen_de_id',
            'de_mau',
            'chuyen_nganh_id',
        ],
    });
    const examNew = await Exam.create({
        ...examOld.dataValues,
    });
    let examQuestionOlds = await ExamQuestion.findAll({
        where: {
            de_thi_id: req.params.id,
        },
        attributes: ['cau_hoi_id'],
    });
    let examQuestionNews = [];
    for (const examQuestionOld of examQuestionOlds) {
        examQuestionNews.push({
            de_thi_id: examNew.de_thi_id,
            cau_hoi_id: examQuestionOld.cau_hoi_id,
            chuyen_nganh_id: examQuestionOld.chuyen_nganh_id,
        });
    }
    await ExamQuestion.bulkCreate(examQuestionNews);
    res.status(200).send({
        status: 'success',
        data: examNew,
        message: null,
    });
};

const studentStatistic = async (req, res) => {
    let limit = 100;
    let search = 1;
    let ngay_thi = 1;
    let tinh = 1;
    if (req.query.limit) {
        limit = req.query.limit;
    }
    if (req.query.index) {
        index = req.query.index;
    }
    if (req.query.ngay_bat_dau && req.query.ngay_ket_thuc) {
        ngay_thi = `de_thi_hoc_vien.thoi_diem_bat_dau BETWEEN :ngay_bat_dau AND :ngay_ket_thuc`;
    }
    if (req.query.search) {
        search = 'hoc_vien.ho_ten LIKE :search';
    }
    if (req.query.tinh) {
        tinh = 'hoc_vien.ttp_id LIKE :tinh';
    }
    let filter = `AND ${ngay_thi} AND ${search} AND ${tinh}`;
    const total = await sequelize.query(
        `
        SELECT COUNT(*) AS total FROM de_thi_hoc_vien WHERE de_thi_hoc_vien.thoi_diem_ket_thuc IS NOT NULL AND 
        de_thi_hoc_vien.de_thi_id=:de_thi_id`,
        {
            replacements: {
                de_thi_id: parseInt(req.params.id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    const students = await sequelize.query(
        `
        SELECT hoc_vien.ho_ten, hoc_vien.sdt, tinh_thanhpho.ten as tinh, hoc_vien.truong_hoc, de_thi_hoc_vien.dthv_id,
        de_thi_hoc_vien.so_cau_tra_loi_dung, de_thi_hoc_vien.so_cau_tra_loi_sai, de_thi_hoc_vien.diem_cac_phan,
        (de_thi_hoc_vien.ket_qua_diem/de_thi.tong_diem)*10 AS diem_so, de_thi_hoc_vien.thoi_diem_bat_dau as ngay_thi
        FROM hoc_vien LEFT JOIN tinh_thanhpho ON hoc_vien.ttp_id=tinh_thanhpho.ttp_id JOIN de_thi_hoc_vien ON 
        de_thi_hoc_vien.hoc_vien_id=hoc_vien.hoc_vien_id JOIN de_thi ON de_thi_hoc_vien.de_thi_id=de_thi.de_thi_id
        WHERE de_thi_hoc_vien.thoi_diem_ket_thuc IS NOT NULL AND 
        de_thi_hoc_vien.de_thi_id=:de_thi_id ${filter} ORDER BY diem_so desc LIMIT :limit OFFSET :offset`,
        {
            replacements: {
                de_thi_id: parseInt(req.params.id),
                limit: parseInt(req.query.limit),
                offset: (parseInt(req.query.index) - 1) * parseInt(limit),
                ngay_bat_dau: req.query.ngay_bat_dau,
                ngay_ket_thuc: req.query.ngay_ket_thuc,
                search: `%${decodeURI(req.query.search)}%`,
                tinh: `%${decodeURI(req.query.tinh)}%`,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.status(200).send({
        status: 'success',
        data: students,
        total: total[0].total,
        message: null,
    });
};

const uploadWordMedia = async (req, res) => {
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'Upload file thành công',
    });
};

module.exports = {
    getExamOnline,
    getSynthetic,
    getOneExam,
    getAll_admin,
    getById,
    postCreate,
    getUpdate,
    putUpdate,
    publish,
    stateChange,
    forceDelete,
    clearAll,
    reuse,
    getSyntheticNew,
    studentStatistic,
    uploadWordMedia,
    getByIdv2,
    getExamDGNL,
};
