const { SyntheticCriteria, Course, Exam } = require('../models');

const findAll = async (req, res) => {
    const { count, rows } = await SyntheticCriteria.findAndCountAll({
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
    const syntheticCriteria = await SyntheticCriteria.findOne({
        where: {
            tcdth_khoa_hoc_id: req.params.id,
        },
    });

    return res.status(200).send({
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

    return res.status(200).send({
        status: 'success',
        data: syntheticCriteria,
        message: null,
    });
};

const create = async (req, res) => {
    let syntheticCriteria = await SyntheticCriteria.findOne({
        where: {
            khoa_hoc_id: req.body.khoa_hoc_id,
        },
    });

    if (syntheticCriteria) {
        return res.status(404).send({
            status: 'fail',
            data: null,
            message: 'already exist',
        });
    }

    syntheticCriteria = await SyntheticCriteria.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
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

    return res.status(200).send({
        status: 'success',
        data: syntheticCriteria,
        message: null,
    });
};

const getQuantityExamPublish = async (req, res) => {
    const syntheticCriteria = await SyntheticCriteria.findOne({
        where: {
            tcdth_khoa_hoc_id: req.params.id,
        },
    });

    const exams = await Exam.findAll({
        where: {
            khoa_hoc_id: syntheticCriteria.khoa_hoc_id,
            xuat_ban: 1,
            loai_de_thi_id: 3,
        },
        attributes: ['de_thi_id', 'ten_de_thi'],
    });

    return res.status(200).send({
        status: 'success',
        data: exams.length,
        message: null,
    });
};

const update = async (req, res) => {
    const syntheticCriteria = await SyntheticCriteria.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                tcdth_khoa_hoc_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: syntheticCriteria,
        message: null,
    });
};

const remove = async (req, res) => {
    await SyntheticCriteria.destroy({
        where: {
            tcdth_khoa_hoc_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const checkCriteria = async (req, res) => {
    const criteria = await SyntheticCriteria.findOne({
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

const findAllv2 = async (req, res) => {
    const { count, rows } = await SyntheticCriteria.findAndCountAll({
        include: {
            model: Course,
            attributes: ['khoa_hoc_id', 'ten_khoa_hoc'],
        },
        where: {
            '$khoa_hoc.giao_vien_id$': req.userId,
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

module.exports = {
    findAll,
    findOne,
    create,
    getByCourse,
    getUpdate,
    update,
    remove,
    getQuantityExamPublish,
    checkCriteria,
    findAllv2
};
