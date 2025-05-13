const { Position, PositionPermission } = require('../models');

const findAll = async (req, res) => {
    const { count, rows } = await Position.findAndCountAll({
        where: {
            ...(req.query.ten && { ten: req.query.ten }),
            ...(req.query.mo_ta && { mo_ta: req.query.mo_ta }),
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
    const position = await Position.findOne({
        where: {
            chuc_vu_id: req.params.id,
        },
        include: [{
            model: PositionPermission,
            attributes: ['qtc_id'],
        }],
    });

    return res.status(200).send({
        status: 'success',
        data: position,
        message: null,
    });
};

const create = async (req, res) => {
    const position = await Position.create({
        ...req.body,
        nguoi_tao: req.userId
    });

    return res.status(200).send({
        status: 'success',
        data: position,
        message: null,
    });
};

const update = async (req, res) => {
    await Position.update(
        {
            ...req.body,
            nguoi_sua: req.userId
        },
        {
            where: {
                chuc_vu_id: req.params.id,
            },
        }
    );

    const { qtc_ids } = req.body;

    if (Array.isArray(qtc_ids) && qtc_ids.length > 0) {
        // Xóa toàn bộ permission hiện tại của position
        await PositionPermission.destroy({
            where: {
                chuc_vu_id: req.params.id,
            },
        });

        // Tạo danh sách mới các PositionPermission
        const newPermissions = qtc_ids.map((id) => ({
            chuc_vu_id: req.params.id,
            qtc_id: id,
            nguoi_tao: req.userId
        }));

        // Thêm mới
        await PositionPermission.bulkCreate(newPermissions);
    }

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const remove = async (req, res) => {
    await Position.destroy({
        where: {
            chuc_vu_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

module.exports = {
    findAll,
    findOne,
    create,
    update,
    remove,
};
