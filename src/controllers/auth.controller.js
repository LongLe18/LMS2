const axios = require('axios');

const {
    Student,
    Staff,
    Teacher,
    Role,
    PositionPermission,
    Permission,
} = require('../models');
const security = require('../utils/security');
const sendMail = require('../services/mail.service');
const { api, captcha, oauth } = require('../config');
const sequelize = require('../utils/db');

const findAll = async (req, res) => {
    const pageIndex = Number(req.query.pageIndex || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const offset = (pageIndex - 1) * pageSize;
    const limit = pageSize;

    const order = req.query.sortBy
        ? req.query.sortBy.split(',')
        : ['ngay_tao', 'DESC'];

    const countResult = await sequelize.query(
        `
        SELECT COUNT(*) AS count FROM (
            SELECT ho_ten, email, ngay_tao FROM hoc_vien
            UNION
            SELECT ho_ten, email, ngay_tao FROM nhan_vien
            UNION
            SELECT ho_ten, email, ngay_tao FROM giao_vien
        ) AS users
        `,
        { type: sequelize.QueryTypes.SELECT }
    );

    const rows = await sequelize.query(
        `
        SELECT * FROM (
            SELECT ho_ten, email, anh_dai_dien, ngay_tao FROM hoc_vien
            UNION
            SELECT ho_ten, email, anh_dai_dien, ngay_tao FROM nhan_vien
            UNION
            SELECT ho_ten, email, anh_dai_dien, ngay_tao FROM giao_vien
        ) AS users
        ORDER BY ${order[0]} ${order[1]}
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements: { offset, limit },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const count = Number(countResult[0].count);

    return res.status(200).send({
        status: 'success',
        data: rows,
        pageIndex,
        pageSize,
        totalCount: count,
        totalPage: Math.ceil(count / pageSize),
        message: null,
    });
};

const getProfile = async (req, res) => {
    const student = await Student.findOne({
        where: {
            hoc_vien_id: req.userId,
        },
    });
    if (student) {
        const { mat_khau, ...safeStudent } = student.toJSON();

        return res.status(200).send({
            status: 'success',
            data: safeStudent,
            message: null,
        });
    }

    return res.status(401).send({
        status: 'error',
        data: null,
        message: null,
    });
};

const loginv1 = async (req, res) => {
    const student = await Student.findOne({
        where: {
            email: req.body.email,
        },
    });
    if (student) {
        if (security.comparePassword(student.mat_khau, req.body.mat_khau)) {
            if (student.trang_thai === false || student.trang_thai === 2) {
                return res.status(200).send({
                    status: 'fail',
                    data: null,
                    message: `Tài khoản chưa được kích hoạt`,
                });
            }
            const accessToken = security.generateToken(
                { userId: student.hoc_vien_id, role: 0 },
                '5h'
            );
            const refreshToken = security.generateRefreshToken({
                userId: student.hoc_vien_id,
                role: 0,
            });
            return res.status(200).send({
                access_token: accessToken,
                token_type: 'Bearer',
                expires_in: '5h',
                refresh_token: refreshToken,
                scope: 'create',
            });
        }
    }

    return res.status(200).send({
        status: 'fail',
        data: null,
        message: `Email hoặc mật khẩu không đúng`,
    });
};

const loginv2 = async (req, res) => {
    const teacher = await Teacher.findOne({
        where: {
            email: req.body.email,
        },
    });
    if (teacher) {
        if (security.comparePassword(teacher.mat_khau, req.body.mat_khau)) {
            if (!teacher.trang_thai) {
                return res.status(200).send({
                    status: 'fail',
                    data: null,
                    message: `Tài khoản chưa được kích hoạt`,
                });
            }
            const accessToken = security.generateToken(
                { userId: teacher.giao_vien_id, role: 1 },
                '5h'
            );
            const refreshToken = security.generateRefreshToken({
                userId: teacher.giao_vien_id,
                role: 1,
            });
            return res.status(200).send({
                access_token: accessToken,
                token_type: 'Bearer',
                expires_in: '5h',
                refresh_token: refreshToken,
                scope: 'create',
            });
        }
    }

    return res.status(200).send({
        status: 'fail',
        data: null,
        message: `Email hoặc mật khẩu không đúng`,
    });
};

const loginv3 = async (req, res) => {
    const staff = await Staff.findOne({
        where: {
            email: req.body.email,
        },
    });
    if (staff) {
        if (security.comparePassword(staff.mat_khau, req.body.mat_khau)) {
            if (!staff.trang_thai) {
                return res.status(200).send({
                    status: 'fail',
                    data: null,
                    message: `Tài khoản chưa được kích hoạt`,
                });
            }
            const role = await Role.findOne({
                where: {
                    quyen_id: staff.phan_quyen_id,
                },
            });
            const type = `${role.quyen_he_thong}${role.quyen_nhan_su}${role.quyen_kinh_doanh}${role.quyen_khao_thi}`;
            const accessToken = security.generateToken(
                {
                    userId: staff.nhan_vien_id,
                    role: 2,
                    positionId: staff.chuc_vu_id,
                    departmentId: staff.don_vi_id,
                    type: type,
                },
                '5h'
            );
            const refreshToken = security.generateRefreshToken({
                userId: staff.nhan_vien_id,
                role: 2,
                type: type,
            });

            const positionPermissions = await PositionPermission.findAll({
                include: [
                    {
                        model: Permission,
                    },
                ],
                where: {
                    chuc_vu_id: staff.chuc_vu_id,
                },
            });
            const permissions = positionPermissions.map(
                (item) => item.quyen_truy_cap.hanh_dong
            );

            return res.status(200).send({
                access_token: accessToken,
                token_type: 'Bearer',
                expires_in: '5h',
                refresh_token: refreshToken,
                scope: 'create',
                permissions,
            });
        }
    }

    return res.status(200).send({
        status: 'fail',
        data: null,
        message: `Email hoặc mật khẩu không đúng`,
    });
};

const register = async (req, res) => {
    const { token } = req.body;
    await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${captcha.secretKey}&response=${token}`
    );
    if (
        !req.body.email.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
    ) {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'Email is not valid',
        });
    }
    if (res.status(200)) {
        let student = await Student.findOne({
            where: {
                email: req.body.email,
            },
        });
        if (student) {
            return res.status(409).send({
                status: 'fail',
                data: null,
                message: 'Email already exists!',
            });
        } else {
            req.body.mat_khau = security.hashPassword(req.body.mat_khau);
            student = await Student.create({
                ...req.body,
                trang_thai: 2,
            });
            const token = security.generateToken(
                { gmail: student.email, accountType: 0 },
                '5h'
            );
            const content = {
                gmail: req.body.email,
                token: token,
                ho_ten: student.ho_ten,
            };
            await sendMail(content, 1);

            return res.status(200).send({
                status: 'success',
                data: null,
                message: null,
            });
        }
    }

    return res.status(404).send({
        status: 'error',
        data: null,
        message: null,
    });
};

