const { OnlineCriteria } = require('../models');
const sequelize = require('../utils/db');

const getAll_admin = async (req, res) => {
    const onlineCriterias = await sequelize.query(
        `
        SELECT tieu_chi_de_thi_online.*, khoa_hoc.ten_khoa_hoc FROM tieu_chi_de_thi_online 
        LEFT JOIN khoa_hoc ON tieu_chi_de_thi_online.khoa_hoc_id=khoa_hoc.khoa_hoc_id LIMIT 100
        `,
        { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).send({
        status: 'success',
        data: onlineCriterias,
        message: null,
    });
};

const getById = async (req, res) => {
    const onlineCriteria = await OnlineCriteria.findOne({
        where: {
            idtieu_chi_de_thi_online: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: onlineCriteria,
        message: null,
    });
};

const getByCourse = async (req, res) => {
    const onlineCriteria = await OnlineCriteria.findOne({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: onlineCriteria,
        message: null,
    });
};

const postCreate = async (req, res) => {
    let onlineCriteria;
    onlineCriteria = await OnlineCriteria.findOne({
        where: {
            khoa_hoc_id: req.body.khoa_hoc_id,
        },
    });
    if (onlineCriteria) {
        res.status(404).send({
            status: 'fail',
            data: null,
            message: 'already exist',
        });
        return;
    }
    onlineCriteria = await OnlineCriteria.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: onlineCriteria,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const onlineCriteria = await OnlineCriteria.findOne({
        where: {
            idtieu_chi_de_thi_online: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: onlineCriteria,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    const onlineCriteria = await OnlineCriteria.update(
        {
            ...req.body,
        },
        {
            where: {
                idtieu_chi_de_thi_online: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: onlineCriteria,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    await OnlineCriteria.destroy({
        where: {
            idtieu_chi_de_thi_online: req.params.id,
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
