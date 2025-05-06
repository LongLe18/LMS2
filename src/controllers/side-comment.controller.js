const fs = require('fs');

const {
    SideComment,
    Student,
    Staff,
    Notification,
    Teacher,
} = require('../models');
const sequelize = require('../utils/db');

const findAll = async (req, res) => {
    const filter = req.query.binh_luan_id
        ? 'AND binh_luan_phu.binh_luan_id = :binh_luan_id'
        : '';

    const sideComments = await sequelize.query(
        `
            SELECT * FROM (
                (SELECT binh_luan_phu.*, hoc_vien.ho_ten, hoc_vien.anh_dai_dien 
                FROM binh_luan_phu 
                JOIN hoc_vien ON binh_luan_phu.nguoi_tra_loi_id = hoc_vien.hoc_vien_id 
                WHERE loai_quyen = 0 ${filter})
                
                UNION 
                
                (SELECT binh_luan_phu.*, giao_vien.ho_ten, giao_vien.anh_dai_dien 
                FROM binh_luan_phu 
                JOIN giao_vien ON binh_luan_phu.nguoi_tra_loi_id = giao_vien.giao_vien_id 
                WHERE loai_quyen = 1 ${filter})
                
                UNION 
                
                (SELECT binh_luan_phu.*, nhan_vien.ho_ten, nhan_vien.anh_dai_dien 
                FROM binh_luan_phu 
                JOIN nhan_vien ON binh_luan_phu.nguoi_tra_loi_id = nhan_vien.nhan_vien_id 
                WHERE loai_quyen = 2 ${filter})
            ) AS binh_luan_phu
            LIMIT 100
        `,
        {
            replacements: req.query.binh_luan_id
                ? { binh_luan_id: parseInt(req.query.binh_luan_id) }
                : {},
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: sideComments,
        message: null,
    });
};

const findOne = async (req, res) => {
    const sideComment = await SideComment.findOne({
        where: { binh_luan_phu_id: req.params.id },
        raw: true,
    });

    if (!sideComment) {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'Không tìm thấy bình luận phụ.',
        });
    }

    let userModel;
    let userKey;

    switch (sideComment.loai_quyen) {
        case 0:
            userModel = Student;
            userKey = 'hoc_vien_id';
            break;
        case 1:
            userModel = Teacher;
            userKey = 'giao_vien_id';
            break;
        case 2:
            userModel = Staff;
            userKey = 'nhan_vien_id';
            break;
        default:
            return res.status(400).send({
                status: 'error',
                data: null,
                message: 'Loại quyền không hợp lệ.',
            });
    }

    const user = await userModel.findOne({
        where: { [userKey]: sideComment.nguoi_tra_loi_id },
        raw: true,
    });

    sideComment.ho_ten = user?.ho_ten || null;
    sideComment.anh_dai_dien = user?.anh_dai_dien || null;

    return res.status(200).send({
        status: 'success',
        data: sideComment,
        message: null,
    });
};

const create = async (req, res) => {
    if (req.role === 1 || req.role === 2) {
        req.body.tra_loi = 1;
    }

    if (req.files && req.files.length > 0) {
        const links = req.files.map((file) => `/image/${file.filename}`);
        req.body.anh_dinh_kem = JSON.stringify(links); // Lưu dưới dạng chuỗi JSON
    }

    const sideComment = await SideComment.create({
        ...req.body,
        loai_quyen: req.role,
        nguoi_tra_loi_id: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: sideComment,
        message: null,
    });
};

const update = async (req, res) => {
    if (req.files && req.files.length > 0) {
        const links = req.files.map((file) => `/image/${file.filename}`);
        req.body.anh_dinh_kem = JSON.stringify(links); // Lưu dạng JSON chuỗi

        const sideComment = await SideComment.findOne({
            where: { binh_luan_phu_id: req.params.id },
            raw: true,
        });

        if (sideComment?.anh_dinh_kem) {
            let oldImages;
            try {
                oldImages = JSON.parse(sideComment.anh_dinh_kem);
            } catch {
                oldImages = sideComment.anh_dinh_kem.split(',');
            }

            for (const imagePath of oldImages) {
                const fullPath = `public${imagePath}`;
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
        }
    }

    await SideComment.update(
        { ...req.body },
        { where: { binh_luan_phu_id: req.params.id } }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const remove = async (req, res) => {
    const sideComment = await SideComment.findOne({
        where: { binh_luan_phu_id: req.params.id },
        raw: true,
    });

    if (sideComment?.anh_dinh_kem) {
        let attachments;
        try {
            attachments = JSON.parse(sideComment.anh_dinh_kem);
        } catch {
            attachments = sideComment.anh_dinh_kem.split(',');
        }

        for (const filePath of attachments) {
            const fullPath = `public${filePath}`;
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                } catch (err) {
                    console.error(`Lỗi khi xoá tệp: ${fullPath}`, err);
                }
            }
        }
    }

    await SideComment.destroy({
        where: { binh_luan_phu_id: req.params.id },
    });

    await Notification.destroy({
        where: {
            lien_ket_id: req.params.id,
            loai_thong_bao: 1,
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
    create,
    update,
    remove,
};
