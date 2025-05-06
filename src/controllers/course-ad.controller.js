const { CourseAd } = require('../models');
const sequelize = require('../utils/db');

const findAll = async (req, res) => {
    let whereConditions = [];
    if (req.query.trang_thai) {
        whereConditions.push('trang_thai = :trang_thai');
    }

    const pageSize = Number(req.query.pageSize || 10); // Mặc định 10 nếu không có pageSize
    const pageIndex = Number(req.query.pageIndex || 1); // Mặc định 1 nếu không có pageIndex
    const offset = (pageIndex - 1) * pageSize;

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const courseAds = await sequelize.query(
        `
            SELECT khoa_hoc.ten_khoa_hoc, quang_cao_khoa_hoc.* 
            FROM quang_cao_khoa_hoc 
            JOIN khoa_hoc ON quang_cao_khoa_hoc.khoa_hoc_id = khoa_hoc.khoa_hoc_id 
            ${whereClause}
            LIMIT :limit OFFSET :offset
            `,
        {
            replacements: {
                trang_thai: req.query.trang_thai,
                limit: pageSize,
                offset: offset,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalResult = await sequelize.query(
        `
            SELECT COUNT(*) AS total 
            FROM quang_cao_khoa_hoc 
            JOIN khoa_hoc ON quang_cao_khoa_hoc.khoa_hoc_id = khoa_hoc.khoa_hoc_id 
            ${whereClause}
            `,
        {
            replacements: {
                trang_thai: req.query.trang_thai,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = totalResult[0].total;
    const totalPage = Math.ceil(totalCount / pageSize);

    return res.status(200).send({
        status: 'success',
        data: courseAds,
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPage: totalPage,
        message: null,
    });
};

const findOne = async (req, res) => {
    const courseAd = await CourseAd.findOne({
        where: {
            qckh_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: courseAd,
        message: null,
    });
};

const create = async (req, res) => {
    const courseAd = await CourseAd.create({
        ...req.body,
    });

    return res.status(200).send({
        status: 'success',
        data: courseAd,
        message: null,
    });
};

const update = async (req, res) => {
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

    return res.status(200).send({
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

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const remove = async (req, res) => {
    await CourseAd.destroy({
        where: {
            qckh_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    findAll,
    findOne,
    create,
    update,
    stateChange,
    remove,
};
