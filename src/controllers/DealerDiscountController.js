const { DealerDiscount, DetailedDiscount, Course, Teacher } = require('../models');
const {Op}=require('sequelize');
const sequelize = require('../utils/db')

const getAll = async (req, res) => {
    let khoa_hoc_id='1';
    let ten_giao_vien='1';
    let offset = 0;
    let limit =100;
    if(req.query.khoa_hoc_id){
        khoa_hoc_id=`chiet_khau_dai_ly.khoa_hoc_id=:khoa_hoc_id`;
    }
    if(req.query.ten_giao_vien){
        ten_giao_vien=`giao_vien.ho_ten LIKE :ten_giao_vien`;
    }
    if(req.query.offset){
        offset=req.query.offset;
    }
    if(req.query.limit){
        limit=req.query.limit;
    }
    filter=`WHERE ${khoa_hoc_id} AND ${ten_giao_vien}`;
    let dealerDiscounts = await sequelize.query(`
        SELECT chiet_khau_dai_ly.chiet_khau_id, giao_vien.ho_ten, khoa_hoc.ten_khoa_hoc, chiet_khau_dai_ly.chiet_khau_sv, 
        chiet_khau_dai_ly.chiet_khau_gv, chiet_khau_dai_ly.ngay_tao FROM giao_vien 
        JOIN chiet_khau_dai_ly ON giao_vien.giao_vien_id=chiet_khau_dai_ly.giao_vien_id 
        JOIN khoa_hoc ON chiet_khau_dai_ly.khoa_hoc_id=khoa_hoc.khoa_hoc_id 
        ${filter} ORDER BY chiet_khau_dai_ly.ngay_tao DESC LIMIT :offset, :limit`, 
        {
            replacements: {
                offset: parseInt(offset),
                limit: parseInt(limit),
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id), 
                ten_giao_vien: `%${decodeURI(req.query.ten_giao_vien)}%`
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: dealerDiscounts,
        message: null,
    });
};

