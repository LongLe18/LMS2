const { DocumentType } = require('../models');

const findAll = async (req, res) => {
    const { count, rows } = await DocumentType.findAndCountAll({
        offset:
            (Number(req.query.pageIndex || 1) - 1) *
            Number(req.query.pageSize || 10),
        limit: Number(req.query.pageSize || 10),
        order: [
            req.query.sortBy
                ? req.query.sortBy.split(',')
                : ['createdAt', 'DESC'], // Bạn có thể thay đổi trường sắp xếp nếu cần
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

const findOne = async (req, res) => {
    const documentType = await DocumentType.findOne({
        where: {
            loai_tai_lieu_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: documentType,
        message: null,
    });
};

const create = async (req, res) => {
    const documentType = await DocumentType.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: documentType,
        message: null,
    });
};

const update = async (req, res) => {
    await DocumentType.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                loai_tai_lieu_id: req.params.id,
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
    await DocumentType.destroy({
        where: {
            loai_tai_lieu_id: req.params.id,
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
    remove,
};
