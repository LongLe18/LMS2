const { Thematic, Modun, Course } = require('../models');
const sequelize = require('../utils/db');

const getAllv2 = async (req, res) => {
    let pageIndex = parseInt(req.query.pageIndex) || 1; // Mặc định là trang 1
    let pageSize = parseInt(req.query.pageSize) || 10; // Mặc định là 10 bản ghi mỗi trang

    let offset = (pageIndex - 1) * pageSize; // Tính toán offset
    let limit = pageSize; // Sử dụng pageSize làm limit

    const result = await Thematic.findAndCountAll({
        offset: offset,
        limit: limit,
    });

    let totalPages = Math.ceil(result.count / pageSize);

    return res.status(200).send({
        status: 'success',
        data: result.rows, // Dữ liệu phân trang
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalPages: totalPages,
        totalCount: result.count, // Tổng số bản ghi
        message: null,
    });
};

const findAll = async (req, res) => {
    const pageIndex = parseInt(req.query.pageIndex) || 1; // Mặc định là trang 1
    const pageSize = parseInt(req.query.pageSize) || 10; // Mặc định là 10 bản ghi mỗi trang

    const offset = (pageIndex - 1) * pageSize;
    const limit = pageSize;

    const result = await Thematic.findAndCountAll({
        where: {
            ...(req.query.id && {
                mo_dun_id: req.query.id,
                trang_thai: true,
            }),
        },
        offset: offset,
        limit: limit,
    });

    let totalPages = Math.ceil(result.count / pageSize);

    return res.status(200).send({
        status: 'success',
        data: {
            so_buoi_hoc: result.rows.length, // Số bản ghi trong trang hiện tại
            so_bai_kiem_tra: result.rows.length + 1, // Số bài kiểm tra, có thể thêm 1 nếu cần thiết
            thematics: result.rows, // Dữ liệu phân trang
        },
        pageIndex,
        pageSize,
        totalPages,
        totalCount: result.count, // Tổng số bản ghi
        message: null,
    });
};

const getByModunId = async (req, res) => {
    const thematics = await sequelize.query(
        `
        SELECT chuyen_de.* 
        FROM chuyen_de 
        WHERE trang_thai = true 
        AND mo_dun_id = :mo_dun_id`,
        {
            replacements: {
                mo_dun_id: req.params.id,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: thematics,
        message: null,
    });
};

const getByFilter = async (req, res) => {
    let whereConditions = [];
    let replacements = {};

    let pageSize = Number(req.query.pageSize || 10);
    let pageIndex = Number(req.query.pageIndex || 1);
    let offset = (pageIndex - 1) * pageSize;

    if (req.query.trang_thai) {
        whereConditions.push('chuyen_de.trang_thai = :trang_thai');
        replacements.trang_thai = parseInt(req.query.trang_thai);
    }
    if (req.query.khoa_hoc_id) {
        whereConditions.push('mo_dun.khoa_hoc_id = :khoa_hoc_id');
        replacements.khoa_hoc_id = parseInt(req.query.khoa_hoc_id);
    }
    if (req.query.mo_dun_id) {
        whereConditions.push('chuyen_de.mo_dun_id = :mo_dun_id');
        replacements.mo_dun_id = parseInt(req.query.mo_dun_id);
    }
    if (req.query.search) {
        whereConditions.push('chuyen_de.ten_chuyen_de LIKE :search');
        replacements.search = `%${decodeURI(req.query.search)}%`;
    }

    const whereClause =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

    replacements.limit = pageSize;
    replacements.offset = offset;

    const thematics = await sequelize.query(
        `
        SELECT chuyen_de.*, mo_dun.ten_mo_dun, lop.ten_lop 
        FROM chuyen_de 
        LEFT JOIN mo_dun ON chuyen_de.mo_dun_id = mo_dun.mo_dun_id 
        LEFT JOIN lop ON chuyen_de.lop_id = lop.lop_id
        ${whereClause} 
        ORDER BY chuyen_de.ngay_tao DESC
        LIMIT :limit OFFSET :offset
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalResult = await sequelize.query(
        `
        SELECT COUNT(*) AS total 
        FROM chuyen_de 
        LEFT JOIN mo_dun ON chuyen_de.mo_dun_id = mo_dun.mo_dun_id 
        LEFT JOIN lop ON chuyen_de.lop_id = lop.lop_id
        ${whereClause}
        `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    const totalCount = totalResult[0].total;
    const totalPage = Math.ceil(totalCount / pageSize);

    return res.status(200).send({
        status: 'success',
        data: thematics,
        pageIndex,
        pageSize,
        totalCount,
        totalPage,
        message: null,
    });
};

const findOne = async (req, res) => {
    const thematic = await Thematic.findOne({
        where: {
            chuyen_de_id: req.params.id,
        },
    });

    return res.send({
        status: 'success',
        data: thematic,
        message: null,
    });
};

const getCreate = async (req, res) => {
    res.send('create');
};

const create = async (req, res) => {
    const thematic = await Thematic.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: thematic,
        message: null,
    });
};

//[GET] thematic/:id
const getUpdate = async (req, res) => {
    const thematic = await Thematic.findOne({
        include: [
            {
                model: Modun,
                attributes: ['khoa_hoc_id'],
                include: [
                    {
                        model: Course,
                        attributes: ['kct_id'],
                    },
                ],
            },
        ],
        where: {
            chuyen_de_id: req.params.id,
        },
    });

    if (thematic) {
        // Chuyển dữ liệu khoa_hoc_id và kct_id vào thematic.dataValues
        if (thematic.mo_dun) {
            thematic.dataValues.khoa_hoc_id = thematic.mo_dun.khoa_hoc_id;
            if (thematic.mo_dun.khoa_hoc) {
                thematic.dataValues.kct_id = thematic.mo_dun.khoa_hoc.kct_id;
            }
        }

        // Xóa thuộc tính không cần thiết
        delete thematic.dataValues.mo_dun;
        delete thematic.dataValues.khoa_hoc;

        return res.status(200).send({
            status: 'success',
            data: thematic,
            message: null,
        });
    } else {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'Thematic not found.',
        });
    }
};

//[PUT] thematic/:id/edit
const update = async (req, res) => {
    const thematic = await Thematic.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                chuyen_de_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: thematic,
        message: null,
    });
};

//[DELETE] thematic/:id
const deleteById = async (req, res) => {
    await Thematic.update(
        {
            trang_thai: false,
            nguoi_sua: req.userId,
        },
        {
            where: {
                chuyen_de_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const restore = async (req, res) => {
    await Thematic.update(
        {
            trang_thai: true,
            nguoi_sua: req.userId,
        },
        {
            where: {
                chuyen_de_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const remove = async (req, res) => {
    await Thematic.destroy({
        where: {
            chuyen_de_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

module.exports = {
    getAllv2,
    findAll,
    findOne,
    getByFilter,
    getCreate,
    create,
    getUpdate,
    update,
    deleteById,
    getByModunId,
    restore,
    remove,
};
