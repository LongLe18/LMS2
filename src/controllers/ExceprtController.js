const { Exceprt } = require('../models');
const fs = require('fs');

const getAll = async (req, res) => {
    const excperts = await Exceprt.findAll({
        order: [['ngay_tao', 'DESC']],
        limit: 50,
    });
    res.status(200).send({
        status: 'success',
        data: excperts,
        message: null,
    });
};

const getById = async (req, res) => {
    const exceprt = await Exceprt.findOne({
        where: {
            trich_doan_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: exceprt,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const exceprt = await Exceprt.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: exceprt,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const exceprt = await Exceprt.findOne({
        where: {
            trich_doan_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: exceprt,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    if (req.file) {
        const exceprt = await Exceprt.findOne({
            where: {
                trich_doan_id: req.params.id,
            },
        });
        if (exceprt.noi_dung && fs.existsSync(`src/public${exceprt.noi_dung}`))
            fs.unlinkSync(`src/public${exceprt.noi_dung}`);
    }
    await Exceprt.update(
        {
            ...req.body,
        },
        {
            where: {
                trich_doan_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    const exceprt = await Exceprt.findOne({
        where: {
            trich_doan_id: req.params.id,
        },
    });
    if (exceprt.noi_dung && fs.existsSync(`src/public${exceprt.noi_dung}`))
        fs.unlinkSync(`src/public${exceprt.noi_dung}`);
    await Exceprt.destroy({
        where: {
            trich_doan_id: req.params.id,
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
    getUpdate,
    putUpdate,
    forceDelete,
};
