const { Thematic, Modun, Course, Grade } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../utils/db');

//[GET] thematic/all
const getAllv2 = async (req, res) => {
    let offset = 0;
    let limit =100;
    if(req.query.offset){
        offset = req.query.offset;
    }
    if(req.query.limit){
        limit = req.query.limit;
    }
    const thematics = await Thematic.findAll({ offset: offset, limit: limit });
    res.status(200).send({
        status: 'success',
        data: thematics,
        message: null,
    });
};

//[GET] thematic?
const getAll = async (req, res) => {
    const filter = {};
    if (req.query.id) {
        filter.mo_dun_id = req.query.id;
        filter.trang_thai = true;
    }
    const thematics = await Thematic.findAll({
        where: {
            ...filter,
        },
    });
    res.status(200).send({
        status: 'success',
        data: {
            so_buoi_hoc: thematics.length,
            so_bai_kiem_tra: thematics.length + 1,
            thematics: thematics,
        },
        message: null,
    });
};

const getByIDModun = async (req, res) => {
    const thematics=await sequelize.query(`
        SELECT chuyen_de.* FROM chuyen_de WHERE 
        trang_thai=true AND mo_dun_id=${req.params.id}`,
        {type: sequelize.QueryTypes.SELECT});
    res.status(200).send({
        status: 'success',
        data: thematics,
        message: null,
    })
}

const getByFilter = async (req, res) => {
    let khoa_hoc_id=1;
    let trang_thai = 1;
    let mo_dun_id = 1;
    let offset = 0;
    let limit =100;
    let search = 1;
    if(req.query.offset){
        offset=req.query.offset;
    }
    if(req.query.limit){
        limit=req.query.limit;
    }
    if (req.query.khoa_hoc_id) {
        khoa_hoc_id = 'mo_dun.khoa_hoc_id=:khoa_hoc_id';
    }
    if (req.query.trang_thai) {
        trang_thai = 'chuyen_de.trang_thai=:trang_thai';
    }
    if (req.query.mo_dun_id) {
        mo_dun_id = 'chuyen_de.mo_dun_id=:mo_dun_id';
    }
    if (req.query.search) {
        search = 'chuyen_de.ten_chuyen_de LIKE :search';
    }
    let filter=`WHERE ${trang_thai} AND ${mo_dun_id} AND ${khoa_hoc_id} AND ${search}`;
    const thematics = await sequelize.query(`
        SELECT chuyen_de.*, mo_dun.ten_mo_dun, lop.ten_lop FROM chuyen_de LEFT JOIN mo_dun ON 
        chuyen_de.mo_dun_id=mo_dun.mo_dun_id LEFT JOIN lop ON chuyen_de.lop_id=lop.lop_id 
        ${filter} ORDER BY chuyen_de.ngay_tao DESC LIMIT :offset, :limit`,
        {
            replacements:{
                search: `%${decodeURI(req.query.search)}%`,
                trang_thai: parseInt(req.query.trang_thai),
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
                mo_dun_id: parseInt(req.query.mo_dun_id),
                limit: parseInt(limit),
                offset: parseInt(offset)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: thematics,
        message: null,
    });
};

//[GET] thematic/:id
const getById = async (req, res) => {
    const thematic = await Thematic.findOne({
        where: {
            chuyen_de_id: req.params.id,
        },
    });
    res.send({
        status: 'success',
        data: thematic,
        message: null,
    });
};

//[GET] thematic/create
const getCreate = async (req, res) => {
    res.send('create');
};

//[POST] thematic/create
const postCreate = async (req, res) => {
    const thematic = await Thematic.create({
        ...req.body,
    });
    res.status(200).send({
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
                    }
                ]
            },
        ],
        where: {
            chuyen_de_id: req.params.id,
        },
    });
    if (thematic.mo_dun) {
        thematic.dataValues.khoa_hoc_id = thematic.mo_dun.khoa_hoc_id;
        if (thematic.mo_dun.khoa_hoc)
            thematic.dataValues.kct_id = thematic.mo_dun.khoa_hoc.kct_id;
    }
    delete thematic.dataValues.mo_dun;
    delete thematic.dataValues.khoa_hoc;
    res.status(200).send({
        status: 'success',
        data: thematic,
        message: null,
    });
};

//[PUT] thematic/:id/edit
const putUpdate = async (req, res) => {
    const thematic = await Thematic.update(
        {
            ...req.body,
        },
        {
            where: {
                chuyen_de_id: req.params.id,
            },
        }
    );
    res.status(200).send({
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
        },
        {
            where: {
                chuyen_de_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[PATCH] thematic/:id/restore
const restore = async (req, res) => {
    await Thematic.update(
        {
            trang_thai: true,
        },
        {
            where: {
                chuyen_de_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[DELETE] thematic/:id/force
const forceDelete = async (req, res) => {
    await Thematic.destroy({
        where: {
            chuyen_de_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

module.exports = {
    getAllv2,
    getAll,
    getById,
    getByFilter,
    getCreate,
    postCreate,
    getUpdate,
    putUpdate,
    deleteById,
    getByIDModun,
    restore,
    forceDelete,
};
