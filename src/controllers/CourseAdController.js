const { CourseAd } = require('../models');
const sequelize = require('../utils/db');

const getAll = async (req, res) => {
    let filter = 'WHERE 1';
    if (req.query.trang_thai){
        filter=`WHERE trang_thai=:trang_thai`;
    };
    const courseAds = await sequelize.query(`
        SELECT khoa_hoc.ten_khoa_hoc, quang_cao_khoa_hoc.* FROM quang_cao_khoa_hoc JOIN khoa_hoc 
        ON quang_cao_khoa_hoc.khoa_hoc_id=khoa_hoc.khoa_hoc_id ${filter} LIMIT 100`, 
        {
            replacements:{trang_thai: req.query.trang_thai},
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: courseAds,
        message: null,
    });
};

const getById = async (req, res) => {
    const courseAd = await CourseAd.findOne({
        where: {
            qckh_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: courseAd,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const courseAd = await CourseAd.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: courseAd,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    await CourseAd.update(
        {
            ...req.body,
        },
        {
            where: {
                qckh_id: req.params.id,
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
    const courseAd = await CourseAd.findOne({
        where: {
            qckh_id: req.params.id,
        },
    });
    if (courseAd.trang_thai) {
        await CourseAd.update(
            {
                trang_thai: false,
            },
            {
                where: {
                    qckh_id: req.params.id,
                },
            }
        );
    } else {
        await CourseAd.update(
            {
                trang_thai: true,
            },
            {
                where: {
                    qckh_id: req.params.id,
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
    await CourseAd.destroy({
        where: {
            qckh_id: req.params.id,
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
