const { Document } = require('../models');
const sequelize = require('../utils/db');
const fs = require('fs');

const getAll = async (req, res) => {
    let search = '1';
    let trang_thai='1';
    let loai_tai_lieu_id='1';
    let offset = 0;
    let limit =100;
    if(req.query.offset){
        offset=req.query.offset;
    }
    if(req.query.limit){
        limit=req.query.limit;
    }
    if(req.query.search){
        search='(tai_lieu.ten_tai_lieu LIKE :search OR loai_tai_lieu.mo_ta LIKE :search)';
    }
    if (req.query.trang_thai){
        trang_thai = req.query.trang_thai
    };
    if (req.query.loai_tai_lieu_id){
        loai_tai_lieu_id = req.query.loai_tai_lieu_id;
    }
    let filter =`WHERE ${loai_tai_lieu_id} AND ${trang_thai} AND ${search}`;
    const documents=await sequelize.query(`
        SELECT tai_lieu.* FROM tai_lieu LEFT JOIN loai_tai_lieu ON 
        tai_lieu.loai_tai_lieu_id=loai_tai_lieu.loai_tai_lieu_id ${filter} 
        ORDER BY tai_lieu.ngay_tao DESC LIMIT :offset, :limit`,
        {
            replacements: {
                offset: parseInt(offset),
                limit: parseInt(limit),
                search: decodeURI(req.query.search),
                trang_thai: parseInt(req.query.trang_thai),
                loai_tai_lieu_id: parseInt(req.query.loai_tai_lieu_id)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: documents,
        message: null,
    });
};

const getById = async (req, res) => {
    const document = await Document.findOne({
        where: {
            tai_lieu_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: document,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const document = await Document.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: document,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    if (req.files) {
        const document = await Document.findOne({
            where: {
                tai_lieu_id: req.params.id,
            },
        });
        if (
            req.files['noi_dung'] &&
            document.anh_dai_dien &&
            fs.existsSync(`public${document.noi_dung}`)
        )
            fs.unlinkSync(`public${document.noi_dung}`);
        if (
            req.files['anh_dai_dien'] &&
            document.anh_dai_dien &&
            fs.existsSync(`public${document.anh_dai_dien}`)
        )
            fs.unlinkSync(`public${document.anh_dai_dien}`);
    }
    await Document.update(
        {
            ...req.body,
        },
        {
            where: {
                tai_lieu_id: req.params.id,
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
    const document = await Document.findOne({
        where: {
            tai_lieu_id: req.params.id,
        },
    });
    if (document.trang_thai) {
        await Document.update(
            {
                trang_thai: false,
            },
            {
                where: {
                    tai_lieu_id: req.params.id,
                },
            }
        );
    } else {
        await Document.update(
            {
                trang_thai: true,
            },
            {
                where: {
                    tai_lieu_id: req.params.id,
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
    const document = await Document.findOne({
        where: {
            tai_lieu_id: req.params.id,
        },
    });
    if (
        document.anh_dai_dien &&
        fs.existsSync(`public${document.noi_dung}`)
    )
        fs.unlinkSync(`public${document.noi_dung}`);
    if (
        document.anh_dai_dien &&
        fs.existsSync(`public${document.anh_dai_dien}`)
    )
        fs.unlinkSync(`public${document.anh_dai_dien}`);
    await Document.destroy({
        where: {
            tai_lieu_id: req.params.id,
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
