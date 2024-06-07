const Program = require('../models/Program');
const fs = require('fs');

//[GET] ?
const getAll = async (req, res) => {
    let filter = {};
    if (req.query.trang_thai) {
        filter.trang_thai = req.query.trang_thai;
    }
    const program = await Program.findAll({
        ...filter,
        limit: 100
    });
    res.status(200).send({
        status: 'success',
        data: program,
        message: null,
    });
};

//[GET]
const getById = async (req, res) => {
    const program = await Program.findOne({
        where: {
            kct_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: program,
        message: null,
    });
};

//[GET] program/create
const getCreate = async (req, res) => {
    res.send('create');
};

//[POST] program/create
const postCreate = async (req, res) => {
    const program = await Program.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: program,
        message: null,
    });
};

//[GET] program/:id/edit
const getUpdate = async (req, res) => {
    const program = await Program.findOne({
        where: {
            kct_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: program,
        message: null,
    });
};

//[PUT] program/:id
const putUpdate = async (req, res) => {
    const program = await Program.findOne({
        where: {
            kct_id: req.params.id,
        },
    });
    if (
        req.file &&
        program.anh_dai_dien &&
        fs.existsSync(`src/public${program.anh_dai_dien}`)
    )
        fs.unlinkSync(`src/public${program.anh_dai_dien}`);
    await Program.update(
        {
            ...req.body,
        },
        {
            where: {
                kct_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[DELETE] program/:id
const deleteById = async (req, res) => {
    await Program.update(
        {
            trang_thai: false,
        },
        {
            where: {
                kct_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[PATCH] program/:id/restore
const restore = async (req, res) => {
    await Program.update(
        {
            trang_thai: true,
        },
        {
            where: {
                kct_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[DELETE] program/:id/force
const forceDelete = async (req, res) => {
    const program = await Program.findOne({
        where: {
            kct_id: req.params.id,
        },
    });
    if (
        program.anh_dai_dien &&
        fs.existsSync(`src/public${program.anh_dai_dien}`)
    )
        fs.unlinkSync(`src/public${program.anh_dai_dien}`);
    await Program.destroy({
        where: {
            kct_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

module.exports = {
    getAll,
    getById,
    getCreate,
    postCreate,
    getUpdate,
    putUpdate,
    deleteById,
    restore,
    forceDelete,
};