const changePassword = async (req, res) => {
    const hassPass = security.hashPassword(req.body.mat_khau_moi);
    if (req.role == 2) {
        const staff = await Staff.findOne({
            where: {
                nhan_vien_id: req.userId,
            },
        });
        if (security.comparePassword(staff.mat_khau, req.body.mat_khau_cu)) {
            await Staff.update(
                {
                    mat_khau: hassPass,
                },
                {
                    where: {
                        nhan_vien_id: req.userId,
                    },
                }
            );

            return res.status(200).send({
                status: 'success',
                data: null,
                message: 'Cập nhật mật khẩu thành công',
            });
        }
    } else if (req.role == 1) {
        const teacher = await Teacher.findOne({
            where: {
                giao_vien_id: req.userId,
            },
        });
        if (security.comparePassword(teacher.mat_khau, req.body.mat_khau_cu)) {
            await Teacher.update(
                {
                    mat_khau: hassPass,
                },
                {
                    where: {
                        giao_vien_id: req.userId,
                    },
                }
            );
            return res.status(200).send({
                status: 'success',
                data: null,
                message: 'Cập nhật mật khẩu thành công',
            });
        }
    } else if (req.role == 0) {
        const student = await Student.findOne({
            where: {
                hoc_vien_id: req.userId,
            },
        });
        if (security.comparePassword(student.mat_khau, req.body.mat_khau_cu)) {
            await Student.update(
                {
                    mat_khau: hassPass,
                },
                {
                    where: {
                        hoc_vien_id: req.userId,
                    },
                }
            );
            return res.status(200).send({
                status: 'success',
                data: null,
                message: 'Cập nhật mật khẩu thành công',
            });
        }
    }

    return res.status(200).send({
        status: 'fail',
        data: null,
        message: 'Sai mật khẩu',
    });
};

