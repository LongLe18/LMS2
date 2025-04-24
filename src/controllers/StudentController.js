const {
    Student,
    Thematic,
    Exam,
    CourseStudent,
    Course,
    Province,
} = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../utils/db');
const security = require('../utils/security');
const fs = require('fs');
const sendMail = require('../services/mail');
const crypto = require('crypto');

const getStatistical = async (req, res, next) => {
    let search = 1;
    let khoa_hoc_id = 1;
    if (req.query.khoa_hoc_id) {
        khoa_hoc_id = `khoa_hoc_hoc_vien.khoa_hoc_id=:khoa_hoc_id`;
    }
    if (req.query.search) {
        search = `hoc_vien.ho_ten LIKE :search`;
    }
    const students = await sequelize.query(
        `
        SELECT DISTINCT hoc_vien.hoc_vien_id, hoc_vien.email, hoc_vien.ho_ten, hoc_vien.sdt, khoa_hoc.ten_khoa_hoc
        FROM hoc_vien JOIN khoa_hoc_hoc_vien ON khoa_hoc_hoc_vien.hoc_vien_id=hoc_vien.hoc_vien_id JOIN  
        khoa_hoc ON khoa_hoc_hoc_vien.khoa_hoc_id=khoa_hoc.khoa_hoc_id   
        WHERE ${search} AND ${khoa_hoc_id} ORDER BY hoc_vien.hoc_vien_id DESC LIMIT 100000`,
        {
            replacements: {
                search: `%${decodeURI(req.query.search)}%`,
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.status(200).send({
        status: 'success',
        data: students,
        message: null,
    });
};

//[GET] student?id
const getAll = async (req, res) => {
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

const getAllv2 = async (req, res) => {
    let filter = {};
    if (req.query.diem_tuan) {
        filter.diem_tuan = 'AND WEEK(de_thi_hoc_vien.ngay_tao)=WEEK(NOW())';
    } else {
        filter.diem_tuan = '';
    }
    let students = await sequelize.query(
        `SELECT hoc_vien.hoc_vien_id, hoc_vien.ho_ten, hoc_vien.anh_dai_dien, (SELECT SUM(ket_qua_diem)
        FROM de_thi_hoc_vien WHERE de_thi_hoc_vien.hoc_vien_id=hoc_vien.hoc_vien_id
        ${filter.diem_tuan}) AS diem FROM hoc_vien ORDER BY diem DESC LIMIT 20`,
        { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).send({
        status: 'success',
        data: students,
        message: null,
    });
};

const getAllv3 = async (req, res) => {
    let studentsWeek = await sequelize.query(
        `SELECT hoc_vien.hoc_vien_id, hoc_vien.ho_ten, hoc_vien.anh_dai_dien, (SELECT SUM(ket_qua_diem)
        FROM de_thi_hoc_vien WHERE de_thi_hoc_vien.hoc_vien_id=hoc_vien.hoc_vien_id
        AND WEEK(de_thi_hoc_vien.ngay_tao)=WEEK(NOW())) AS diem FROM hoc_vien
        ORDER BY diem DESC LIMIT 20`,
        { type: sequelize.QueryTypes.SELECT }
    );
    let studentsFull = await sequelize.query(
        `SELECT hoc_vien.hoc_vien_id, hoc_vien.ho_ten, hoc_vien.anh_dai_dien, (SELECT SUM(ket_qua_diem)
        FROM de_thi_hoc_vien WHERE de_thi_hoc_vien.hoc_vien_id=hoc_vien.hoc_vien_id) 
        AS diem FROM hoc_vien ORDER BY diem DESC LIMIT 20`,
        { type: sequelize.QueryTypes.SELECT }
    );
    let user = {};
    studentsWeek.forEach((student, index) => {
        if (student.diem === null) student.diem = 0;
        if (student.hoc_vien_id == req.userId) {
            user.week = {
                ...student,
                index,
            };
        }
    });
    studentsFull.forEach((student, index) => {
        if (student.diem === null) student.diem = 0;
        if (student.hoc_vien_id == req.userId) {
            user.full = {
                ...student,
                index,
            };
        }
    });
    res.status(200).send({
        status: 'success',
        data: { user, studentsWeek, studentsFull },
        message: null,
    });
};

const addCourse = async (req, res) => {
    let data = [];
    let khoa_hoc_ids = req.body.khoa_hoc_id.split(',');
    for (const khoa_hoc_id of khoa_hoc_ids) {
        data.push({
            khoa_hoc_id: khoa_hoc_id,
            hoc_vien_id: req.params.id,
        });
    }
    await CourseStudent.bulkCreate(data);
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const getDetail = async (req, res) => {
    let students = await sequelize.query(
        `
        SELECT DISTINCT hoc_vien.hoc_vien_id, hoc_vien.ho_ten, hoc_vien.ngay_sinh FROM hoc_vien JOIN hoa_don 
        ON hoc_vien.hoc_vien_id=hoa_don.hoc_vien_id JOIN hoa_don_chi_tiet ON hoa_don.hoa_don_id=hoa_don_chi_tiet.hoa_don_id 
        JOIN khoa_hoc ON khoa_hoc.khoa_hoc_id=hoa_don_chi_tiet.san_pham_id JOIN mo_dun ON khoa_hoc.khoa_hoc_id=mo_dun.mo_dun_id 
        WHERE hoa_don_chi_tiet.loai_san_pham='Khóa học' AND hoa_don.trang_thai=true AND hoa_don_chi_tiet.san_pham_id=:san_pham_id
        AND mo_dun.giao_vien_id=${req.userId}`,
        {
            replacements: {
                san_pham_id: parseInt(req.query.khoa_hoc_id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    let so_chuyen_de_da_hoc;
    let so_chuyen_de = await Thematic.count({
        where: {
            mo_dun_id: req.query.mo_dun_id,
        },
    });
    let tong_de = await Exam.count({
        where: {
            loai_de_thi_id: 1,
            mo_dun_id: req.query.mo_dun_id,
        },
    });
    for (const student of students) {
        so_chuyen_de_da_hoc = await sequelize.query(
            `
            SELECT COUNT(DISTINCT de_thi.chuyen_de_id) SL FROM de_thi_hoc_vien JOIN de_thi ON de_thi_hoc_vien.de_thi_id=de_thi.de_thi_id 
            WHERE de_thi.loai_de_thi_id=1 AND de_thi_hoc_vien.dat_yeu_cau=true 
            AND de_thi_hoc_vien.hoc_vien_id=${student.hoc_vien_id} AND de_thi.mo_dun_id=:mo_dun_id`,
            {
                replacements: {
                    mo_dun_id: parseInt(req.query.mo_dun_id),
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        so_de_dat = await sequelize.query(
            `
            SELECT COUNT(DISTINCT de_thi.de_thi_id) AS SL FROM de_thi_hoc_vien JOIN de_thi ON de_thi_hoc_vien.de_thi_id = de_thi.de_thi_id 
            WHERE de_thi.loai_de_thi_id=1 AND de_thi_hoc_vien.dat_yeu_cau=true AND de_thi.mo_dun_id=:mo_dun_id 
            AND de_thi_hoc_vien.hoc_vien_id=${student.hoc_vien_id}`,
            {
                replacements: {
                    mo_dun_id: parseInt(req.query.mo_dun_id),
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        student.so_chuyen_de_da_hoc = so_chuyen_de_da_hoc[0].SL;
        student.so_chuyen_de_chua_hoc =
            so_chuyen_de - so_chuyen_de_da_hoc[0].SL;
        student.tien_do = so_de_dat[0].SL / tong_de;
    }
    res.status(200).send({
        status: 'success',
        data: students,
        message: null,
    });
};

const getOfCourse = async (req, res) => {
    let students = await sequelize.query(
        `
        SELECT DISTINCT hoc_vien.hoc_vien_id, hoc_vien.ho_ten, hoc_vien.ngay_sinh FROM hoc_vien JOIN khoa_hoc_hoc_vien 
        ON hoc_vien.hoc_vien_id=khoa_hoc_hoc_vien.hoc_vien_id
        WHERE khoa_hoc_hoc_vien.khoa_hoc_id=:khoa_hoc_id`,
        {
            replacements: {
                khoa_hoc_id: parseInt(req.params.id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    let so_chuyen_de_da_hoc;
    let so_chuyen_de = await sequelize.query(
        `
        SELECT COUNT(chuyen_de.chuyen_de_id) AS SL FROM chuyen_de JOIN mo_dun ON 
        chuyen_de.mo_dun_id=mo_dun.mo_dun_id WHERE mo_dun.khoa_hoc_id=:khoa_hoc_id`,
        {
            replacements: {
                khoa_hoc_id: parseInt(req.params.id),
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    let tong_de = await Exam.count({
        where: {
            loai_de_thi_id: 1,
            khoa_hoc_id: req.params.id,
        },
    });
    for (const student of students) {
        so_chuyen_de_da_hoc = await sequelize.query(
            `
            SELECT COUNT(DISTINCT de_thi.chuyen_de_id) SL FROM de_thi_hoc_vien JOIN de_thi ON de_thi_hoc_vien.de_thi_id=de_thi.de_thi_id 
            WHERE de_thi.loai_de_thi_id=1 AND de_thi_hoc_vien.dat_yeu_cau=true 
            AND de_thi_hoc_vien.hoc_vien_id=${student.hoc_vien_id} AND de_thi.khoa_hoc_id=:khoa_hoc_id`,
            {
                replacements: {
                    khoa_hoc_id: parseInt(req.params.id),
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        so_de_dat = await sequelize.query(
            `
            SELECT COUNT(DISTINCT de_thi.de_thi_id) AS SL FROM de_thi_hoc_vien JOIN de_thi ON de_thi_hoc_vien.de_thi_id = de_thi.de_thi_id 
            WHERE de_thi.loai_de_thi_id=1 AND de_thi_hoc_vien.dat_yeu_cau=true AND de_thi.khoa_hoc_id=:khoa_hoc_id 
            AND de_thi_hoc_vien.hoc_vien_id=${student.hoc_vien_id}`,
            {
                replacements: {
                    khoa_hoc_id: parseInt(req.params.id),
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        student.so_chuyen_de_da_hoc = so_chuyen_de_da_hoc[0].SL;
        student.so_chuyen_de_chua_hoc =
            so_chuyen_de[0].SL - so_chuyen_de_da_hoc[0].SL;
        student.tien_do = isNaN(so_de_dat[0].SL / tong_de)
            ? '0'
            : so_de_dat[0].SL / tong_de;
    }
    res.status(200).send({
        status: 'success',
        data: students,
        message: null,
    });
};

//[GET] student/:id
const getById = async (req, res) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            res.status(401).send({
                status: 'fail',
                data: null,
                message: 'Bạn không có quyền đọc thông tin người dùng này',
            });
        } else {
            const decodedToken = security.verifyToken(token);
            if (
                decodedToken.userId === Number(req.params.id) ||
                decodedToken.role === 2
            ) {
                let student = await sequelize.query(
                    `
                    SELECT hoc_vien.hoc_vien_id, hoc_vien.ho_ten, hoc_vien.gioi_tinh, hoc_vien.email, hoc_vien.anh_dai_dien, hoc_vien.gioi_thieu, hoc_vien.ngay_tao,
                    hoc_vien.trang_thai, hoc_vien.sdt, hoc_vien.ngay_sinh, tinh_thanhpho.ten AS tinh, hoc_vien.ttp_id, hoc_vien.truong_hoc, hoc_vien.dia_chi , hoc_vien.university_unit
                    FROM hoc_vien LEFT JOIN tinh_thanhpho ON hoc_vien.ttp_id=tinh_thanhpho.ttp_id 
                    WHERE hoc_vien.hoc_vien_id=:hoc_vien_id`,
                    {
                        replacements: {
                            hoc_vien_id: parseInt(req.params.id),
                        },
                        type: sequelize.QueryTypes.SELECT,
                    }
                );
                res.status(200).send({
                    status: 'success',
                    data: student[0],
                    message: null,
                });
            } else {
                res.status(401).send({
                    status: 'fail',
                    data: null,
                    message: 'Bạn không có quyền đọc thông tin người dùng này',
                });
            }
        }
    } catch (error) {
        res.status(401).send({
            status: 'fail',
            data: null,
            message:
                'Bạn không có quyền đọc thông tin người dùng này: ' + error,
        });
    }
};

const getByEmail = async (req, res) => {
    let student = await Student.findOne({
        where: {
            email: req.body.email,
        },
    });
    res.status(200).send({
        status: 'success',
        data: student,
        message: null,
    });
};

//[GET] student/create
const getCreate = async (req, res) => {
    res.send('create');
};

//[POST] student/create
const postCreate = async (req, res) => {
    let student = await Student.findOne({
        where: {
            email: req.body.email,
        },
    });
    if (student)
        return res.status(409).send({
            status: 'fail',
            data: student,
            message: 'Email already exists',
        });

    const password = security.generatePassword();
    await Student.create({
        ...req.body,
        mat_khau: security.hashPassword(password),
        trang_thai: 1,
    });
    const content = {
        gmail: req.body.email,
        password: password,
        ho_ten: req.body.ho_ten,
    };
    await sendMail(content, 3);
    student = await Student.findOne({
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

//[POST] student/adminCreate
// Hàm do admin tạo tài khoản cho học viên
const postCreateAdmin = async (req, res) => {
    let student = await Student.findOne({
        where: {
            email: req.body.email,
        },
    });
    if (student)
        res.status(409).send({
            status: 'fail',
            data: student,
            message: 'Email already exists',
        });
    else {
        const password = 'Enno@123';
        await Student.create({
            ...req.body,
            mat_khau: security.hashPassword(password),
            trang_thai: 1,
        });
        student = await Student.findOne({
            where: {
                email: req.body.email,
            },
        });
        res.status(200).send({
            status: 'success',
            data: student,
            message: null,
        });
    }
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

//[PUT] student/:id/edit
const putUpdate = async (req, res) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            res.status(401).send({
                status: 'success',
                data: null,
                message: 'Bạn không có quyền đọc thông tin người dùng này',
            });
        } else {
            const decodedToken = security.verifyToken(token);
            if (
                decodedToken.userId === Number(req.params.id) ||
                decodedToken.role === 2
            ) {
                let student = await Student.findOne({
                    where: {
                        email: req.body.email,
                        hoc_vien_id: {
                            [Op.ne]: req.params.id,
                        },
                    },
                });
                if (student)
                    res.status(404).send({
                        status: 'fail',
                        data: null,
                        message: 'Email already exists',
                    });
                else {
                    student = await Student.findOne({
                        where: {
                            hoc_vien_id: req.params.id,
                        },
                    });
                    if (
                        req.file &&
                        student.anh_dai_dien &&
                        fs.existsSync(`public${student.anh_dai_dien}`)
                    )
                        fs.unlinkSync(`public${student.anh_dai_dien}`);
                    if (req.body.mat_khau)
                        req.body.mat_khau = security.hashPassword(
                            req.body.mat_khau
                        );
                    await Student.update(
                        {
                            ...req.body,
                        },
                        {
                            where: {
                                hoc_vien_id: req.params.id,
                            },
                        }
                    );
                    res.status(200).send({
                        status: 'success',
                        data: student,
                        message: null,
                    });
                }
            } else {
                res.status(401).send({
                    status: 'success',
                    data: null,
                    message: 'Bạn không có quyền đọc thông tin người dùng này',
                });
            }
        }
    } catch (error) {
        res.status(401).send({
            status: 'fail',
            data: null,
            message:
                'Bạn không có quyền đọc thông tin người dùng này: ' + error,
        });
    }
};

//[DELETE] student/:id
const stateChange = async (req, res) => {
    const student = await Student.findOne({
        where: {
            hoc_vien_id: req.params.id,
        },
    });
    if (student.trang_thai != 1) {
        await Student.update(
            {
                trang_thai: 1,
            },
            {
                where: {
                    hoc_vien_id: req.params.id,
                },
            }
        );
    } else if (student.trang_thai != 0) {
        await Student.update(
            {
                trang_thai: 0,
            },
            {
                where: {
                    hoc_vien_id: req.params.id,
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

//[DELETE] student/:id/force
const forceDelete = async (req, res) => {
    const student = await Student.findOne({
        where: {
            hoc_vien_id: req.params.id,
        },
    });
    if (student.anh_dai_dien && fs.existsSync(`public${student.anh_dai_dien}`))
        fs.unlinkSync(`public${student.anh_dai_dien}`);
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
    res.send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

const getCourseOfUser = async (req, res) => {
    const courses = await sequelize.query(
        `
        SELECT hoc_vien.ho_ten, hoc_vien.hoc_vien_id, khoa_hoc.khoa_hoc_id, khoa_hoc.ten_khoa_hoc, khung_chuong_trinh.loai_kct,
        khoa_hoc.anh_dai_dien, khoa_hoc.ngay_bat_dau, khoa_hoc.ngay_ket_thuc, khung_chuong_trinh.ten_khung_ct FROM hoc_vien JOIN 
        khoa_hoc_hoc_vien ON hoc_vien.hoc_vien_id=khoa_hoc_hoc_vien.hoc_vien_id JOIN khoa_hoc ON 
        khoa_hoc.khoa_hoc_id=khoa_hoc_hoc_vien.khoa_hoc_id JOIN khung_chuong_trinh ON khoa_hoc.kct_id=khung_chuong_trinh.kct_id 
        WHERE hoc_vien.hoc_vien_id =:hoc_vien_id`,
        {
            replacements: {
                hoc_vien_id: req.userId,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
    res.send({
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
    getAll,
    getAllv2,
    getOfCourse,
    getByEmail,
    getAllv3,
    getById,
    getCreate,
    addCourse,
    postCreate,
    postCreateAdmin,
    getUpdate,
    putUpdate,
    stateChange,
    forceDelete,
    getStatistical,
    getCourseOfUser,
    postCreateMoreByPrefix,
};
