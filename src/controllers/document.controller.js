const fs = require('fs');

const { Document } = require('../models');
const sequelize = require('../utils/db');

const findAll = async (req, res) => {
    let whereConditions = [];
    let replacements = {};

    if (req.query.search) {
        whereConditions.push(
            '(tai_lieu.ten_tai_lieu LIKE :search OR loai_tai_lieu.mo_ta LIKE :search)'
        );
        replacements.search = `%${decodeURI(req.query.search)}%`;
    }
    if (req.query.trang_thai) {
        whereConditions.push('tai_lieu.trang_thai = :trang_thai');
        replacements.trang_thai = parseInt(req.query.trang_thai);
    }
    if (req.query.loai_tai_lieu_id) {
        whereConditions.push('tai_lieu.loai_tai_lieu_id = :loai_tai_lieu_id');
        replacements.loai_tai_lieu_id = parseInt(req.query.loai_tai_lieu_id);
    }

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    const pageSize = Number(req.query.pageSize || 100);
    const pageIndex = Number(req.query.pageIndex || 1);
    const offset = (pageIndex - 1) * pageSize;

    replacements.limit = pageSize;
    replacements.offset = offset;

    const documents = await sequelize.query(
        `
        SELECT tai_lieu.* 
        FROM tai_lieu 
        LEFT JOIN loai_tai_lieu ON tai_lieu.loai_tai_lieu_id = loai_tai_lieu.loai_tai_lieu_id 
        ${whereClause} 
        ORDER BY tai_lieu.ngay_tao DESC 
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
        FROM tai_lieu 
        LEFT JOIN loai_tai_lieu ON tai_lieu.loai_tai_lieu_id = loai_tai_lieu.loai_tai_lieu_id 
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
        data: documents,
        pageIndex,
        pageSize,
        totalCount,
        totalPage,
        message: null,
    });
};

const findOne = async (req, res) => {
    const document = await Document.findOne({
        where: {
            tai_lieu_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: document,
        message: null,
    });
};

const create = async (req, res) => {
    const document = await Document.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: document,
        message: null,
    });
};

const update = async (req, res) => {
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
            nguoi_sua: req.userId,
        },
        {
            where: {
                tai_lieu_id: req.params.id,
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
    const document = await Document.findOne({
        where: {
            tai_lieu_id: req.params.id,
        },
    });
    await Document.update(
        {
            trang_thai: !document.trang_thai,
            nguoi_sua: req.userId,
        },
        {
            where: {
                tai_lieu_id: req.params.id,
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
    const document = await Document.findOne({
        where: {
            tai_lieu_id: req.params.id,
        },
    });
    if (document.anh_dai_dien && fs.existsSync(`public${document.noi_dung}`))
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
