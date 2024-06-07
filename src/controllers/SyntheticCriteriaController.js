const { SyntheticCriteria } = require('../models');
const sequelize = require('../utils/db');

const getAll_admin = async (req, res) => {
    const syntheticCriterias = await sequelize.query(
        `
        SELECT tieu_chi_de_tong_hop.*, khoa_hoc.ten_khoa_hoc FROM tieu_chi_de_tong_hop 
        LEFT JOIN khoa_hoc ON tieu_chi_de_tong_hop.khoa_hoc_id=khoa_hoc.khoa_hoc_id LIMIT 100
        `,
        { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).send({
        status: 'success',
        data: syntheticCriterias,
        message: null,
    });
};

const getById = async (req, res) => {
    const syntheticCriteria = await SyntheticCriteria.findOne({
        where: {
            tcdth_khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: syntheticCriteria,
        message: null,
    });
};

const getByCourse = async (req, res) => {
    const syntheticCriteria = await SyntheticCriteria.findOne({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: syntheticCriteria,
        message: null,
    });
};

const postCreate = async (req, res) => {
    let syntheticCriteria;
    syntheticCriteria = await SyntheticCriteria.findOne({
        where: {
            khoa_hoc_id: req.body.khoa_hoc_id,
        },
    });
    if (syntheticCriteria) {
        res.status(404).send({
            status: 'fail',
            data: null,
            message: 'already exist',
        });
        return;
    }
    syntheticCriteria = await SyntheticCriteria.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: syntheticCriteria,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const syntheticCriteria = await SyntheticCriteria.findOne({
        where: {
            tcdth_khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: syntheticCriteria,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    const syntheticCriteria = await SyntheticCriteria.update(
        {
            ...req.body,
        },
        {
            where: {
                tcdth_khoa_hoc_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: syntheticCriteria,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    await SyntheticCriteria.destroy({
        where: {
            tcdth_khoa_hoc_id: req.params.id,
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
    postCreate,
    getByCourse,
    getUpdate,
    putUpdate,
    forceDelete,
};
