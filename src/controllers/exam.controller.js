const sequelize = require('../utils/db');
const fs = require('fs');

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
    DGNLCriteria,
    QuestionDetail,
    Option,
    DGTDCriteria,
} = require('../models');

function generateCombinations(arr, k) {
    let results = [];

    function combine(temp, start) {
        if (temp.length === k) {
            results.push([...temp]);
            return;
        }

        for (let i = start; i < arr.length; i++) {
            temp.push(arr[i]);
            combine(temp, i + 1);
            temp.pop();
        }
    }

    combine([], 0);
    return results;
}

const getExamOnline = async (req, res) => {
    const whereConditions = [];
    const replacements = {};

    if (req.query.khoa_hoc_id) {
        whereConditions.push('de_thi.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = parseInt(req.query.khoa_hoc_id);
    } else {
        // Nếu không truyền thì default là 1
        whereConditions.push('de_thi.khoa_hoc_id = 1');
    }

    whereConditions.push('de_thi.trang_thai = true');
    whereConditions.push('de_thi.loai_de_thi_id = 4');
    whereConditions.push(
        '(de_thi.ten_de_thi IS NOT NULL OR de_thi.de_thi_ma IS NULL)'
    );

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    // Lấy pageSize và pageIndex từ query, mặc định pageSize là 100, pageIndex là 1
    const pageSize = parseInt(req.query.pageSize || 10);
    const pageIndex = parseInt(req.query.pageIndex || 1);
    const offset = (pageIndex - 1) * pageSize;

    const limit = pageSize; // limit cho câu lệnh SQL

    const exams = await sequelize.query(
        `
        SELECT de_thi.de_thi_id, de_thi.ten_de_thi, de_thi.anh_dai_dien, 
            tieu_chi_de_thi_online.so_cau_hoi, tieu_chi_de_thi_online.thoi_gian, 
            de_thi.ngay_tao
        FROM de_thi
        JOIN tieu_chi_de_thi_online ON de_thi.khoa_hoc_id = tieu_chi_de_thi_online.khoa_hoc_id
        ${whereClause}
        ORDER BY de_thi.ten_de_thi ASC
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements: {
                ...replacements,
                limit: limit,
                offset: offset,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    // Lấy tổng số kết quả để tính toán số trang
    const totalResult = await sequelize.query(
        `
        SELECT COUNT(*) AS total 
        FROM de_thi
        JOIN tieu_chi_de_thi_online ON de_thi.khoa_hoc_id = tieu_chi_de_thi_online.khoa_hoc_id
        ${whereClause}
        `,
        {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = totalResult[0].total;
    const totalPage = Math.ceil(totalCount / pageSize);

    return res.status(200).send({
        status: 'success',
        data: exams,
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPage: totalPage,
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
    const whereConditions = [];
    const replacements = {};

    if (req.query.khoa_hoc_id) {
        whereConditions.push('de_thi.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = parseInt(req.query.khoa_hoc_id);
    }

    whereConditions.push('de_thi.trang_thai = true');
    whereConditions.push('de_thi.loai_de_thi_id = 3');
    whereConditions.push(
        '(de_thi.ten_de_thi IS NOT NULL OR de_thi.de_thi_ma IS NULL)'
    );

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const pageSize = parseInt(req.query.pageSize || 100);
    const pageIndex = parseInt(req.query.pageIndex || 1);
    const offset = (pageIndex - 1) * pageSize; // Tính toán offset cho phân trang

    const exams = await sequelize.query(
        `
        SELECT de_thi.de_thi_id, de_thi.ten_de_thi, de_thi.anh_dai_dien, 
            tieu_chi_de_tong_hop.so_cau_hoi, tieu_chi_de_tong_hop.thoi_gian, 
            de_thi.ngay_tao
        FROM de_thi
        JOIN tieu_chi_de_tong_hop ON de_thi.khoa_hoc_id = tieu_chi_de_tong_hop.khoa_hoc_id
        ${whereClause}
        ORDER BY de_thi.ten_de_thi ASC
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements: {
                ...replacements,
                limit: pageSize, // Số lượng kết quả mỗi trang
                offset: offset, // Vị trí bắt đầu của trang hiện tại
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalResult = await sequelize.query(
        `
        SELECT COUNT(*) AS total 
        FROM de_thi
        JOIN tieu_chi_de_tong_hop ON de_thi.khoa_hoc_id = tieu_chi_de_tong_hop.khoa_hoc_id
        ${whereClause}
        `,
        {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = totalResult[0].total;
    const totalPage = Math.ceil(totalCount / pageSize);

    return res.status(200).send({
        status: 'success',
        data: exams,
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPage: totalPage,
        message: null,
    });
};

const getSyntheticNew = async (req, res) => {
    const exams = await sequelize.query(
        `
        SELECT * FROM de_thi 
        WHERE de_thi.loai_de_thi_id = 3 
        ORDER BY de_thi.ngay_tao LIMIT 10`,
        {
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
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
            return res.status(404).send({
                status: 'fail',
                data: null,
                message: 'enough times',
            });
        }
    } else {
        return res.status(404).send({
            status: 'fail',
            data: null,
            message: 'no criteria',
        });
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

        return res.status(200).send({
            status: 'success',
            data: exam,
            message: null,
        });
    } else {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'no exam',
        });
    }
};

const findAll = async (req, res) => {
    const pageIndex = Number(req.query.pageIndex || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const offset = (pageIndex - 1) * pageSize;
    const limit = pageSize;
    const order = req.query.sortBy
        ? req.query.sortBy.split(',')
        : ['de_thi.ten_de_thi', 'ASC']; // Cột và thứ tự sắp xếp

    const whereConditions = [];
    const replacements = { offset, limit };

    if (req.query.search) {
        whereConditions.push(
            '(de_thi.ten_de_thi LIKE :search OR loai_de_thi.mo_ta LIKE :search)'
        );
        replacements.search = `%${decodeURI(req.query.search)}%`;
    }
    if (req.query.trang_thai) {
        whereConditions.push('de_thi.trang_thai = :trang_thai');
        replacements.trang_thai = parseInt(req.query.trang_thai);
    }
    if (req.query.loai_de_thi_id) {
        whereConditions.push('de_thi.loai_de_thi_id = :loai_de_thi_id');
        replacements.loai_de_thi_id = parseInt(req.query.loai_de_thi_id);
    }
    if (req.query.xuat_ban) {
        whereConditions.push('de_thi.xuat_ban = :xuat_ban');
        replacements.xuat_ban = parseInt(req.query.xuat_ban);
    }
    if (req.query.khoa_hoc_id) {
        whereConditions.push('de_thi.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = parseInt(req.query.khoa_hoc_id);
    }
    if (req.query.mo_dun_id) {
        whereConditions.push('de_thi.mo_dun_id = :mo_dun_id');
        replacements.mo_dun_id = parseInt(req.query.mo_dun_id);
    }
    if (req.query.chuyen_de_id) {
        whereConditions.push('de_thi.chuyen_de_id = :chuyen_de_id');
        replacements.chuyen_de_id = parseInt(req.query.chuyen_de_id);
    }
    if (req.query.ngay_bat_dau && req.query.ngay_ket_thuc) {
        whereConditions.push(
            'de_thi.ngay_tao BETWEEN :ngay_bat_dau AND :ngay_ket_thuc'
        );
        replacements.ngay_bat_dau = req.query.ngay_bat_dau;
        replacements.ngay_ket_thuc = req.query.ngay_ket_thuc;
    }

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(
                  ' AND '
              )} AND (de_thi.kct_id <> 1 OR de_thi.kct_id IS NULL)`
            : 'WHERE de_thi.loai_de_thi_id IN (1, 2, 3, 4) AND (de_thi.kct_id <> 1 OR de_thi.kct_id IS NULL)';

    const totalRecords = await sequelize.query(
        `
        SELECT COUNT(*) AS tong FROM (
            (SELECT de_thi.de_thi_id FROM de_thi LEFT JOIN khoa_hoc ON de_thi.khoa_hoc_id = khoa_hoc.khoa_hoc_id LEFT JOIN mo_dun ON de_thi.mo_dun_id = mo_dun.mo_dun_id LEFT JOIN chuyen_de ON chuyen_de.chuyen_de_id = de_thi.chuyen_de_id LEFT JOIN loai_de_thi ON loai_de_thi.loai_de_thi_id = de_thi.loai_de_thi_id ${whereClause}) 
            UNION 
            (SELECT de_thi.de_thi_id FROM de_thi LEFT JOIN khoa_hoc ON de_thi.khoa_hoc_id = khoa_hoc.khoa_hoc_id LEFT JOIN mo_dun ON de_thi.mo_dun_id = mo_dun.mo_dun_id LEFT JOIN loai_de_thi ON loai_de_thi.loai_de_thi_id = de_thi.loai_de_thi_id ${whereClause})
        ) AS exam
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const exams = await sequelize.query(
        `
        SELECT 
            de_thi.de_thi_id, 
            de_thi.ten_de_thi, 
            de_thi.trang_thai, 
            de_thi.ngay_tao, 
            de_thi.xuat_ban, 
            khoa_hoc.ten_khoa_hoc, 
            mo_dun.ten_mo_dun, 
            chuyen_de.ten_chuyen_de,
            loai_de_thi.mo_ta,
            tieu_chi_de_chuyen_de.thoi_gian tcdcd_thoi_gian,
            tieu_chi_de_chuyen_de.so_cau_hoi tcdcd_so_cau_hoi,
            tieu_chi_de_mo_dun.thoi_gian tcdmd_thoi_gian,
            tieu_chi_de_mo_dun.so_cau_hoi tcdmd_so_cau_hoi,
            tieu_chi_de_tong_hop.thoi_gian tcdth_thoi_gian,
            tieu_chi_de_tong_hop.so_cau_hoi tcdth_so_cau_hoi,
            tieu_chi_de_thi_online.thoi_gian tcdol_thoi_gian,
            tieu_chi_de_thi_online.so_cau_hoi tcdol_so_cau_hoi,
            tieu_chi_de_thi_dgnl.thoi_gian tcddgnl_thoi_gian,
            tieu_chi_de_thi_dgnl.so_cau_hoi tcddgnl_so_cau_hoi,
            tieu_chi_de_thi_dgtd.thoi_gian tcddgtd_thoi_gian,
            tieu_chi_de_thi_dgtd.so_cau_hoi tcddgtd_so_cau_hoi
        FROM de_thi
        LEFT JOIN khoa_hoc ON de_thi.khoa_hoc_id = khoa_hoc.khoa_hoc_id
        LEFT JOIN mo_dun ON de_thi.mo_dun_id = mo_dun.mo_dun_id
        LEFT JOIN chuyen_de ON chuyen_de.chuyen_de_id = de_thi.chuyen_de_id
        LEFT JOIN loai_de_thi ON loai_de_thi.loai_de_thi_id = de_thi.loai_de_thi_id
        LEFT JOIN tieu_chi_de_chuyen_de 
            ON de_thi.mo_dun_id = tieu_chi_de_chuyen_de.mo_dun_id AND de_thi.loai_de_thi_id = 1
        LEFT JOIN tieu_chi_de_mo_dun
            ON de_thi.mo_dun_id = tieu_chi_de_mo_dun.mo_dun_id AND de_thi.loai_de_thi_id = 2
        LEFT JOIN tieu_chi_de_tong_hop
            ON de_thi.khoa_hoc_id = tieu_chi_de_tong_hop.khoa_hoc_id AND de_thi.loai_de_thi_id = 3
        LEFT JOIN tieu_chi_de_thi_online
            ON de_thi.khoa_hoc_id = tieu_chi_de_thi_online.khoa_hoc_id AND de_thi.loai_de_thi_id = 4
        LEFT JOIN tieu_chi_de_thi_dgnl
            ON de_thi.khoa_hoc_id = tieu_chi_de_thi_dgnl.khoa_hoc_id AND de_thi.loai_de_thi_id = 5
        LEFT JOIN tieu_chi_de_thi_dgtd
            ON de_thi.khoa_hoc_id = tieu_chi_de_thi_dgtd.khoa_hoc_id AND de_thi.loai_de_thi_id = 6
        ${whereClause}
        ORDER BY ${order[0]} ${order[1]}
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const cleanedData = exams
        .map((item) => {
            const timeKeys = [
                ['tcdcd_thoi_gian', 'tcdcd_so_cau_hoi'],
                ['tcdmd_thoi_gian', 'tcdmd_so_cau_hoi'],
                ['tcdth_thoi_gian', 'tcdth_so_cau_hoi'],
                ['tcdol_thoi_gian', 'tcdol_so_cau_hoi'],
                ['tcddgnl_thoi_gian', 'tcddgnl_so_cau_hoi'],
                ['tcddgtd_thoi_gian', 'tcddgtd_so_cau_hoi'],
            ];

            let thoiGian = null;
            let soCauHoi = null;

            for (const [tgKey, scKey] of timeKeys) {
                if (item[tgKey] !== null && item[scKey] !== null) {
                    thoiGian = item[tgKey];
                    soCauHoi = item[scKey];
                    break;
                }
            }

            // Nếu không có dữ liệu hợp lệ, trả về null
            if (thoiGian === null && soCauHoi === null) {
                return null;
            }

            // Tạo object mới không chứa các biến *_thoi_gian và *_so_cau_hoi
            const {
                tcdcd_thoi_gian,
                tcdcd_so_cau_hoi,
                tcdmd_thoi_gian,
                tcdmd_so_cau_hoi,
                tcdth_thoi_gian,
                tcdth_so_cau_hoi,
                tcdol_thoi_gian,
                tcdol_so_cau_hoi,
                tcddgnl_thoi_gian,
                tcddgnl_so_cau_hoi,
                tcddgtd_thoi_gian,
                tcddgtd_so_cau_hoi,
                ...rest
            } = item;

            return {
                ...rest,
                thoi_gian: thoiGian,
                so_cau_hoi: soCauHoi,
            };
        })
        .filter(Boolean); // loại phần tử null nếu cần

    const totalCount = totalRecords[0].tong;
    const totalPage = Math.ceil(totalCount / pageSize);

    return res.status(200).send({
        status: 'success',
        data: cleanedData,
        pageIndex,
        pageSize,
        totalCount,
        totalPage,
        message: null,
    });
};

const findOne = async (req, res) => {
    let exam = await Exam.findOne({
        where: { de_thi_id: req.params.id },
    });

    if (!exam) {
        return res
            .status(404)
            .send({ status: 'error', message: 'Exam not found' });
    }

    const examInclude = {
                model: ExamQuestion,
        attributes: ['chdt_id', 'phan', 'danh_dau'],
                include: {
                    model: Question,
            attributes: [
                'cau_hoi_id',
                'noi_dung',
                'loai_cau_hoi',
                'diem',
                'loi_giai',
                'cot_tren_hang',
            ],
                    include: [
                        {
                            model: Answer,
                    attributes: ['dap_an_id', 'noi_dung_dap_an', 'dap_an_dung'],
                        },
                        {
                            model: Exceprt,
                    attributes: ['trich_doan_id', 'noi_dung', 'tep_dinh_kem'],
                            include: {
                                model: ExceprtType,
                        attributes: ['loai_trich_doan_id', 'noi_dung'],
                            },
                        },
                    ],
                },
    };

    const examOrder = exam.de_mau
        ? [
                [
                    sequelize.literal(
                        `FIELD(cau_hoi_de_this.chuyen_nganh_id, ${[
                            1, 7, 3, 4, 6, 8, 9, 5,
                        ].join(', ')})`
                    ),
                ],
                [sequelize.col('cau_hoi_de_this.cau_hoi.trich_doan_id'), 'ASC'],
                [sequelize.col('dap_an_id'), 'ASC'],
          ]
        : [
                [sequelize.col('phan'), 'ASC'],
                [sequelize.col('cau_hoi_de_this.cau_hoi.trich_doan_id'), 'ASC'],
                [sequelize.col('chdt_id'), 'ASC'],
                [sequelize.col('dap_an_id'), 'ASC'],
          ];

    exam = await Exam.findOne({
        where: { de_thi_id: req.params.id },
        include: examInclude,
        order: examOrder,
    });

    let criteria;
    switch (exam.loai_de_thi_id) {
        case 1:
            criteria = await ThematicCriteria.findOne({
                where: { mo_dun_id: exam.mo_dun_id },
            });
            break;
        case 2:
            criteria = await ModunCriteria.findOne({
                where: { mo_dun_id: exam.mo_dun_id },
            });
            break;
        case 3:
            criteria = await SyntheticCriteria.findOne({
                where: { khoa_hoc_id: exam.khoa_hoc_id },
            });
            break;
        case 4:
            criteria = await OnlineCriteria.findOne({
                where: { khoa_hoc_id: exam.khoa_hoc_id },
            });
            break;
        case 5:
            criteria = await DGNLCriteria.findOne({
                where: { khoa_hoc_id: exam.khoa_hoc_id },
            });
            break;
        case 6:
            criteria = await DGTDCriteria.findOne({
                where: { khoa_hoc_id: exam.khoa_hoc_id },
            });
            break;
    }

    if (!criteria) {
        return res
            .status(404)
            .send({ status: 'error', message: 'No criteria' });
    }

                exam.dataValues.so_cau_hoi = criteria.so_cau_hoi;
                exam.dataValues.thoi_gian = criteria.thoi_gian;

    if (exam.loai_de_thi_id === 5) {
                exam.dataValues.so_phan = 3;
                exam.dataValues.so_cau_hoi_phan_1 = criteria.so_cau_hoi_phan_1;
                exam.dataValues.thoi_gian_phan_1 = criteria.thoi_gian_phan_1;
                exam.dataValues.so_cau_hoi_phan_2 = criteria.so_cau_hoi_phan_2;
                exam.dataValues.thoi_gian_phan_2 = criteria.thoi_gian_phan_2;

        const hasPart3 = exam.cau_hoi_de_this.some((item) => item.phan === 3);
        if (hasPart3) {
            exam.dataValues.so_cau_hoi_phan_3 = criteria.so_cau_hoi_phan_3;
            exam.dataValues.thoi_gian_phan_3 = criteria.thoi_gian_phan_3;
                } else {
            exam.dataValues.so_cau_hoi_phan_3 = criteria.so_cau_hoi_phan_4;
            exam.dataValues.thoi_gian_phan_3 = criteria.thoi_gian_phan_4;
                }
            } else if (exam.loai_de_thi_id === 4) {
                exam.dataValues.so_phan = criteria.so_phan;
                for (let i = 0; i < criteria.so_phan; i++) {
                    exam.dataValues[`so_cau_hoi_phan_${i + 1}`] =
                        criteria[`so_cau_hoi_phan_${i + 1}`];
                    exam.dataValues[`yeu_cau_phan_${i + 1}`] =
                        criteria[`yeu_cau_phan_${i + 1}`];
                    exam.dataValues[`thoi_gian_phan_${i + 1}`] =
                        criteria[`thoi_gian_phan_${i + 1}`];
                }
    }

    for (let i = 0; i < (exam.cau_hoi_de_this?.length || 0); i++) {
        const examQuestion = exam.cau_hoi_de_this[i];
        const question = examQuestion.cau_hoi;
        if (!question) continue;

        if (
            question?.trich_doan?.trich_doan_id &&
            (i === 0 ||
                question?.trich_doan?.trich_doan_id !==
                    exam.cau_hoi_de_this[i - 1]?.cau_hoi?.trich_doan?.trich_doan_id)
        ) {
            let from = i,
                to = i;
            for (let j = i + 1; j < exam.cau_hoi_de_this.length; j++) {
                if (
                    exam.cau_hoi_de_this[j].cau_hoi?.trich_doan?.trich_doan_id ===
                    question?.trich_doan?.trich_doan_id
                ) {
                    to = j;
                }
            }
            question.dataValues.exceprtFrom = from;
            question.dataValues.exceprtTo = to;
        }

        if (question.dap_ans) {
            question.dataValues.dap_an_dungs = question.dap_ans
                .map((ans, idx) => (ans.dap_an_dung ? idx : -1))
                .filter((idx) => idx !== -1);
        }
    }

    if (req.query.dthv_id) {
        const selectedAnswers = await SelectedAnswer.findAll({
            where: { dthv_id: req.query.dthv_id },
        });
        exam.dataValues.dap_an_da_chons = selectedAnswers;
    }

    return res.status(200).send({
        status: 'success',
        data: exam,
        message: null,
    });
};

// dùng cho thi đánh giá năng lực mới -> không dùng
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
        if (exam.cau_hoi_de_this[index1].cau_hoi?.trich_doan?.trich_doan_id) {
            if (
                index1 == 0 ||
                exam.cau_hoi_de_this[index1].cau_hoi?.trich_doan?.trich_doan_id !=
                    exam.cau_hoi_de_this[index1 - 1].cau_hoi?.trich_doan?.trich_doan_id
            ) {
                exceprtFrom = exceprtTo = index1;
                for (
                    var index3 = index1 + 1;
                    index3 < exam.cau_hoi_de_this.length;
                    index3++
                ) {
                    if (
                        exam.cau_hoi_de_this[index1].cau_hoi?.trich_doan?.trich_doan_id ==
                        exam.cau_hoi_de_this[index3].cau_hoi?.trich_doan?.trich_doan_id
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

const getByIdDGTD = async (req, res) => {
    let exam = await Exam.findOne({
        where: {
            de_thi_id: req.params.id,
        },
    });

    if (!exam) {
        return res.status(404).send({
            status: 'error',
            message: 'Exam not found',
        });
    }

    const examInclude = {
                model: ExamQuestion,
        attributes: ['chdt_id', 'phan', 'danh_dau'],
                include: {
                    model: Question,
            attributes: [
                'cau_hoi_id',
                'noi_dung',
                'loai_cau_hoi',
                'diem',
                'loi_giai',
                'cot_tren_hang',
            ],
                    include: [
                        {
                            model: Answer,
                    attributes: ['dap_an_id', 'noi_dung_dap_an', 'dap_an_dung'],
                        },
                        {
                            model: QuestionDetail,
                            attributes: ['chct_id', 'noi_dung'],
                        },
                        {
                            model: Option,
                            attributes: ['lua_chon_id', 'noi_dung'],
                        },
                        {
                            model: Exceprt,
                    attributes: ['trich_doan_id', 'noi_dung', 'tep_dinh_kem'],
                            include: {
                                model: ExceprtType,
                        attributes: ['loai_trich_doan_id', 'noi_dung'],
                            },
                        },
                    ],
                },
    };

    const examWhere = {
            where: {
                de_thi_id: req.params.id,
            },
    };

    const examOrder = exam.de_mau
        ? [
                [
                    sequelize.literal(
                        `FIELD(cau_hoi_de_this.chuyen_nganh_id, ${[
                            10, 11, 12,
                        ].join(', ')})`
                    ),
                ],
                [sequelize.col('dap_an_id'), 'ASC'],
          ]
        : [
                [sequelize.col('phan'), 'ASC'],
                [sequelize.col('chdt_id'), 'ASC'],
                [sequelize.col('dap_an_id'), 'ASC'],
                [sequelize.col('lua_chon_id'), 'ASC'],
                [sequelize.col('chct_id'), 'ASC'],
          ];

    exam = await Exam.findOne({
        ...examWhere,
        include: examInclude,
        order: examOrder,
    });

    const criteria = await DGTDCriteria.findOne({
        where: {
            khoa_hoc_id: exam.khoa_hoc_id,
        },
    });

    if (!criteria) {
        return res.status(404).send({
            status: 'error',
            message: 'No criteria found',
        });
    }

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

    if (exam.cau_hoi_de_this) {
        for (let i = 0; i < exam.cau_hoi_de_this.length; i++) {
            const question = exam.cau_hoi_de_this[i].cau_hoi;
            if (!question) continue;

            if (question?.trich_doan?.trich_doan_id) {
                if (
                    i === 0 ||
                    question?.trich_doan?.trich_doan_id !==
                        exam.cau_hoi_de_this[i - 1].cau_hoi?.trich_doan?.trich_doan_id
                ) {
                    let exceprtFrom = i;
                    let exceprtTo = i;
                    for (let j = i + 1; j < exam.cau_hoi_de_this.length; j++) {
                        if (
                            question?.trich_doan.trich_doan_id ===
                            exam.cau_hoi_de_this[j].cau_hoi?.trich_doan?.trich_doan_id
                        ) {
                            exceprtTo = j;
                        }
                    }
                    question.dataValues.exceprtFrom = exceprtFrom;
                    question.dataValues.exceprtTo = exceprtTo;
                }
            }

            let dap_an_dungs = [];
            if (question.dap_ans) {
                for (let j = 0; j < question.dap_ans.length; j++) {
                    if (question.dap_ans[j].dap_an_dung) {
                        dap_an_dungs.push(j);
                    }
                }
            }
            question.dataValues.dap_an_dungs = dap_an_dungs;
        }
    }

    return res.status(200).send({
        status: 'success',
        data: exam,
        message: null,
    });
};

const create = async (req, res) => {
    const { de_thi_ma, loai_de_thi_id, mo_dun_id, khoa_hoc_id } = req.body;

    if (!de_thi_ma) {
        return res.status(400).send({
            status: 'fail',
            data: null,
            message: 'Chưa nhập mã đề thi',
        });
    }

    let criteria = null;
    const loaiDeThi = Number(loai_de_thi_id);

    if (loaiDeThi === 1) {
        criteria = await ThematicCriteria.findOne({ where: { mo_dun_id } });
    } else if (loaiDeThi === 2) {
        criteria = await ModunCriteria.findOne({ where: { mo_dun_id } });
    } else if (loaiDeThi === 3) {
        criteria = await SyntheticCriteria.findOne({ where: { khoa_hoc_id } });
    } else if (loaiDeThi === 4) {
        criteria = await OnlineCriteria.findOne({ where: { khoa_hoc_id } });
    } else if (loaiDeThi === 5) {
        criteria = await DGNLCriteria.findOne({ where: { khoa_hoc_id } });
        if (!criteria) {
            criteria = await DGNLCriteria.create({
                khoa_hoc_id,
                so_phan: 4,
                so_cau_hoi: 150,
                thoi_gian: 195,
                so_cau_hoi_phan_1: 50,
                thoi_gian_phan_1: 75,
                so_cau_hoi_phan_2: 50,
                thoi_gian_phan_2: 60,
                so_cau_hoi_phan_3: 50,
                thoi_gian_phan_3: 60,
                so_cau_hoi_phan_4: 50,
                thoi_gian_phan_4: 60,
            });
        }
    } else if (loaiDeThi === 6) {
        criteria = await DGTDCriteria.findOne({ where: { khoa_hoc_id } });
        if (!criteria) {
            criteria = await DGTDCriteria.create({
                khoa_hoc_id,
                so_cau_hoi: 100,
                thoi_gian: 150,
                so_phan: 3,
                so_cau_hoi_phan_1: 40,
                thoi_gian_phan_1: 60,
                so_cau_hoi_phan_2: 20,
                thoi_gian_phan_2: 30,
                so_cau_hoi_phan_3: 40,
                thoi_gian_phan_3: 60,
            });
        }
    }

    if (!criteria) {
        return res.status(400).send({
            status: 'fail',
            data: '100',
            message: 'Chưa có tiêu chí đề thi',
        });
    }

    const createdExam = await Exam.create({ ...req.body });

    return res.status(200).send({
        status: 'success',
        data: createdExam,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const exam = await Exam.findOne({
        where: {
            de_thi_id: req.params.id,
        },
    });

    return res.send({
        status: 'success',
        data: exam,
        message: null,
    });
};

const update = async (req, res) => {
    if (req.file) {
        const exam = await Exam.findOne({
            where: { de_thi_id: req.params.id },
        });

        if (exam && exam.anh_dai_dien) {
            const oldImagePath = `public${exam.anh_dai_dien}`;
            try {
                await fsPromises.access(oldImagePath); // kiểm tra file có tồn tại
                await fsPromises.unlink(oldImagePath); // xóa file
            } catch (err) {
                console.warn(
                    'Không tìm thấy hoặc không thể xóa ảnh cũ:',
                    err.message
                );
            }
        }
    }

    await Exam.update({ ...req.body }, { where: { de_thi_id: req.params.id } });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const publish = async (req, res) => {
    const exam = await Exam.findOne({
        attributes: [
            'de_thi_id',
            'xuat_ban',
            'de_mau',
            'khoa_hoc_id',
            'loai_de_thi_id',
        ],
        where: {
            de_thi_id: req.params.id,
        },
    });

    const questionNotAnswer = await sequelize.query(
        `
        SELECT t.cau_hoi_id FROM (SELECT cau_hoi.cau_hoi_id, COUNT(dap_an.dap_an_id) AS count FROM dap_an 
            INNER JOIN cau_hoi ON dap_an.cau_hoi_id = cau_hoi.cau_hoi_id 
            INNER JOIN cau_hoi_de_thi ON cau_hoi.cau_hoi_id = cau_hoi_de_thi.cau_hoi_id
                WHERE dap_an.dap_an_dung = 1 AND cau_hoi_de_thi.de_thi_id = :de_thi_id
                GROUP BY cau_hoi.cau_hoi_id) t WHERE count = 0`,
        {
            replacements: { de_thi_id: Number(req.params.id) },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    if (questionNotAnswer.length > 0) {
        res.status(400).send({
            status: 'error',
            data: null,
            message: 'Đề thi có câu hỏi chưa có đán án đúng',
        });
    }

    if (exam.xuat_ban) {
        await Exam.update(
            {
                xuat_ban: false,
            },
            {
                where: {
                    de_thi_id: req.params.id,
                },
            }
        );

        await Exam.update(
            {
                xuat_ban: false,
                trang_thai: false,
            },
            {
                where: {
                    de_mau_id: exam.de_thi_id,
                },
            }
        );
    } else {
        if (exam.loai_de_thi_id === 5) {
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
                let criteria = await DGNLCriteria.findOne({
                    where: {
                        khoa_hoc_id: exam.khoa_hoc_id,
                    },
                });
                if (!criteria) {
                    return res.status(400).send({
                        status: 'error',
                        message: 'Chưa có tiêu chí đề thi',
                    });
                }

                setTimeout(async () => {
                    const subjects = [3, 4, 6, 8, 9];
                    const combinations = generateCombinations(subjects, 3);

                    for (let count = 1; count <= 4; count++) {
                        const newExam = await Exam.create({
                            ten_de_thi: 'THI ĐÁNH GIÁ NĂNG LỰC',
                            tong_diem: 150,
                            xuat_ban: true,
                            trang_thai: true,
                            kct_id: 1,
                            khoa_hoc_id: exam.khoa_hoc_id,
                            loai_de_thi_id: 5,
                            de_mau_id: exam.de_thi_id,
                            to_hop: '1,7,5',
                        });

                        // phần 1
                        await sequelize.query(
                            `
                            INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan, chuyen_nganh_id)
                                SELECT cau_hoi_id, ${newExam.dataValues.de_thi_id}, 1, chuyen_nganh_id FROM cau_hoi_de_thi
                                WHERE chuyen_nganh_id = 1 AND de_thi_id = ${exam.de_thi_id}
                                ORDER BY RAND() LIMIT ${criteria.so_cau_hoi_phan_1}
                        `,
                            {
                                type: sequelize.QueryTypes.INSERT,
                            }
                        );

                        // phần 2
                        await sequelize.query(
                            `
                            INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan, chuyen_nganh_id)
                                SELECT chdt.cau_hoi_id, ${newExam.dataValues.de_thi_id}, 2, chdt.chuyen_nganh_id FROM cau_hoi_de_thi chdt
                                INNER JOIN cau_hoi ch ON chdt.cau_hoi_id = ch.cau_hoi_id
                                WHERE chdt.chuyen_nganh_id = 7 AND chdt.de_thi_id = ${exam.de_thi_id}
                                ORDER BY ch.trich_doan_id ASC, RAND()
                                LIMIT ${criteria.so_cau_hoi_phan_2}
                        `,
                            {
                                type: sequelize.QueryTypes.INSERT,
                            }
                        );

                        // phần 3
                        await sequelize.query(
                            `
                            INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan, chuyen_nganh_id)
                                SELECT cau_hoi_id, ${newExam.dataValues.de_thi_id}, 4, chuyen_nganh_id FROM cau_hoi_de_thi
                                WHERE chuyen_nganh_id = 5 AND de_thi_id = ${exam.de_thi_id}
                                ORDER BY cau_hoi_id ASC
                                LIMIT ${criteria.so_cau_hoi_phan_4}
                        `,
                            {
                                type: sequelize.QueryTypes.INSERT,
                            }
                        );
                    }

                    for (let combination of combinations) {
                        for (let count = 1; count <= 4; count++) {
                            const newExam = await Exam.create({
                                ten_de_thi: 'THI ĐÁNH GIÁ NĂNG LỰC',
                                tong_diem: 150,
                                xuat_ban: true,
                                trang_thai: true,
                                kct_id: 1,
                                khoa_hoc_id: exam.khoa_hoc_id,
                                loai_de_thi_id: 5,
                                de_mau_id: exam.de_thi_id,
                                to_hop: `1,7,${combination.join(',')}`,
                            });

                            // phần 1
                            await sequelize.query(
                                `
                                INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan, chuyen_nganh_id)
                                    SELECT cau_hoi_id, ${newExam.dataValues.de_thi_id}, 1, chuyen_nganh_id FROM cau_hoi_de_thi
                                    WHERE chuyen_nganh_id = 1 AND de_thi_id = ${exam.de_thi_id}
                                    ORDER BY RAND() LIMIT ${criteria.so_cau_hoi_phan_1}
                            `,
                                {
                                    type: sequelize.QueryTypes.INSERT,
                                }
                            );

                            // phần 2
                            await sequelize.query(
                                `
                                INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan, chuyen_nganh_id)
                                    SELECT chdt.cau_hoi_id, ${newExam.dataValues.de_thi_id}, 2, chdt.chuyen_nganh_id FROM cau_hoi_de_thi chdt
                                    INNER JOIN cau_hoi ch ON chdt.cau_hoi_id = ch.cau_hoi_id
                                    WHERE chdt.chuyen_nganh_id = 7 AND chdt.de_thi_id = ${exam.de_thi_id}
                                    ORDER BY ch.trich_doan_id ASC, RAND()
                                    LIMIT ${criteria.so_cau_hoi_phan_2}
                            `,
                                {
                                    type: sequelize.QueryTypes.INSERT,
                                }
                            );

                            // phần 3
                            const so_cau_hoi_tung_chuyen_nganh = parseInt(
                                Number(criteria.so_cau_hoi_phan_3) / 3
                            );
                            for (const chuyen_nganh_id of combination) {
                                await sequelize.query(
                                    `
                                        INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan, chuyen_nganh_id)
                                            SELECT chdt.cau_hoi_id, ${newExam.dataValues.de_thi_id}, 3, chdt.chuyen_nganh_id
                                            FROM cau_hoi_de_thi chdt
                                            INNER JOIN cau_hoi ch ON chdt.cau_hoi_id = ch.cau_hoi_id
                                            WHERE chdt.chuyen_nganh_id = :chuyen_nganh_id
                                            AND chdt.de_thi_id = ${exam.de_thi_id}
                                            AND ch.trich_doan_id IS NOT NULL
                                            ORDER BY ch.trich_doan_id ASC, RAND() LIMIT ${so_cau_hoi_tung_chuyen_nganh}
                                    `,
                                    {
                                        type: sequelize.QueryTypes.INSERT,
                                        replacements: {
                                            chuyen_nganh_id:
                                                Number(chuyen_nganh_id),
                                        },
                                    }
                                );

                                let limit_value = await sequelize.query(
                                    `
                                    SELECT COUNT(*) as count
                                        FROM cau_hoi_de_thi
                                        WHERE de_thi_id = ${newExam.dataValues.de_thi_id}
                                        AND chuyen_nganh_id = :chuyen_nganh_id
                                `,
                                    {
                                        type: sequelize.QueryTypes.SELECT,
                                        replacements: {
                                            chuyen_nganh_id:
                                                Number(chuyen_nganh_id),
                                        },
                                    }
                                );

                                await sequelize.query(
                                    `
                                        INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan, chuyen_nganh_id)
                                            SELECT chdt.cau_hoi_id, ${
                                                newExam.dataValues.de_thi_id
                                            }, 3, chdt.chuyen_nganh_id
                                            FROM cau_hoi_de_thi chdt
                                            INNER JOIN cau_hoi ch ON chdt.cau_hoi_id = ch.cau_hoi_id
                                            WHERE chdt.chuyen_nganh_id = :chuyen_nganh_id 
                                            AND chdt.de_thi_id = ${
                                                exam.de_thi_id
                                            }
                                            AND ch.trich_doan_id IS NULL
                                            ORDER BY ch.trich_doan_id ASC, RAND() 
                                            LIMIT ${
                                                so_cau_hoi_tung_chuyen_nganh -
                                                limit_value[0].count
                                            }
                                    `,
                                    {
                                        type: sequelize.QueryTypes.INSERT,
                                        replacements: {
                                            chuyen_nganh_id:
                                                Number(chuyen_nganh_id),
                                        },
                                    }
                                );
                            }
                            await sequelize.query(
                                `
                                    INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan, chuyen_nganh_id)
                                        SELECT chdt.cau_hoi_id, ${
                                            newExam.dataValues.de_thi_id
                                        }, 3, chdt.chuyen_nganh_id FROM cau_hoi_de_thi chdt
                                        INNER JOIN cau_hoi ch ON chdt.cau_hoi_id = ch.cau_hoi_id
                                        WHERE chdt.chuyen_nganh_id IN (${combination.join(
                                            ','
                                        )}) AND chdt.de_thi_id = ${
                                    exam.de_thi_id
                                }
                                        AND ch.trich_doan_id IS NULL
                                        AND chdt.cau_hoi_id NOT IN (SELECT cau_hoi_id
                                        FROM cau_hoi_de_thi
                                        WHERE de_thi_id = ${newExam.de_thi_id})
                                        ORDER BY RAND() LIMIT ${
                                            Number(criteria.so_cau_hoi_phan_3) -
                                            so_cau_hoi_tung_chuyen_nganh * 3
                                        }
                                `,
                                {
                                    type: sequelize.QueryTypes.INSERT,
                                }
                            );
                        }
                    }
                }, 500);
            } else {
                return res.status(400).send({
                    status: 'error',
                    message: 'Số lượng câu hỏi chưa đủ yêu cầu',
                });
            }
        } else if (exam.loai_de_thi_id === 6) {
            const condition = await sequelize.query(
                `
                SELECT ((SELECT COUNT(*) FROM cau_hoi_de_thi WHERE de_thi_id = :de_thi_id AND chuyen_nganh_id = 10) >= 40
                AND (SELECT COUNT(*) FROM cau_hoi_de_thi WHERE de_thi_id = :de_thi_id AND chuyen_nganh_id = 11) >= 20
                AND (SELECT COUNT(*) FROM cau_hoi_de_thi WHERE de_thi_id = :de_thi_id AND chuyen_nganh_id = 12) >= 40
                AND (SELECT COUNT(*) FROM cau_hoi_de_thi WHERE de_thi_id = :de_thi_id) >= 100) AS bool`,
                {
                    replacements: { de_thi_id: Number(req.params.id) },
                    type: sequelize.QueryTypes.SELECT,
                }
            );
            if (condition[0].bool) {
                let criteria = await DGTDCriteria.findOne({
                    where: {
                        khoa_hoc_id: exam.khoa_hoc_id,
                    },
                });
                if (!criteria) {
                    return res.status(400).send({
                        status: 'error',
                        message: 'Chưa có tiêu chí đề thi',
                    });
                }
            } else {
                return res.status(400).send({
                    status: 'error',
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
            },
            {
                where: {
                    de_thi_id: req.params.id,
                },
            }
        );
    }

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const stateChange = async (req, res) => {
    const exam = await Exam.findOne({
        where: { de_thi_id: req.params.id },
    });

    if (!exam) {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'Exam not found',
        });
    }

    if (exam.trang_thai) {
        await exam.update({ trang_thai: false });
    } else {
        if (exam.de_mau) {
            await Exam.update(
                { trang_thai: false },
                { where: { khoa_hoc_id: exam.khoa_hoc_id } }
            );
        }
        await exam.update({ trang_thai: true });
    }

    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const remove = async (req, res) => {
    const examChild = await Exam.findOne({
        where: { de_cha_id: req.params.id },
    });

    if (examChild) {
        return res.status(400).send({
            status: 'error',
            data: null,
            message: 'Đề thi đang được sử dụng cho đề thi khác!',
        });
    }

    const exam = await Exam.findOne({
        where: { de_thi_id: req.params.id },
    });

    if (exam && exam.anh_dai_dien) {
        const avatarPath = `public${exam.anh_dai_dien}`;
        try {
            await fsPromises.access(avatarPath);
            await fsPromises.unlink(avatarPath);
        } catch (err) {
            // File không tồn tại thì bỏ qua
        }
    }

    const mediaPath = `public/Picture/word/media/${req.params.id}`;
    try {
        await fsPromises.access(mediaPath);
        await fsPromises.rm(mediaPath, { recursive: true, force: true });
    } catch (err) {
        // Folder không tồn tại thì bỏ qua
    }

    // Xóa dap_an
    await sequelize.query(
        `DELETE FROM dap_an WHERE cau_hoi_id IN 
            (SELECT cau_hoi_id FROM cau_hoi WHERE de_thi_id = :de_thi_id)`,
        {
            replacements: { de_thi_id: parseInt(req.params.id) },
            type: sequelize.QueryTypes.DELETE,
        }
    );

    // Xóa cau_hoi_de_thi
    await sequelize.query(
        `DELETE FROM cau_hoi_de_thi WHERE cau_hoi_id IN 
            (SELECT cau_hoi_id FROM cau_hoi WHERE de_thi_id = :de_thi_id)`,
        {
            replacements: { de_thi_id: parseInt(req.params.id) },
            type: sequelize.QueryTypes.DELETE,
        }
    );

    // Xóa dữ liệu chính
    await Promise.all([
        Exceprt.destroy({ where: { de_thi_id: req.params.id } }),
        Question.destroy({ where: { de_thi_id: req.params.id } }),
        Answer.destroy({ where: { de_thi_id: req.params.id } }),
        ExamQuestion.destroy({ where: { de_thi_id: req.params.id } }),
        Exam.destroy({ where: { de_thi_id: req.params.id } }),
    ]);

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

const clearAll = async (req, res) => {
    // const exams = await findAll();
    // for (const exam of exams) {
    //     if (exam.anh_dai_dien && fs.existsSync(`public${exam.anh_dai_dien}`))
    //         fs.unlinkSync(`public${exam.anh_dai_dien}`);
    // }
    // await sequelize.query('DELETE FROM de_thi', {
    //     type: sequelize.QueryTypes.DELETE,
    // });
    // res.status(200).send({
    //     status: 'success',
    //     data: null,
    //     message: 'cleared',
    // });
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
            'de_mau_id',
            'de_thi_ma',
        ],
    });

    const examNew = await Exam.create({
        ...examOld.dataValues,
        de_thi_ma: `${examOld.de_thi_ma}_NEW`,
        ten_de_thi: `${examOld.ten_de_thi} NEW`,
        de_cha_id: req.params.id,
        ...(examOld.de_mau && { trang_thai: false, xuat_ban: false }),
    });

    let examQuestionOlds = await ExamQuestion.findAll({
        where: {
            de_thi_id: req.params.id,
        },
        attributes: ['cau_hoi_id', 'chuyen_nganh_id'],
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

    return res.status(200).send({
        status: 'success',
        data: examNew,
        message: null,
    });
};

const getStudentStatistic = async (req, res) => {
    const whereConditions = [
        'de_thi_hoc_vien.thoi_diem_ket_thuc IS NOT NULL',
        'de_thi_hoc_vien.de_thi_id = :de_thi_id',
    ];

    if (req.query.ngay_bat_dau && req.query.ngay_ket_thuc) {
        whereConditions.push(
            'de_thi_hoc_vien.thoi_diem_bat_dau BETWEEN :ngay_bat_dau AND :ngay_ket_thuc'
        );
    }
    if (req.query.search) {
        whereConditions.push('hoc_vien.ho_ten LIKE :search');
    }
    if (req.query.tinh) {
        whereConditions.push('hoc_vien.ttp_id LIKE :tinh');
    }
    const pageSize = Number(req.query.limit || 100);
    const pageIndex = Number(req.query.index || 1);
    const offset = (pageIndex - 1) * pageSize;

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const students = await sequelize.query(
        `
        SELECT 
            hoc_vien.ho_ten, 
            hoc_vien.sdt, 
            tinh_thanhpho.ten AS tinh, 
            hoc_vien.truong_hoc, 
            de_thi_hoc_vien.dthv_id,
            de_thi_hoc_vien.so_cau_tra_loi_dung, 
            de_thi_hoc_vien.so_cau_tra_loi_sai, 
            de_thi_hoc_vien.diem_cac_phan,
            (de_thi_hoc_vien.ket_qua_diem / de_thi.tong_diem) * 10 AS diem_so, 
            de_thi_hoc_vien.thoi_diem_bat_dau AS ngay_thi
        FROM hoc_vien 
        LEFT JOIN tinh_thanhpho ON hoc_vien.ttp_id = tinh_thanhpho.ttp_id 
        JOIN de_thi_hoc_vien ON de_thi_hoc_vien.hoc_vien_id = hoc_vien.hoc_vien_id 
        JOIN de_thi ON de_thi_hoc_vien.de_thi_id = de_thi.de_thi_id
        ${whereClause}
        ORDER BY diem_so DESC
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements: {
                de_thi_id: parseInt(req.params.id),
                ngay_bat_dau: req.query.ngay_bat_dau,
                ngay_ket_thuc: req.query.ngay_ket_thuc,
                search: req.query.search
                    ? `%${decodeURIComponent(req.query.search)}%`
                    : undefined,
                tinh: req.query.tinh
                    ? `%${decodeURIComponent(req.query.tinh)}%`
                    : undefined,
                limit: pageSize,
                offset: offset,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalResult = await sequelize.query(
        `
    SELECT COUNT(*) AS total
    FROM hoc_vien 
    LEFT JOIN tinh_thanhpho ON hoc_vien.ttp_id = tinh_thanhpho.ttp_id 
    JOIN de_thi_hoc_vien ON de_thi_hoc_vien.hoc_vien_id = hoc_vien.hoc_vien_id 
    JOIN de_thi ON de_thi_hoc_vien.de_thi_id = de_thi.de_thi_id
    ${whereClause}
    `,
        {
            replacements: {
                de_thi_id: parseInt(req.params.id),
                ngay_bat_dau: req.query.ngay_bat_dau,
                ngay_ket_thuc: req.query.ngay_ket_thuc,
                search: req.query.search
                    ? `%${decodeURIComponent(req.query.search)}%`
                    : undefined,
                tinh: req.query.tinh
                    ? `%${decodeURIComponent(req.query.tinh)}%`
                    : undefined,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = totalResult[0].total;
    const totalPage = Math.ceil(totalCount / pageSize);

    return res.status(200).send({
        status: 'success',
        data: students,
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPage: totalPage,
        message: null,
    });
};

const uploadWordMedia = async (req, res) => {
    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'Upload file thành công',
    });
};

const getCriteriaByExamId = async (req, res) => {
    const exam = await Exam.findOne({
        where: {
            de_thi_id: req.params.id,
        },
    });

    if (!exam) {
        return res.status(404).send({
            status: 'error',
            message: 'Đề thi không tồn tại!',
        });
    }

    let criteria = null;
    switch (exam.loai_de_thi_id) {
        case 1:
        criteria = await ThematicCriteria.findOne({
                where: { mo_dun_id: exam.mo_dun_id },
        });
            break;
        case 2:
        criteria = await ModunCriteria.findOne({
                where: { mo_dun_id: exam.mo_dun_id },
            });
            break;
        case 3:
            criteria = await SyntheticCriteria.findOne({
                where: { khoa_hoc_id: exam.khoa_hoc_id },
            });
            break;
        case 4:
            criteria = await OnlineCriteria.findOne({
                where: { khoa_hoc_id: exam.khoa_hoc_id },
            });
            break;
        default:
            return res.status(400).send({
                status: 'error',
                message: 'Loại đề thi không hợp lệ!',
            });
    }

    return res.status(200).send({
        status: 'success',
        data: criteria,
    });
};

const findAllByThematicId = async (req, res) => {
    const criteria = await ThematicCriteria.findOne({
        where: { mo_dun_id: req.query.mo_dun_id },
    });

    let { count, rows } = await Exam.findAndCountAll({
        attributes: ['de_thi_id', 'ten_de_thi', 'trang_thai', 'xuat_ban'],
        include: [
            {
                model: Course,
                attributes: [],
                required: true, // vì dùng điều kiện trong where
            },
        ],
            where: {
            loai_de_thi_id: 1,
            '$khoa_hoc.giao_vien_id$': req.userId,
            ...(req.query.kct_id && { kct_id: req.query.kct_id }),
            ...(req.query.trang_thai && { trang_thai: req.query.trang_thai }),
            ...(req.query.xuat_ban && { xuat_ban: req.query.xuat_ban }),
            ...(req.query.khoa_hoc_id && {
                khoa_hoc_id: req.query.khoa_hoc_id,
            }),
            ...(req.query.mo_dun_id && { mo_dun_id: req.query.mo_dun_id }),
            ...(req.query.chuyen_de_id && {
                chuyen_de_id: req.query.chuyen_de_id,
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
    rows = rows.map((exam) => {
        const examData = exam.toJSON();

        return {
            ...examData,
            thoi_gian: criteria?.thoi_gian || null,
            so_cau_hoi: criteria?.so_cau_hoi || null,
        };
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

const findAllByModunId = async (req, res) => {
    const criteria = await ModunCriteria.findOne({
        where: { mo_dun_id: req.query.mo_dun_id },
    });

    let { count, rows } = await Exam.findAndCountAll({
        attributes: ['de_thi_id', 'ten_de_thi', 'trang_thai', 'xuat_ban'],
        include: [
            {
                model: Course,
                attributes: [],
                required: true, // vì dùng điều kiện trong where
            },
        ],
            where: {
            loai_de_thi_id: 2,
            '$khoa_hoc.giao_vien_id$': req.userId,
            ...(req.query.kct_id && { kct_id: req.query.kct_id }),
            ...(req.query.trang_thai && { trang_thai: req.query.trang_thai }),
            ...(req.query.xuat_ban && { xuat_ban: req.query.xuat_ban }),
            ...(req.query.khoa_hoc_id && {
                khoa_hoc_id: req.query.khoa_hoc_id,
            }),
            ...(req.query.mo_dun_id && { mo_dun_id: req.query.mo_dun_id }),
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
    rows = rows.map((exam) => {
        const examData = exam.toJSON();

        return {
            ...examData,
            thoi_gian: criteria?.thoi_gian || null,
            so_cau_hoi: criteria?.so_cau_hoi || null,
        };
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

const findAllByCourseId = async (req, res) => {
    const criteria = await SyntheticCriteria.findOne({
        where: { khoa_hoc_id: req.query.khoa_hoc_id },
    });

    let { count, rows } = await Exam.findAndCountAll({
        attributes: ['de_thi_id', 'ten_de_thi', 'trang_thai', 'xuat_ban'],
        include: [
            {
                model: Course,
                attributes: [],
                required: true, // vì dùng điều kiện trong where
            },
        ],
            where: {
            loai_de_thi_id: 3,
            '$khoa_hoc.giao_vien_id$': req.userId,
            ...(req.query.kct_id && { kct_id: req.query.kct_id }),
            ...(req.query.trang_thai && { trang_thai: req.query.trang_thai }),
            ...(req.query.xuat_ban && { xuat_ban: req.query.xuat_ban }),
            ...(req.query.khoa_hoc_id && {
                khoa_hoc_id: req.query.khoa_hoc_id,
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
    rows = rows.map((exam) => {
        const examData = exam.toJSON();

        return {
            ...examData,
            thoi_gian: criteria?.thoi_gian || null,
            so_cau_hoi: criteria?.so_cau_hoi || null,
        };
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

module.exports = {
    getExamOnline,
    getSynthetic,
    getOneExam,
    findAll,
    findOne,
    create,
    getUpdate,
    update,
    publish,
    stateChange,
    remove,
    clearAll,
    reuse,
    getSyntheticNew,
    getStudentStatistic,
    uploadWordMedia,
    getByIdv2,
    getExamDGNL,
    getCriteriaByExamId,
    getByIdDGTD,
    findAllByThematicId,
    findAllByModunId,
    findAllByCourseId,
};
