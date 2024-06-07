const { DocumentType } = require('../models');

const getAll = async (req, res) => {
    const documentTypes = await DocumentType.findAll({limit: 100});
    res.status(200).send({
        status: 'success',
        data: documentTypes,
        message: null,
    });
};

const getById = async (req, res) => {
    const documentType = await DocumentType.findOne({
        where: {
            loai_tai_lieu_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: documentType,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const documentType = await DocumentType.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: documentType,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    await DocumentType.update(
        {
            ...req.body,
        },
        {
            where: {
                loai_tai_lieu_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const deleteById = async (req, res) => {
    await DocumentType.destroy({
        where: {
            loai_tai_lieu_id: req.params.id,
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
    deleteById,
};
