const {
    Notification,
    Staff,
    Student,
    Teacher,
    Course,
    Modun,
    Thematic,
} = require('../models');
const sequelize = require('../utils/db');

const findAll = async (req, res) => {
    const { count, rows } = await Notification.findAndCountAll({
        where: {
            ...(req.query.loai_thong_bao && {
                loai_thong_bao: req.query.loai_thong_bao,
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

const getByUser = async (req, res) => {
    const { count, rows } = await Notification.findAndCountAll({
        where: {
            loai_quyen: req.role,
            nguoi_nhan_id: req.userId,
        },
        offset:
            (Number(req.query.pageIndex || 1) - 1) *
            Number(req.query.pageSize || 10),
        limit: Number(req.query.pageSize || 10),
        order: [['ngay_tao', 'DESC']],
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
    const notification = await Notification.findOne({
        where: {
            thong_bao_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: notification,
        message: null,
    });
};

const create = async (req, res) => {
    let user;
    if (req.role === 0) {
        user = await Student.findOne({ where: { hoc_vien_id: req.userId } });
        user.loai_quyen = 'Học viên';
    } else if (req.role === 1) {
        user = await Teacher.findOne({ where: { giao_vien_id: req.userId } });
        user.loai_quyen = 'Giáo viên';
    } else if (req.role === 2) {
        user = await Staff.findOne({ where: { nhan_vien_id: req.userId } });
        user.loai_quyen = 'Quản trị';
    }

    const notificationData = {
        loai_quyen: user.loai_quyen,
        nguoi_nhan_id: null, // To be set later
        noi_dung: '',
        lien_ket_id: req.body.lien_ket_id,
        link_lien_ket: req.body.link_lien_ket,
    };

    if (req.body.loai_thong_bao === 0) {
        // Bình luận chính
        const course = await Course.findOne({
            where: { khoa_hoc_id: req.query.khoa_hoc_id },
        });
        const modun = await Modun.findOne({
            where: { mo_dun_id: req.query.mo_dun_id },
        });

        if (req.query.loai_hoi_dap === 0) {
            // Chuyên đề
            const thematic = await Thematic.findOne({
                where: { chuyen_de_id: req.query.chuyen_de_id },
            });
            notificationData.noi_dung = `Khóa học ${course.ten_khoa_hoc}, Mô-đun ${modun.ten_mo_dun}, Chuyên đề ${thematic.ten_chuyen_de} Học viên ${user.ho_ten} đã đăng câu hỏi`;

            if (req.query.chuyen_tiep) {
                // Chuyển tiếp
                if (req.query.phu_trach_id) {
                    notificationData.nguoi_nhan_id = req.query.phu_trach_id;
                    await Notification.create(notificationData);
                }
            } else {
                await sequelize.query(
                    `INSERT INTO thong_bao (loai_thong_bao, nguoi_nhan_id, lien_ket_id, link_lien_ket, loai_quyen, noi_dung)
                     SELECT 0, nhan_vien.nhan_vien_id, :lien_ket_id, :link_lien_ket, 2, :noi_dung
                     FROM nhan_vien WHERE nhan_vien.trang_thai=true`,
                    {
                        replacements: {
                            lien_ket_id: req.body.lien_ket_id,
                            link_lien_ket: req.body.link_lien_ket,
                            noi_dung: notificationData.noi_dung,
                        },
                        type: sequelize.QueryTypes.INSERT,
                    }
                );

                if (req.query.phu_trach_id) {
                    notificationData.nguoi_nhan_id = req.query.phu_trach_id;
                    await Notification.create(notificationData);
                }
            }
        } else if (req.query.loai_hoi_dap === 1) {
            // Câu hỏi đề thi
            const exam = await sequelize.query(
                `SELECT de_thi.* FROM de_thi WHERE de_thi.de_thi_id = :de_thi_id`,
                {
                    replacements: { de_thi_id: req.query.de_thi_id },
                    type: sequelize.QueryTypes.SELECT,
                }
            );

            notificationData.noi_dung = `Khóa học ${
                course.ten_khoa_hoc
            }, Mô-đun ${modun ? `Mô-dun ${modun.ten_mo_dun},` : ''} Đề thi ${
                exam[0].ten_de_thi
            }, Câu hỏi số ${req.query.cau_hoi_so}: Học viên ${
                user.ho_ten
            } đã đăng câu hỏi`;

            await sequelize.query(
                `INSERT INTO thong_bao (loai_thong_bao, nguoi_nhan_id, lien_ket_id, link_lien_ket, loai_quyen, noi_dung)
                 SELECT 0, nhan_vien.nhan_vien_id, :lien_ket_id, :link_lien_ket, 2, :noi_dung
                 FROM nhan_vien WHERE nhan_vien.trang_thai=true`,
                {
                    replacements: {
                        lien_ket_id: req.body.lien_ket_id,
                        link_lien_ket: req.body.link_lien_ket,
                        noi_dung: notificationData.noi_dung,
                    },
                    type: sequelize.QueryTypes.INSERT,
                }
            );

            if (req.query.phu_trach_id) {
                notificationData.nguoi_nhan_id = req.query.phu_trach_id;
                await Notification.create(notificationData);
            }
        }
    } else if (req.body.loai_thong_bao === 1) {
        // Bình luận phụ
        const student = await sequelize.query(
            `SELECT hoc_vien.hoc_vien_id, hoc_vien.ho_ten FROM hoc_vien 
             JOIN binh_luan ON binh_luan.hoc_vien_id = hoc_vien.hoc_vien_id 
             JOIN binh_luan_phu ON binh_luan.binh_luan_id = binh_luan_phu.binh_luan_id 
             WHERE binh_luan_phu.binh_luan_phu_id = :lien_ket_id`,
            {
                replacements: { lien_ket_id: req.body.lien_ket_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        notificationData.noi_dung = `${user.loai_quyen} ${user.ho_ten} đã bình luận trong câu hỏi của bạn`;
        await sequelize.query(
            `INSERT INTO thong_bao (loai_thong_bao, nguoi_nhan_id, lien_ket_id, link_lien_ket, loai_quyen, noi_dung)
             VALUES (1, :hoc_vien_id, :lien_ket_id, :link_lien_ket, 0, :noi_dung)`,
            {
                replacements: {
                    hoc_vien_id: student[0].hoc_vien_id,
                    lien_ket_id: req.body.lien_ket_id,
                    link_lien_ket: req.body.link_lien_ket,
                    noi_dung: notificationData.noi_dung,
                },
                type: sequelize.QueryTypes.INSERT,
            }
        );

        await sequelize.query(
            `INSERT INTO thong_bao (loai_thong_bao, nguoi_nhan_id, lien_ket_id, link_lien_ket, loai_quyen, noi_dung)
             SELECT 1, binh_luan_phu.nguoi_tra_loi_id, :lien_ket_id, :link_lien_ket, binh_luan_phu.loai_quyen,
             :noi_dung FROM binh_luan_phu WHERE binh_luan_phu.binh_luan_id = (SELECT binh_luan_phu.binh_luan_id
             FROM binh_luan_phu WHERE binh_luan_phu.binh_luan_phu_id = :lien_ket_id)`,
            {
                replacements: {
                    lien_ket_id: req.body.lien_ket_id,
                    link_lien_ket: req.body.link_lien_ket,
                    noi_dung: `${user.loai_quyen} ${user.ho_ten} đã bình luận trong câu hỏi của ${student[0].ho_ten}`,
                },
                type: sequelize.QueryTypes.INSERT,
            }
        );
    } else if (req.body.loai_thong_bao === 2) {
        // Hoá đơn
        const invoice = await sequelize.query(
            `SELECT hoa_don.hoc_vien_id, hoa_don_chi_tiet.loai_san_pham, hoa_don_chi_tiet.san_pham_id 
             FROM hoa_don 
             JOIN hoa_don_chi_tiet ON hoa_don.hoa_don_id = hoa_don_chi_tiet.hoa_don_id 
             WHERE hoa_don.hoa_don_id = :lien_ket_id`,
            {
                replacements: { lien_ket_id: req.body.lien_ket_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (invoice[0].loai_san_pham === 'Khóa học') {
            const course = await Course.findOne({
                where: { khoa_hoc_id: invoice[0].san_pham_id },
            });
            notificationData.noi_dung = `Bạn đã mua khóa học ${course.ten_khoa_hoc} thành công`;
            notificationData.nguoi_nhan_id = invoice[0].hoc_vien_id;
            await Notification.create(notificationData);
        }
    }

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const update = async (req, res) => {
    await Notification.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                thong_bao_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const changeStatev2 = async (req, res) => {
    await Notification.update(
        {
            trang_thai: true,
            nguoi_sua: req.userId,
        },
        {
            where: {
                thong_bao_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const changeState = async (req, res) => {
    await Notification.update(
        {
            trang_thai: true,
            nguoi_sua: req.userId,
        },
        {
            where: {
                loai_quyen: req.role,
                nguoi_nhan_id: req.userId,
                trang_thai: false,
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
    await Notification.destroy({
        where: {
            thong_bao_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

module.exports = {
    findAll,
    findOne,
    getByUser,
    changeState,
    changeStatev2,
    create,
    update,
    remove,
};
