const { ModunCriteria, Modun, Course, Exam } = require('../models');

const findAll = async (req, res) => {
    const { count, rows } = await ModunCriteria.findAndCountAll({
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
    const modunCriteria = await ModunCriteria.findOne({
        include: {
            model: Modun,
            attributes: ['mo_dun_id', 'khoa_hoc_id'],
        },
        where: {
            tcdmd_khoa_hoc_id: req.params.id,
        },
    });

    return res.status(200).send({
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

    return res.status(200).send({
        status: 'success',
        data: modunCriteria,
        message: null,
    });
};

const create = async (req, res) => {
    let modunCriteria = await ModunCriteria.findOne({
        where: {
            mo_dun_id: req.body.mo_dun_id,
        },
    });

    if (modunCriteria) {
        return res.status(404).send({
            status: 'fail',
            data: null,
            message: 'Already exists',
        });
    }

    modunCriteria = await ModunCriteria.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: modunCriteria,
        message: null,
    });
};

// const getUpdate = async (req, res) => {
//     const modunCriteria = await ModunCriteria.findOne({
//         where: {
//             tcdmd_khoa_hoc_id: req.params.id,
//         },
//     });
//     res.status(200).send({
//         status: 'success',
//         data: modunCriteria,
//         message: null,
//     });
// };

const update = async (req, res) => {
    const modunCriteria = await ModunCriteria.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                tcdmd_khoa_hoc_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: modunCriteria,
        message: null,
    });
};

const remove = async (req, res) => {
    await ModunCriteria.destroy({
        where: {
            tcdmd_khoa_hoc_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const getQuantityExamPublish = async (req, res) => {
    const modunCriteria = await ModunCriteria.findOne({
        where: {
            tcdmd_khoa_hoc_id: req.params.id,
        },
    });
    const exams = await Exam.findAll({
        where: {
            mo_dun_id: modunCriteria.mo_dun_id,
            xuat_ban: 1,
            loai_de_thi_id: 2,
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
    const criteria = await ModunCriteria.findOne({
        where: {
            mo_dun_id: req.query.mo_dun_id,
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
    const { count, rows } = await ModunCriteria.findAndCountAll({
        include: {
            model: Modun,
            attributes: ['mo_dun_id', 'ten_mo_dun'],
            include: {
                model: Course,
                attributes: ['khoa_hoc_id', 'ten_khoa_hoc'],
            },
        },
        where: {
            '$mo_dun.khoa_hoc.giao_vien_id$': req.userId,
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

module.exports = {
    findAll,
    findOne,
    getByModun,
    create,
    // getUpdate,
    update,
    remove,
    getQuantityExamPublish,
    checkCriteria,
    findAllv2
};
