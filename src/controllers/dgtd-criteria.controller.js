const { DGTDCriteria, Course, Exam } = require('../models');

const findAll = async (req, res) => {
    const { count, rows } = await DGTDCriteria.findAndCountAll({
        include: {
            model: Course,
            attributes: ['khoa_hoc_id', 'ten_khoa_hoc'],
        },
        where: {
            ...(req.query.khoa_hoc_id && {
                khoa_hoc_id: req.query.khoa_hoc_id,
            }),
        },
        offset:
            (Number(req.query.pageIndex || 1) - 1) *
            Number(req.query.pageSize || 10),
        limit: Number(req.query.pageSize || 10),
        order: [
            req.query.sortBy
                ? req.query.sortBy.split(',')
                : ['ngay_tao', 'DESC'],
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
    const dgtdCriteria = await DGTDCriteria.findOne({
        where: {
            idtieu_chi_de_thi_dgtd: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: dgtdCriteria,
        message: null,
    });
};

const getByCourse = async (req, res) => {
    const dgtdCriteria = await DGTDCriteria.findOne({
        where: {
            khoa_hoc_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: dgtdCriteria,
        message: null,
    });
};

const create = async (req, res) => {
    let dgtdCriteria = await DGTDCriteria.findOne({
        where: {
            khoa_hoc_id: req.body.khoa_hoc_id,
        },
    });
    if (dgtdCriteria) {
        return res.status(400).send({
            status: 'fail',
            message: 'already exist',
        });
    }

    dgtdCriteria = await DGTDCriteria.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: dgtdCriteria,
        message: null,
    });
};

const update = async (req, res) => {
    const dgtdCriteria = await DGTDCriteria.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                idtieu_chi_de_thi_dgtd: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: dgtdCriteria,
        message: null,
    });
};

const remove = async (req, res) => {
    await DGTDCriteria.destroy({
        where: {
            idtieu_chi_de_thi_dgtd: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const getQuantityExamPublish = async (req, res) => {
    const dgtdCriteria = await DGTDCriteria.findOne({
        where: {
            idtieu_chi_de_thi_dgtd: req.params.id,
        },
    });
    const exams = await Exam.findAll({
        where: {
            khoa_hoc_id: dgtdCriteria.khoa_hoc_id,
            xuat_ban: 1,
            loai_de_thi_id: 4,
        },
        attributes: ['de_thi_id', 'ten_de_thi'],
    });

    return res.status(200).send({
        status: 'success',
        data: exams.length,
        message: null,
    });
};

const checkCriteria = async (req, res) => {
    const criteria = await DGTDCriteria.findOne({
        where: {
            khoa_hoc_id: req.query.khoa_hoc_id,
        },
    });

    if (!criteria) {
        return res.status(400).send({
            status: 'false',
            data: null,
            message: 'Criteria has not been created',
        });
    }

    return res.status(200).send({
        status: 'success',
        data: criteria,
        message: null,
    });
};

module.exports = {
    findAll,
    findOne,
    create,
    getByCourse,
    update,
    remove,
    getQuantityExamPublish,
    checkCriteria
};
