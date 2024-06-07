const { DiscountCode } = require('../models');
const { Op}=require('sequelize')
const sequelize=require('../utils/db');

const getAll = async (req, res) => {
    let khoa_hoc_id=1;
    let trang_thai =1;
    let offset = 0;
    let limit =100;
    if(req.query.offset){
        offset=req.query.offset;
    }
    if(req.query.limit){
        limit=req.query.limit;
    }
    if(req.query.khoa_hoc_id){
        khoa_hoc_id='ma_giam_gia.khoa_hoc_id=:khoa_hoc_id';
    }
    if(req.query.trang_thai){
        trang_thai='ma_giam_gia.trang_thai=:trang_thai';
    }
    let filter=`WHERE ${khoa_hoc_id} AND ${trang_thai}`;
    let discountCodes=await sequelize.query(`
        SELECT ma_giam_gia.*, khoa_hoc.ten_khoa_hoc FROM ma_giam_gia JOIN khoa_hoc ON 
        ma_giam_gia.khoa_hoc_id=khoa_hoc.khoa_hoc_id ${filter} ORDER BY ma_giam_gia.ngay_tao DESC LIMIT :offset, :limit`,
        {
            replacements: {
                offset: parseInt(offset),
                limit: parseInt(limit),
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
                trang_thai: parseInt(req.query.trang_thai)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: discountCodes,
        message: null,
    });
};

const getById = async (req, res) => {
    const discountCode=await DiscountCode.findOne({
        where:{
            giam_gia_id: req.params.id
        }
    })
    res.status(200).send({
        status: 'success',
        data: discountCode,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const discountCode = await DiscountCode.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: discountCode,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    await DiscountCode.update({
        ...req.body,
    },{
        where:{
            giam_gia_id: req.params.id,
        }
    })
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const getByCourse = async (req, res) => {
    const discountCode = await DiscountCode.findOne({
        where:{
            khoa_hoc_id: req.params.id,
            trang_thai: true,
            ngay_bat_dau: {
                [Op.lte]: Date.now()
            },
            ngay_ket_thuc:{
                [Op.gte]: Date.now()
            }
        },
        order: [['muc_giam_gia','DESC']]
    });
    res.status(200).send({
        status: 'success',
        data: discountCode??0,
        message: null,
    });
}

const stateChange = async (req, res) => {
    const discountCode = await DiscountCode.findOne({
        where: {
            giam_gia_id: req.params.id,
        },
        raw: true
    });
    if (discountCode.trang_thai) {
        await DiscountCode.update(
            {
                trang_thai: false,
            },
            {
                where: {
                    giam_gia_id: req.params.id,
                },
            }
        );
    } else {
        await DiscountCode.update(
            {
                trang_thai: true,
            },
            {
                where: {
                    chiet_khau_id: req.params.id,
                },
            }
        );
    }
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const deleteById = async (req, res) => {
    await DiscountCode.destroy({
        where:{
            giam_gia_id: req.params.id,
        }
    })
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

module.exports = {
    getAll,
    getById,
    postCreate,
    getByCourse,
    putUpdate,
    stateChange,
    deleteById,
};
