const {
    ThematicCriteria,
    Modun,
    Thematic,
    Course,
    Exam,
} = require('../models');

const findAll = async (req, res) => {
    const { count, rows } = await ThematicCriteria.findAndCountAll({
        include: {
            model: Modun,
            attributes: ['mo_dun_id', 'ten_mo_dun'],
            include: {
                model: Course,
                attributes: ['khoa_hoc_id', 'ten_khoa_hoc'],
            },
        },
        where: {
            ...(req.query.mo_dun_id && {
                mo_dun_id: req.query.mo_dun_id,
            }),
            ...(req.query.khoa_hoc_id && {
                '$mo_dun.khoa_hoc.khoa_hoc_id$': req.query.khoa_hoc_id,
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
    const thematicCriteria = await ThematicCriteria.findOne({
        include: {
            model: Modun,
            attributes: ['mo_dun_id', 'khoa_hoc_id'],
        },
        where: {
            tcdcd_mo_dun_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: thematicCriteria,
        message: null,
    });
};

const getByThematic = async (req, res) => {
    let thematicCriteria = await ThematicCriteria.findOne({
        include: [
            {
                model: Modun,
                include: [
                    {
                        model: Thematic,
                    },
                ],
            },
        ],
        where: {
            '$mo_dun.chuyen_des.chuyen_de_id$': req.params.id,
        },
    });

    if (thematicCriteria) {
        // Xóa thuộc tính không cần thiết
        delete thematicCriteria.dataValues.mo_dun;

        return res.status(200).send({
            status: 'success',
            data: thematicCriteria,
            message: null,
        });
    } else {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'ThematicCriteria not found.',
        });
    }
};

const create = async (req, res) => {
    let thematicCriteria = await ThematicCriteria.findOne({
        where: {
            mo_dun_id: req.body.mo_dun_id,
        },
    });

    if (thematicCriteria) {
        return res.status(404).send({
            status: 'fail',
            data: null,
            message: 'already exist',
        });
    }

    thematicCriteria = await ThematicCriteria.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: thematicCriteria,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const thematicCriteria = await ThematicCriteria.findOne({
        where: {
            tcdcd_mo_dun_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: thematicCriteria,
        message: null,
    });
};

const update = async (req, res) => {
    const thematicCriteria = await ThematicCriteria.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                tcdcd_mo_dun_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: thematicCriteria,
        message: null,
    });
};

const remove = async (req, res) => {
    await ThematicCriteria.destroy({
        where: {
            tcdcd_mo_dun_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const getQuantityExamPublish = async (req, res) => {
    const thematicCriteria = await ThematicCriteria.findOne({
        where: {
            tcdcd_mo_dun_id: req.params.id,
        },
    });

    const exams = await Exam.findAll({
        where: {
            khoa_hoc_id: thematicCriteria.mo_dun_id,
            xuat_ban: 1,
            loai_de_thi_id: 1,
        },
        attributes: ['de_thi_id', 'ten_de_thi'],
    });

    return res.status(200).send({
        status: 'success',
        data: exams.length,
        message: null,
    });
};

module.exports = {
    findAll,
    findOne,
    getByThematic,
    create,
    getUpdate,
    update,
    remove,
    getQuantityExamPublish,
};
