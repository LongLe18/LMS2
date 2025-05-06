const fs = require('fs');
const { Op } = require('sequelize');

const {
    Student,
    Thematic,
    Exam,
    CourseStudent,
    Province,
} = require('../models');
const sequelize = require('../utils/db');
const security = require('../utils/security');
const sendMail = require('../services/mail.service');

const getStatistical = async (req, res, next) => {
    let whereConditions = [];
    let replacements = {};

    if (req.query.search) {
        whereConditions.push('hoc_vien.ho_ten LIKE :search');
        replacements.search = `%${decodeURI(req.query.search)}%`;
    }
    if (req.query.khoa_hoc_id) {
        whereConditions.push('khoa_hoc_hoc_vien.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = parseInt(req.query.khoa_hoc_id);
    }

    const pageIndex = parseInt(req.query.pageIndex) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (pageIndex - 1) * pageSize;

    const whereClause = whereConditions.length
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    const students = await sequelize.query(
        `
        SELECT DISTINCT hoc_vien.hoc_vien_id, hoc_vien.email, hoc_vien.ho_ten, hoc_vien.sdt, khoa_hoc.ten_khoa_hoc
        FROM hoc_vien
        JOIN khoa_hoc_hoc_vien ON khoa_hoc_hoc_vien.hoc_vien_id = hoc_vien.hoc_vien_id
        JOIN khoa_hoc ON khoa_hoc_hoc_vien.khoa_hoc_id = khoa_hoc.khoa_hoc_id
        ${whereClause}
        ORDER BY hoc_vien.hoc_vien_id DESC
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
        data: students,
        message: null,
    });
};

const findAll = async (req, res) => {
    const { count, rows } = await Student.findAndCountAll({
        attributes: [
            'hoc_vien_id',
            'anh_dai_dien',
            'ho_ten',
            'gioi_tinh',
            'email',
            'truong_hoc',
            'trang_thai',
            'sdt',
            'ngay_sinh',
            'ttp_id',
        ],
        include: {
            model: Province,
            attributes: ['ttp_id', 'ten'],
        },
        where: {
            ...(req.query.trang_thai && {
                trang_thai: req.query.trang_thai,
            }),
            ...(req.query.search && {
                ho_ten: { [Op.like]: `%${decodeURI(req.query.search)}%` },
            }),
            ...(req.query.ttp_id && { ttp_id: req.query.ttp_id }),
            ...(req.query.ngay_bat_dau &&
                req.query.ngay_ket_thuc && {
                    ngay_sinh: {
                        [Op.between]: [
                            req.query.ngay_bat_dau,
                            req.query.ngay_ket_thuc,
                        ],
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

const getAllv2 = async (req, res) => {
    const isWeekly = req.query.diem_tuan === 'true'; // kiểm tra giá trị rõ ràng hơn
    const timeFilter = isWeekly
        ? 'AND WEEK(de_thi_hoc_vien.ngay_tao) = WEEK(NOW())'
        : '';

    const students = await sequelize.query(
        `
        SELECT 
            hoc_vien.hoc_vien_id, 
            hoc_vien.ho_ten, 
            hoc_vien.anh_dai_dien, 
            (
                SELECT SUM(ket_qua_diem)
                FROM de_thi_hoc_vien 
                WHERE de_thi_hoc_vien.hoc_vien_id = hoc_vien.hoc_vien_id 
                ${timeFilter}
            ) AS diem 
        FROM hoc_vien 
        ORDER BY diem DESC 
        LIMIT 20
        `,
        {
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: students,
        message: null,
    });
};

const getAllv3 = async (req, res) => {
    const studentsWeek = await sequelize.query(
        `
        SELECT 
            hv.hoc_vien_id, 
            hv.ho_ten, 
            hv.anh_dai_dien, 
            COALESCE((
                SELECT SUM(ket_qua_diem)
                FROM de_thi_hoc_vien
                WHERE hoc_vien_id = hv.hoc_vien_id
                AND WEEK(ngay_tao) = WEEK(NOW())
            ), 0) AS diem
        FROM hoc_vien hv
        ORDER BY diem DESC
        LIMIT 20
        `,
        { type: sequelize.QueryTypes.SELECT }
    );

    const studentsFull = await sequelize.query(
        `
        SELECT 
            hv.hoc_vien_id, 
            hv.ho_ten, 
            hv.anh_dai_dien, 
            COALESCE((
                SELECT SUM(ket_qua_diem)
                FROM de_thi_hoc_vien
                WHERE hoc_vien_id = hv.hoc_vien_id
            ), 0) AS diem
        FROM hoc_vien hv
        ORDER BY diem DESC
        LIMIT 20
        `,
        { type: sequelize.QueryTypes.SELECT }
    );

    const user = {};

    studentsWeek.forEach((student, index) => {
        if (student.hoc_vien_id == req.userId) {
            user.week = { ...student, index };
        }
    });

    studentsFull.forEach((student, index) => {
        if (student.hoc_vien_id == req.userId) {
            user.full = { ...student, index };
        }
    });

    return res.status(200).send({
        status: 'success',
        data: { user, studentsWeek, studentsFull },
        message: null,
    });
};

const addCourse = async (req, res) => {
    const khoaHocIds =
        req.body.khoa_hoc_id
            ?.split(',')
            .map((id) => id.trim())
            .filter(Boolean) || [];

    if (khoaHocIds.length === 0) {
        return res.status(400).send({
            status: 'fail',
            data: null,
            message: 'Danh sách khóa học không hợp lệ',
        });
    }

    const data = khoaHocIds.map((khoa_hoc_id) => ({
        khoa_hoc_id,
        hoc_vien_id: req.params.id,
    }));

    await CourseStudent.bulkCreate(data);

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const getDetail = async (req, res) => {
    const { khoa_hoc_id, mo_dun_id } = req.query;
    const moDunId = parseInt(mo_dun_id);
    const khoaHocId = parseInt(khoa_hoc_id);

    const students = await sequelize.query(
        `
        SELECT DISTINCT hoc_vien.hoc_vien_id, hoc_vien.ho_ten, hoc_vien.ngay_sinh 
        FROM hoc_vien 
        JOIN hoa_don ON hoc_vien.hoc_vien_id = hoa_don.hoc_vien_id 
        JOIN hoa_don_chi_tiet ON hoa_don.hoa_don_id = hoa_don_chi_tiet.hoa_don_id 
        JOIN khoa_hoc ON khoa_hoc.khoa_hoc_id = hoa_don_chi_tiet.san_pham_id 
        JOIN mo_dun ON khoa_hoc.khoa_hoc_id = mo_dun.mo_dun_id 
        WHERE hoa_don_chi_tiet.loai_san_pham = 'Khóa học' 
        AND hoa_don.trang_thai = true 
        AND hoa_don_chi_tiet.san_pham_id = :khoaHocId
        AND mo_dun.giao_vien_id = :giaoVienId
        `,
        {
            replacements: { khoaHocId, giaoVienId: req.userId },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const soChuyenDe = await Thematic.count({
        where: { mo_dun_id: moDunId },
    });
    const tongDe = await Exam.count({
        where: {
            loai_de_thi_id: 1,
            mo_dun_id: moDunId,
        },
    });

    await Promise.all(
        students.map(async (student) => {
            const [soChuyenDeDaHoc] = await sequelize.query(
                `
                SELECT COUNT(DISTINCT de_thi.chuyen_de_id) AS SL 
                FROM de_thi_hoc_vien 
                JOIN de_thi ON de_thi_hoc_vien.de_thi_id = de_thi.de_thi_id 
                WHERE de_thi.loai_de_thi_id = 1 
                AND de_thi_hoc_vien.dat_yeu_cau = true 
                AND de_thi_hoc_vien.hoc_vien_id = :hocVienId 
                AND de_thi.mo_dun_id = :moDunId
                `,
                {
                    replacements: { hocVienId: student.hoc_vien_id, moDunId },
                    type: sequelize.QueryTypes.SELECT,
                }
            );

            const [soDeDat] = await sequelize.query(
                `
                SELECT COUNT(DISTINCT de_thi.de_thi_id) AS SL 
                FROM de_thi_hoc_vien 
                JOIN de_thi ON de_thi_hoc_vien.de_thi_id = de_thi.de_thi_id 
                WHERE de_thi.loai_de_thi_id = 1 
                AND de_thi_hoc_vien.dat_yeu_cau = true 
                AND de_thi.mo_dun_id = :moDunId 
                AND de_thi_hoc_vien.hoc_vien_id = :hocVienId
                `,
                {
                    replacements: { hocVienId: student.hoc_vien_id, moDunId },
                    type: sequelize.QueryTypes.SELECT,
                }
            );

            student.so_chuyen_de_da_hoc = soChuyenDeDaHoc.SL;
            student.so_chuyen_de_chua_hoc = soChuyenDe - soChuyenDeDaHoc.SL;
            student.tien_do = tongDe > 0 ? soDeDat.SL / tongDe : 0;
        })
    );

    return res.status(200).send({
        status: 'success',
        data: students,
        message: null,
    });
};

const getOfCourse = async (req, res) => {
    const khoaHocId = parseInt(req.params.id);

    const students = await sequelize.query(
        `
        SELECT DISTINCT hoc_vien.hoc_vien_id, hoc_vien.ho_ten, hoc_vien.ngay_sinh 
        FROM hoc_vien 
        JOIN khoa_hoc_hoc_vien ON hoc_vien.hoc_vien_id = khoa_hoc_hoc_vien.hoc_vien_id
        WHERE khoa_hoc_hoc_vien.khoa_hoc_id = :khoaHocId
        `,
        {
            replacements: { khoaHocId },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const [{ SL: soChuyenDe }] = await sequelize.query(
        `
        SELECT COUNT(chuyen_de.chuyen_de_id) AS SL 
        FROM chuyen_de 
        JOIN mo_dun ON chuyen_de.mo_dun_id = mo_dun.mo_dun_id 
        WHERE mo_dun.khoa_hoc_id = :khoaHocId
        `,
        {
            replacements: { khoaHocId },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const tongDe = await Exam.count({
        where: {
            loai_de_thi_id: 1,
            khoa_hoc_id: khoaHocId,
        },
    });

    await Promise.all(
        students.map(async (student) => {
            const [soChuyenDeDaHoc] = await sequelize.query(
                `
                SELECT COUNT(DISTINCT de_thi.chuyen_de_id) AS SL 
                FROM de_thi_hoc_vien 
                JOIN de_thi ON de_thi_hoc_vien.de_thi_id = de_thi.de_thi_id 
                WHERE de_thi.loai_de_thi_id = 1 
                AND de_thi_hoc_vien.dat_yeu_cau = true 
                AND de_thi.khoa_hoc_id = :khoaHocId 
                AND de_thi_hoc_vien.hoc_vien_id = :hocVienId
                `,
                {
                    replacements: { khoaHocId, hocVienId: student.hoc_vien_id },
                    type: sequelize.QueryTypes.SELECT,
                }
            );

            const [soDeDat] = await sequelize.query(
                `
                SELECT COUNT(DISTINCT de_thi.de_thi_id) AS SL 
                FROM de_thi_hoc_vien 
                JOIN de_thi ON de_thi_hoc_vien.de_thi_id = de_thi.de_thi_id 
                WHERE de_thi.loai_de_thi_id = 1 
                AND de_thi.khoa_hoc_id = :khoaHocId 
                AND de_thi_hoc_vien.dat_yeu_cau = true 
                AND de_thi_hoc_vien.hoc_vien_id = :hocVienId
                `,
                {
                    replacements: { khoaHocId, hocVienId: student.hoc_vien_id },
                    type: sequelize.QueryTypes.SELECT,
                }
            );

            student.so_chuyen_de_da_hoc = soChuyenDeDaHoc.SL;
            student.so_chuyen_de_chua_hoc = soChuyenDe - soChuyenDeDaHoc.SL;
            student.tien_do = tongDe > 0 ? soDeDat.SL / tongDe : 0;
        })
    );

    return res.status(200).send({
        status: 'success',
        data: students,
        message: null,
    });
};

const findOne = async (req, res) => {
    if (req.userId === Number(req.params.id) || req.role === 2) {
        const [student] = await sequelize.query(
            `
            SELECT hoc_vien.hoc_vien_id, hoc_vien.ho_ten, hoc_vien.gioi_tinh, hoc_vien.email, hoc_vien.anh_dai_dien, hoc_vien.gioi_thieu, hoc_vien.ngay_tao,
            hoc_vien.trang_thai, hoc_vien.sdt, hoc_vien.ngay_sinh, tinh_thanhpho.ten AS tinh, hoc_vien.ttp_id, hoc_vien.truong_hoc, hoc_vien.dia_chi, hoc_vien.university_unit
            FROM hoc_vien 
            LEFT JOIN tinh_thanhpho ON hoc_vien.ttp_id = tinh_thanhpho.ttp_id 
            WHERE hoc_vien.hoc_vien_id = :hoc_vien_id
            `,
            {
                replacements: { hoc_vien_id: parseInt(req.params.id) },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        return res.status(200).send({
            status: 'success',
            data: student || null,
            message: null,
        });
    } else {
        return res.status(401).send({
            status: 'fail',
            data: null,
            message: 'Bạn không có quyền đọc thông tin người dùng này',
        });
    }
};

const getByEmail = async (req, res) => {
    const student = await Student.findOne({
        where: {
            email: req.body.email,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: student,
        message: null,
    });
};

const create = async (req, res) => {
    const existingStudent = await Student.findOne({
        where: { email: req.body.email },
    });

    if (existingStudent) {
        return res.status(409).send({
            status: 'fail',
            data: existingStudent,
            message: 'Email already exists',
        });
    }

    const password = security.generatePassword();
    const newStudent = await Student.create({
        ...req.body,
        mat_khau: security.hashPassword(password),
        trang_thai: 1,
    });

    await sendMail(
        {
            gmail: req.body.email,
            password,
            ho_ten: req.body.ho_ten,
        },
        3
    );

    return res.status(200).send({
        status: 'success',
        data: newStudent,
        message: null,
    });
};

const postCreateAdmin = async (req, res) => {
    const student = await Student.findOne({
        where: { email: req.body.email },
    });

    if (student) {
        return res.status(409).send({
            status: 'fail',
            data: student,
            message: 'Email already exists',
        });
    }

    const password = 'Enno@123';

    const newStudent = await Student.create({
        ...req.body,
        mat_khau: security.hashPassword(password),
        trang_thai: 1,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: newStudent,
        message: null,
    });
};

//[GET] student/:id
const getUpdate = async (req, res) => {
    const student = await Student.findOne({
        where: {
            hoc_vien_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: student,
        message: null,
    });
};

const update = async (req, res) => {
    if (req.userId === Number(req.params.id) || req.role === 2) {
        let student = await Student.findOne({
            where: {
                email: req.body.email,
                hoc_vien_id: {
                    [Op.ne]: req.params.id,
                },
            },
        });

        if (student) {
            return res.status(404).send({
                status: 'fail',
                data: null,
                message: 'Email already exists',
            });
        }

        student = await Student.findOne({
            where: {
                hoc_vien_id: req.params.id,
            },
        });

        if (
            req.file &&
            student.anh_dai_dien &&
            fs.existsSync(`public${student.anh_dai_dien}`)
        ) {
            fs.unlinkSync(`public${student.anh_dai_dien}`);
        }

        if (req.body.mat_khau) {
            req.body.mat_khau = security.hashPassword(req.body.mat_khau);
        }

        await Student.update(
            { ...req.body },
            { where: { hoc_vien_id: req.params.id } }
        );

        return res.status(200).send({
            status: 'success',
            data: student,
            message: null,
        });
    } else {
        return res.status(401).send({
            status: 'fail',
            data: null,
            message: 'Bạn không có quyền đọc thông tin người dùng này',
        });
    }
};

const stateChange = async (req, res) => {
    const student = await Student.findOne({
        where: {
            hoc_vien_id: req.params.id,
        },
    });

    if (student) {
        const newStatus = student.trang_thai === 1 ? 0 : 1;

        await Student.update(
            { trang_thai: newStatus },
            { where: { hoc_vien_id: req.params.id } }
        );

        return res.status(200).send({
            status: 'success',
            data: null,
            message: null,
        });
    } else {
        return res.status(404).send({
            status: 'fail',
            data: null,
            message: 'Student not found',
        });
    }
};

const remove = async (req, res) => {
    const student = await Student.findOne({
        where: {
            hoc_vien_id: req.params.id,
        },
    });

    if (
        student &&
        student.anh_dai_dien &&
        fs.existsSync(`public${student.anh_dai_dien}`)
    ) {
        fs.unlinkSync(`public${student.anh_dai_dien}`);
    }

    await Student.destroy({
        where: {
            hoc_vien_id: req.params.id,
        },
    });

    await CourseStudent.destroy({
        where: {
            hoc_vien_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'Deleted successfully',
    });
};

const getCourseOfUser = async (req, res) => {
    const courses = await sequelize.query(
        `
        SELECT 
            hoc_vien.ho_ten, 
            hoc_vien.hoc_vien_id, 
            khoa_hoc.khoa_hoc_id, 
            khoa_hoc.ten_khoa_hoc, 
            khung_chuong_trinh.loai_kct,
            khoa_hoc.anh_dai_dien, 
            khoa_hoc.ngay_bat_dau, 
            khoa_hoc.ngay_ket_thuc, 
            khung_chuong_trinh.ten_khung_ct
        FROM hoc_vien 
        JOIN khoa_hoc_hoc_vien 
            ON hoc_vien.hoc_vien_id = khoa_hoc_hoc_vien.hoc_vien_id 
        JOIN khoa_hoc 
            ON khoa_hoc.khoa_hoc_id = khoa_hoc_hoc_vien.khoa_hoc_id 
        JOIN khung_chuong_trinh 
            ON khoa_hoc.kct_id = khung_chuong_trinh.kct_id 
        WHERE hoc_vien.hoc_vien_id = :hoc_vien_id`,
        {
            replacements: {
                hoc_vien_id: req.userId, // Sử dụng ID của người dùng
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    if (!courses || courses.length === 0) {
        return res.status(404).send({
            status: 'fail',
            data: null,
            message: 'No courses found for this student',
        });
    }

    return res.status(200).send({
        status: 'success',
        data: courses,
        message: null,
    });
};

const postCreateMoreByPrefix = async (req, res) => {
    const hashPassword = security.hashPassword(req.body.mat_khau);

    let formattedNumber;
    let data = [];
    for (let index = 1; index <= Number(req.body.so_luong); index++) {
        // Chuyển số thành chuỗi và thêm số 0 vào đầu nếu cần để có độ dài 3 ký tự
        formattedNumber = index.toString().padStart(3, '0');

        data.push({
            ho_ten: `${req.body.tien_to}${formattedNumber}`,
            ten_dang_nhap: `${req.body.tien_to}${formattedNumber}`,
            email: `${req.body.tien_to}${formattedNumber}@gmail.com`,
            mat_khau: hashPassword,
            trang_thai: 1,
        });
    }

    await sequelize.query(
        `INSERT IGNORE INTO hoc_vien (ho_ten, ten_dang_nhap, email, mat_khau, trang_thai)
            VALUES ${data
                .map(
                    (value) => `('${value.ho_ten}', '${value.ten_dang_nhap}', 
            '${value.email}', '${value.mat_khau}', '${value.trang_thai}')`
                )
                .join(',')};
            `,
        {
            type: sequelize.QueryTypes.INSERT,
        }
    );

    return res.status(200).send({
        status: 'success',
        message: 'Tạo nhiều tài khoản thành công!',
    });
};

module.exports = {
    getDetail,
    findAll,
    getAllv2,
    getOfCourse,
    getByEmail,
    getAllv3,
    findOne,
    addCourse,
    create,
    postCreateAdmin,
    getUpdate,
    update,
    stateChange,
    remove,
    getStatistical,
    getCourseOfUser,
    postCreateMoreByPrefix,
};