const getDealerByAdmin= async (req, res) => {
    let ngay_lap=1;;
    let trang_thai=1;
    let search = 1;
    if(req.query.search){
        search=`chiet_khau_chi_tiet.chiet_khau_ma LIKE :search`;
    }
    if(req.query.ngay_bat_dau&&req.query.ngay_ket_thuc){
        ngay_lap=`hoa_don.ngay_lap BETWEEN :ngay_bat_dau AND :ngay_ket_thuc`;
    }
    if(req.query.trang_thai){
        trang_thai= `chiet_khau_chi_tiet.trang_thai_quyet_toan=:trang_thai`;
    }
    filter=`WHERE ${search} AND ${ngay_lap} AND ${trang_thai} AND giao_vien.giao_vien_id=:giao_vien_id`;
    const disCounts= await sequelize.query(`
        SELECT giao_vien.ho_ten, khoa_hoc.ten_khoa_hoc,
        (mo_ta_khoa_hoc.gia_goc*chiet_khau_dai_ly.chiet_khau_gv)/100 AS tien_chiet_khau, 
        chiet_khau_chi_tiet.*, hoa_don.ngay_lap FROM chiet_khau_dai_ly JOIN giao_vien 
        ON chiet_khau_dai_ly.giao_vien_id=giao_vien.giao_vien_id JOIN khoa_hoc 
        ON khoa_hoc.khoa_hoc_id=chiet_khau_dai_ly.khoa_hoc_id JOIN mo_ta_khoa_hoc 
        ON mo_ta_khoa_hoc.khoa_hoc_id=khoa_hoc.khoa_hoc_id JOIN chiet_khau_chi_tiet 
        ON chiet_khau_dai_ly.chiet_khau_id=chiet_khau_chi_tiet.chiet_khau_id LEFT JOIN 
        hoa_don_chi_tiet ON hoa_don_chi_tiet.chiet_khau_ma=chiet_khau_chi_tiet.chiet_khau_ma 
        LEFT JOIN hoa_don ON hoa_don.hoa_don_id=hoa_don_chi_tiet.hoa_don_id ${filter} 
        ORDER BY chiet_khau_chi_tiet.ngay_tao DESC LIMIT 100`,
        {
            replacements:{
                search: `%${decodeURI(req.query.search)}%`,
                ngay_bat_dau: req.query.ngay_bat_dau,
                ngay_ket_thuc: req.query.ngay_ket_thuc,
                trang_thai: parseInt(req.query.trang_thai),
                giao_vien_id: parseInt(req.params.id)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: disCounts,
        message: null,
    });
}

const getById = async (req, res) => {
    let trang_thai_su_dung='1';
    let khoa_hoc_id='1';
    let ten_giao_vien='1';
    if(req.query.trang_thai_su_dung){
        trang_thai_su_dung=`chiet_khau_chi_tiet.trang_thai_su_dung=:trang_thai_su_dung`;
    }
    if(req.query.khoa_hoc_id){
        khoa_hoc_id=`chiet_khau_dai_ly.khoa_hoc_id=:khoa_hoc_id`;
    }
    if(req.query.ten_giao_vien){
        ten_giao_vien=`giao_vien.ho_ten LIKE :ten_giao_vien`;
    }
    filter=`WHERE chiet_khau_dai_ly.chiet_khau_id=:chiet_khau_id AND ${trang_thai_su_dung} AND ${khoa_hoc_id} AND ${ten_giao_vien}`;
    const dealerDiscount = await sequelize.query(`
        SELECT chiet_khau_chi_tiet.*, chiet_khau_dai_ly.chiet_khau_sv, giao_vien.ho_ten, 
        khoa_hoc.ten_khoa_hoc FROM khoa_hoc JOIN chiet_khau_dai_ly ON 
        khoa_hoc.khoa_hoc_id=chiet_khau_dai_ly.khoa_hoc_id JOIN giao_vien ON 
        giao_vien.giao_vien_id=chiet_khau_dai_ly.giao_vien_id JOIN chiet_khau_chi_tiet 
        ON chiet_khau_chi_tiet.chiet_khau_id=chiet_khau_dai_ly.chiet_khau_id ${filter}`,
        {
            replacements: {
                chiet_khau_id: parseInt(req.params.id),
                khoa_hoc_id: parseInt(khoa_hoc_id),
                trang_thai_su_dung: parseInt(trang_thai_su_dung),
                ten_giao_vien: `%${ten_giao_vien}%`
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: dealerDiscount,
        message: null,
    });
};

const getByIdv2 = async (req, res) => {
    const dealerDiscount = await sequelize.query(`
        SELECT chiet_khau_dai_ly.*, khoa_hoc.khoa_hoc_id FROM chiet_khau_dai_ly LEFT JOIN khoa_hoc 
        ON chiet_khau_dai_ly.khoa_hoc_id=khoa_hoc.khoa_hoc_id WHERE chiet_khau_dai_ly.chiet_khau_id=:chiet_khau_id`,
        {
            replacements:{
                chiet_khau_id: req.params.id
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: dealerDiscount[0],
        message: null,
    });
}

const postCreate = async (req, res) => {
    const dealerDiscount = await DealerDiscount.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: dealerDiscount,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    await DealerDiscount.update(
        {
            ...req.body,
        },
        {
            where: {
                chiet_khau_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const stateChange = async (req, res) => {
    const dealerDiscount = await DealerDiscount.findOne({
        where: {
            chiet_khau_id: req.params.id,
        },
        raw: true,
    });
    if (dealerDiscount.trang_thai) {
        await DealerDiscount.update(
            {
                trang_thai: false,
            },
            {
                where: {
                    chiet_khau_id: req.params.id,
                },
            }
        );
    } else {
        await DealerDiscount.update(
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
    await DetailedDiscount.destroy({
        where: {
            chiet_khau_id: req.params.id,
        }
    })
    await DealerDiscount.destroy({
        where: {
            chiet_khau_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

module.exports = {
    getDealerByAdmin,
    getAll,
    getById,
    postCreate,
    putUpdate,
    deleteById,
    stateChange,
    getByIdv2
};
