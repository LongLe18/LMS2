const fs = require('fs');

const { TeacherCourseAd } = require('../models');
const sequelize = require('../utils/db');
const { find } = require('../models/course.model');

const findAll = async (req, res) => {
    let trang_thai = 1;
    if (req.query.trang_thai) {
        trang_thai = `quang_cao_gv_kh.trang_thai = :trang_thai`;
    }

    const teacherCourseAds = await sequelize.query(
        `
    SELECT quang_cao_gv_kh.*, giao_vien.ho_ten AS ten_giao_vien, khoa_hoc.ten_khoa_hoc 
    FROM quang_cao_gv_kh
    JOIN giao_vien ON quang_cao_gv_kh.giao_vien_id = giao_vien.giao_vien_id
    JOIN khoa_hoc ON khoa_hoc.khoa_hoc_id = quang_cao_gv_kh.khoa_hoc_id
    WHERE ${trang_thai} 
    LIMIT 100`,
        {
            replacements: {
                trang_thai: parseInt(req.query.trang_thai) || 1, // Default value if no query parameter
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: teacherCourseAds,
        message: null,
    });
};

const findOne = async (req, res) => {
    const teacherCourseAd = await TeacherCourseAd.findOne({
        where: {
            qcgvkh_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: teacherCourseAd,
        message: null,
    });
};

const create = async (req, res) => {
    const teacherCourseAd = await TeacherCourseAd.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: teacherCourseAd,
        message: null,
    });
};

const update = async (req, res) => {
    if (req.file) {
        try {
            const teacherCourseAd = await TeacherCourseAd.findOne({
                where: {
                    qcgvkh_id: req.params.id,
                },
            });

            // Kiểm tra nếu có ảnh đại diện và file tồn tại
            if (teacherCourseAd && teacherCourseAd.anh_dai_dien) {
                const filePath = path.join(
                    'public',
                    teacherCourseAd.anh_dai_dien
                );

                // Kiểm tra xem file có tồn tại không trước khi xóa
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); // Xóa file cũ
                }
            }
        } catch (error) {
            console.error('Error when deleting old avatar:', error);
            return res.status(500).send({
                status: 'error',
                message: 'Error occurred while deleting the old image',
            });
        }
    }

    // Cập nhật thông tin quảng cáo với dữ liệu mới
    await TeacherCourseAd.update(
        {
            ...req.body,
            anh_dai_dien: req.file
                ? `/uploads/${req.file.filename}`
                : undefined, // Nếu có file, thêm đường dẫn ảnh mới
            nguoi_sua: req.userId,
        },
        {
            where: {
                qcgvkh_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const stateChange = async (req, res) => {
    const teacherCourseAd = await TeacherCourseAd.findOne({
        where: {
            qcgvkh_id: req.params.id,
        },
    });

    if (teacherCourseAd) {
        // Cập nhật trạng thái ngược lại với trạng thái hiện tại
        await TeacherCourseAd.update(
            {
                trang_thai: !teacherCourseAd.trang_thai, // Đảo ngược trạng thái
            },
            {
                where: {
                    qcgvkh_id: req.params.id,
                },
            }
        );

        return res.status(200).send({
            status: 'success',
            data: null,
            message: null,
        });
    } else {
        return res.status(404).send({
            status: 'error',
            message: 'Teacher course ad not found',
        });
    }
};

const remove = async (req, res) => {
    const teacherCourseAd = await TeacherCourseAd.findOne({
        where: {
            qcgvkh_id: req.params.id,
        },
    });

    if (teacherCourseAd) {
        // Kiểm tra và xóa ảnh đại diện nếu tồn tại
        if (
            teacherCourseAd.anh_dai_dien &&
            fs.existsSync(`public${teacherCourseAd.anh_dai_dien}`)
        ) {
            fs.unlinkSync(`public${teacherCourseAd.anh_dai_dien}`);
        }

        // Xóa bản ghi trong cơ sở dữ liệu
        await TeacherCourseAd.destroy({
            where: {
                qcgvkh_id: req.params.id,
            },
        });

        return res.status(200).send({
            status: 'success',
            data: null,
            message: 'deleted',
        });
    } else {
        // Nếu không tìm thấy bản ghi
        return res.status(404).send({
            status: 'error',
            message: 'Teacher course ad not found',
        });
    }
};

module.exports = {
    findAll,
    findOne,
    create,
    update,
    stateChange,
    remove,
};
