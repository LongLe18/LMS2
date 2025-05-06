const fs = require('fs');

const { DocumentAd } = require('../models');
const sequelize = require('../utils/db');

const findAll = async (req, res) => {
    let whereConditions = [];
    let replacements = {};

    if (req.query.trang_thai) {
        whereConditions.push('quang_cao_tai_lieu.trang_thai = :trang_thai');
        replacements.trang_thai = parseInt(req.query.trang_thai);
    }

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const pageSize = Number(req.query.pageSize || 10);
    const pageIndex = Number(req.query.pageIndex || 1);
    const offset = (pageIndex - 1) * pageSize;

    replacements.limit = pageSize;
    replacements.offset = offset;

    const documentAds = await sequelize.query(
        `
        SELECT quang_cao_tai_lieu.*, tai_lieu.ten_tai_lieu 
        FROM quang_cao_tai_lieu 
        JOIN tai_lieu ON quang_cao_tai_lieu.tai_lieu_id = tai_lieu.tai_lieu_id 
        ${whereClause} 
        ORDER BY quang_cao_tai_lieu.ngay_tao DESC
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalResult = await sequelize.query(
        `
        SELECT COUNT(*) AS total 
        FROM quang_cao_tai_lieu 
        JOIN tai_lieu ON quang_cao_tai_lieu.tai_lieu_id = tai_lieu.tai_lieu_id 
        ${whereClause}
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = totalResult[0].total;
    const totalPage = Math.ceil(totalCount / pageSize);

    return res.status(200).send({
        status: 'success',
        data: documentAds,
        pageIndex,
        pageSize,
        totalCount,
        totalPage,
        message: null,
    });
};

const findOne = async (req, res) => {
    const documentAd = await DocumentAd.findOne({
        where: {
            qctl_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: documentAd,
        message: null,
    });
};

const create = async (req, res) => {
    const documentAd = await DocumentAd.create({
        ...req.body,
        nguoi_tao: req.userId
    });

    return res.status(200).send({
        status: 'success',
        data: documentAd,
        message: null,
    });
};

const update = async (req, res) => {
    if (req.file) {
        const documentAd = await DocumentAd.findOne({
            where: {
                qctl_id: req.params.id,
            },
        });
        if (
            documentAd.anh_dai_dien &&
            fs.existsSync(`public${documentAd.anh_dai_dien}`)
        )
            fs.unlinkSync(`public${documentAd.anh_dai_dien}`);
    }
    const documentAd = await DocumentAd.update(
        {
            ...req.body,
            nguoi_sua: req.userId
        },
        {
            where: {
                qctl_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: documentAd,
        message: null,
    });
};

const stateChange = async (req, res) => {
    const documentAd = await DocumentAd.findOne({
        where: {
            qctl_id: req.params.id,
        },
    });
    await DocumentAd.update(
        {
            trang_thai: !documentAd.trang_thai,
        },
        {
            where: {
                qctl_id: req.params.id,
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
    const documentAd = await DocumentAd.findOne({
        where: {
            qctl_id: req.params.id,
        },
    });
    if (
        documentAd.anh_dai_dien &&
        fs.existsSync(`public${documentAd.anh_dai_dien}`)
    )
        fs.unlinkSync(`public${documentAd.anh_dai_dien}`);
    await DocumentAd.destroy({
        where: {
            qctl_id: req.params.id,
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
