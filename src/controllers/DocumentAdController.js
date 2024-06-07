const { DocumentAd } = require('../models');
const sequelize = require('../utils/db');
const fs = require('fs');

const getAll = async (req, res) => {
    let trang_thai='1';
    if (req.query.trang_thai) {
        trang_thai = 'quang_cao_tai_lieu.trang_thai=:trang_thai';
    };
    let filter=`WHERE ${trang_thai}`;
    const documentAds=await sequelize.query(`
        SELECT quang_cao_tai_lieu.*, tai_lieu.ten_tai_lieu FROM quang_cao_tai_lieu JOIN tai_lieu ON 
        quang_cao_tai_lieu.tai_lieu_id=tai_lieu.tai_lieu_id ${filter} LIMIT 100`,
    {
        replacements: {
            trang_thai: parseInt(req.query.trang_thai)
        },
        type: sequelize.QueryTypes.SELECT
    });
    res.status(200).send({
        status: 'success',
        data: documentAds,
        message: null,
    });
};

const getById = async (req, res) => {
    const documentAd = await DocumentAd.findOne({
        where: {
            qctl_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: documentAd,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const documentAd = await DocumentAd.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: documentAd,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    if (req.file) {
        const documentAd = await DocumentAd.findOne({
            where: {
                qctl_id: req.params.id,
            },
        });
        if (
            documentAd.anh_dai_dien &&
            fs.existsSync(`src/public${documentAd.anh_dai_dien}`)
        )
            fs.unlinkSync(`src/public${documentAd.anh_dai_dien}`);
    }
    const documentAd = await DocumentAd.update(
        {
            ...req.body,
        },
        {
            where: {
                qctl_id: req.params.id,
            },
        }
    );
    res.status(200).send({
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
    if (documentAd.trang_thai) {
        await DocumentAd.update(
            {
                trang_thai: false,
            },
            {
                where: {
                    qctl_id: req.params.id,
                },
            }
        );
    } else {
        await DocumentAd.update(
            {
                trang_thai: true,
            },
            {
                where: {
                    qctl_id: req.params.id,
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
    const documentAd = await DocumentAd.findOne({
        where: {
            qctl_id: req.params.id,
        },
    });
    if (
        documentAd.anh_dai_dien &&
        fs.existsSync(`src/public${documentAd.anh_dai_dien}`)
    )
        fs.unlinkSync(`src/public${documentAd.anh_dai_dien}`);
    await DocumentAd.destroy({
        where: {
            qctl_id: req.params.id,
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