const authGoogle = async (req, res) => {
    if (req.query.loai_tai_khoan == 1) {
        let student = await Student.findOne({
            where: {
                email: req.user.emails[0].value,
            },
        });
        if (student) {
            if (student.trang_thai != 1) {
                await Student.update(
                    {
                        trang_thai: true,
                    },
                    {
                        where: {
                            hoc_vien_id: student.hoc_vien_id,
                        },
                    }
                );
            }
        } else {
            const password = security.generatePassword();
            student = await Student.create({
                email: req.user.emails[0].value,
                ho_ten: req.user.displayName,
                mat_khau: security.hashPassword(password),
                trang_thai: 1,
            });
            const content = {
                gmail: req.user.emails[0].value,
                password: password,
                ho_ten: req.user.displayName,
            };
            await sendMail(content, 3);
        }
        res.redirect(oauth.REDIRECT_DOMAIN + req.query.url);
    } else {
        res.status(404).send({
            status: 'error',
            data: null,
            message: null,
        });
    }
};

const authError = async (req, res) => {
    res.status(404).send({
        status: 'error',
        data: null,
        message: null,
    });
};

const forgetPassword = async (req, res) => {
    if (req.query.loai_tai_khoan == 1) {
        const { token } = req.body;
        await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${captcha.secretKey}&response=${token}`
        );
        if (
            !req.body.email.match(
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
        ) {
            return res.status(404).send({
                status: 'error',
                data: null,
                message: 'Email is not valid',
            });
        }
        if (res.status(200)) {
            const password = security.generatePassword();
            const student = await Student.findOne({
                where: {
                    trang_thai: true,
                    email: req.body.email,
                },
            });
            if (student) {
                await Student.update(
                    {
                        mat_khau: security.hashPassword(password),
                    },
                    {
                        where: {
                            email: req.body.email,
                        },
                    }
                );
                const content = {
                    ho_ten: student.ho_ten,
                    gmail: req.body.email,
                    password: password,
                };
                await sendMail(content, 2);

                return res.status(200).send({
                    status: 'success',
                    data: null,
                    message: null,
                });
            }
        } else {
            return res.status(200).send({
                status: 'fail',
                data: null,
                message: 'Captcha is incorrect',
            });
        }
    }

    return res.status(404).send({
        status: 'error',
        data: null,
        message: null,
    });
};

const confirm = async (req, res) => {
    const decodedToken = security.verifyToken(req.params.token);
    if (decodedToken.accountType == 0) {
        await Student.update(
            {
                trang_thai: 1,
            },
            {
                where: {
                    email: decodedToken.gmail,
                },
            }
        );
        res.redirect(api.login_url);
    } else {
        res.status(404).send({
            status: 'fail',
            data: null,
            message: null,
        });
    }
};

const updateProfile = async (req, res) => {
    await Student.update(
        { ...req.body },
        {
            where: {
                hoc_vien_id: req.userId,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const confirmv2 = async (req, res) => {
    const decodedToken = security.verifyToken(req.params.token);
    if (decodedToken.accountType == 0) {
        await Student.update(
            {
                trang_thai: 1,
            },
            {
                where: {
                    email: decodedToken.gmail,
                },
            }
        );
        res.redirect('https://www.tainangtienganhthudo.vn/');
    } else {
        res.status(404).send({
            status: 'fail',
            data: null,
            message: null,
        });
    }
};

module.exports = {
    findAll,
    loginv1,
    loginv2,
    loginv3,
    register,
    changePassword,
    authGoogle,
    authError,
    forgetPassword,
    confirm,
    getProfile,
    updateProfile,
    confirmv2,
};
