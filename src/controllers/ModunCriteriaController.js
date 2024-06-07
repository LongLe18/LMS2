const { ModunCriteria } = require('../models');
const sequelize = require('../utils/db');

const getAll_admin = async (req, res) => {
    const modunCriterias = await sequelize.query(
        `
        SELECT tieu_chi_de_mo_dun.*, mo_dun.ten_mo_dun FROM tieu_chi_de_mo_dun 
        LEFT JOIN mo_dun ON tieu_chi_de_mo_dun.mo_dun_id=mo_dun.mo_dun_id LIMIT 100
        `,
        { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).send({
        status: 'success',
        data: modunCriterias,
        message: null,
    });
};

const getById = async (req, res) => {
    const modunCriteria = await ModunCriteria.findOne({
        where: {
            tcdmd_khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: modunCriteria,
        message: null,
    });
};

const getByModun = async (req, res) => {
    const modunCriteria = await ModunCriteria.findOne({
        where: {
            mo_dun_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: modunCriteria,
        message: null,
    });
};

const postCreate = async (req, res) => {
    let modunCriteria;
    modunCriteria = await ModunCriteria.findOne({
        where: {
            mo_dun_id: req.body.mo_dun_id,
        },
    });
    if (modunCriteria) {
        res.status(404).send({
            status: 'fail',
            data: null,
            message: 'already exists',
        });
        return;
    }
    modunCriteria = await ModunCriteria.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: modunCriteria,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const modunCriteria = await ModunCriteria.findOne({
        where: {
            tcdmd_khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: modunCriteria,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    const modunCriteria = await ModunCriteria.update(
        {
            ...req.body,
        },
        {
            where: {
                tcdmd_khoa_hoc_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: modunCriteria,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    await ModunCriteria.destroy({
        where: {
            tcdmd_khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

module.exports = {
    getAll_admin,
    getById,
    getByModun,
    postCreate,
    getUpdate,
    putUpdate,
    forceDelete,
};
