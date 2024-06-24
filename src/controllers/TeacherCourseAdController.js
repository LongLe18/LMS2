const { TeacherCourseAd } = require('../models');
const fs = require('fs');
const sequelize = require('../utils/db');

const getAll = async (req, res) => {
    let trang_thai=1;
    if(req.query.trang_thai){
        trang_thai=`quang_cao_gv_kh.trang_thai=:trang_thai`;
    }
    const teacherCourseAds=await sequelize.query(`
        SELECT quang_cao_gv_kh.*, giao_vien.ho_ten AS ten_giao_vien, khoa_hoc.ten_khoa_hoc FROM quang_cao_gv_kh 
        JOIN giao_vien ON quang_cao_gv_kh.giao_vien_id=giao_vien.giao_vien_id JOIN khoa_hoc ON 
        khoa_hoc.khoa_hoc_id=quang_cao_gv_kh.khoa_hoc_id WHERE ${trang_thai} limit 100`, 
        {
            replacements:{
                trang_thai: parseInt(req.query.trang_thai)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: teacherCourseAds,
        message: null,
    });
};

const getById = async (req, res) => {
    const teacherCourseAd = await TeacherCourseAd.findOne({
        where: {
            qcgvkh_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: teacherCourseAd,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const teacherCourseAd = await TeacherCourseAd.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: teacherCourseAd,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    if (req.file) {
        const teacherCourseAd = await TeacherCourseAd.findOne({
            where: {
                qcgvkh_id: req.params.id,
            },
        });
        if (
            teacherCourseAd.anh_dai_dien &&
            fs.existsSync(`public${teacherCourseAd.anh_dai_dien}`)
        )
            fs.unlinkSync(`public${teacherCourseAd.anh_dai_dien}`);
    }
    await TeacherCourseAd.update(
        {
            ...req.body,
        },
        {
            where: {
                qcgvkh_id: req.params.id,
            },
        }
    );
    res.status(200).send({
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
    if (teacherCourseAd.trang_thai) {
        await TeacherCourseAd.update(
            {
                trang_thai: false,
            },
            {
                where: {
                    qcgvkh_id: req.params.id,
                },
            }
        );
    } else {
        await TeacherCourseAd.update(
            {
                trang_thai: true,
            },
            {
                where: {
                    qcgvkh_id: req.params.id,
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

const deleteById = async (req, res) => {
    const teacherCourseAd = await TeacherCourseAd.findOne({
        where: {
            qcgvkh_id: req.params.id,
        },
    });
    if (
        teacherCourseAd.anh_dai_dien &&
        fs.existsSync(`public${teacherCourseAd.anh_dai_dien}`)
    )
        fs.unlinkSync(`public${teacherCourseAd.anh_dai_dien}`);
    await TeacherCourseAd.destroy({
        where: {
            qcgvkh_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    getAll,
    getById,
    postCreate,
    putUpdate,
    stateChange,
    deleteById,
};
