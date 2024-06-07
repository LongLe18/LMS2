const {
    DetailedDiscount,
    DealerDiscount,
} = require('../models');
const sequelize = require('../utils/db');
const {makeid}= require('../utils/security');

const getDetailByUser= async (req, res) => {
    let trang_thai_su_dung=`1`;
    let trang_thai_quyet_toan=`1`;
    let khoa_hoc_id=`1`;
    if(req.query.trang_thai_su_dung){
        trang_thai_su_dung=`chiet_khau_chi_tiet.trang_thai_su_dung=:trang_thai_su_dung`;
    }
    if(req.query.trang_thai_quyet_toan){
        trang_thai_quyet_toan=`chiet_khau_chi_tiet.trang_thai_quyet_toan=:trang_thai_quyet_toan`;
    }
    if(req.query.khoa_hoc_id){
        khoa_hoc_id=`khoa_hoc.khoa_hoc_id=:khoa_hoc_id`;
    }
    let filter=`WHERE ${trang_thai_su_dung} AND ${trang_thai_quyet_toan} AND giao_vien_id=${req.userId} AND ${khoa_hoc_id}`;
    const disCounts= await sequelize.query(`
        SELECT khoa_hoc.ten_khoa_hoc, chiet_khau_dai_ly.chiet_khau_gv, chiet_khau_chi_tiet.*, mo_ta_khoa_hoc.gia_goc,
        (mo_ta_khoa_hoc.gia_goc*chiet_khau_dai_ly.chiet_khau_gv)/100 AS thuc_linh 
        FROM khoa_hoc JOIN chiet_khau_dai_ly ON chiet_khau_dai_ly.khoa_hoc_id=khoa_hoc.khoa_hoc_id JOIN 
        chiet_khau_chi_tiet ON chiet_khau_chi_tiet.chiet_khau_id=chiet_khau_dai_ly.chiet_khau_id JOIN
        mo_ta_khoa_hoc ON mo_ta_khoa_hoc.khoa_hoc_id=khoa_hoc.khoa_hoc_id ${filter} LIMIT 100`,
        {
            replacements: {
                trang_thai_su_dung: parseInt(req.body.trang_thai_su_dung),
                trang_thai_quyet_toan: parseInt(req.body.trang_thai_quyet_toan),
                khoa_hoc_id: parseInt(req.body.khoa_hoc_id)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: disCounts,
        message: null,
    });
}

const getAll = async (req, res) => {
    let trang_thai_su_dung='1';
    let chiet_khau_id='1'; 
    if (req.query.trang_thai_su_dung) {
        trang_thai_su_dung = `trang_thai_su_dung=:trang_thai_su_dung`;
    }
    if(req.query.chiet_khau_id){
        chiet_khau_id=`chiet_khau_id=:chiet_khau_id`;
    }
    let filter=`WHERE ${trang_thai_su_dung} AND ${chiet_khau_id}`
    let detailedDiscounts = await sequelize.query(`
        SELECT chiet_khau_chi_tiet.* FROM chiet_khau_chi_tiet ${filter} LIMIT 100000`,
        {
            replacements: {
                trang_thai_su_dung: parseInt(req.query.trang_thai_su_dung),
                chiet_khau_id: parseInt(req.query.chiet_khau_id)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: detailedDiscounts,
        message: null,
    });
};

const getById = async (req, res) => {
    const detailedDiscount = await sequelize.query(`
        SELECT chiet_khau_chi_tiet.* FROM chiet_khau_chi_tiet WHERE chiet_khau_chi_tiet_id=:chiet_khau_chi_tiet_id`,
        {
            replacements: {
                chiet_khau_chi_tiet_id: req.params.id
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: detailedDiscount,
        message: null,
    });
};

const checkCode = async (req, res) => {
    let dealerDiscount;
    if (req.query.chiet_khau_ma) {
        let detailedDiscount = await sequelize.query(`
            SELECT chiet_khau_chi_tiet.*, chiet_khau_dai_ly.khoa_hoc_id FROM chiet_khau_dai_ly JOIN chiet_khau_chi_tiet
            ON chiet_khau_dai_ly.chiet_khau_id=chiet_khau_chi_tiet.chiet_khau_id
            WHERE chiet_khau_chi_tiet.chiet_khau_ma=:chiet_khau_ma`,
            {
                replacements: {
                    chiet_khau_ma: decodeURI(req.query.chiet_khau_ma)
                },
                type: sequelize.QueryTypes.SELECT
            });
        detailedDiscount=detailedDiscount[0];
        if(detailedDiscount.khoa_hoc_id!=req.query.khoa_hoc_id){
            res.status(404).send({
                status: 'error',
                data: null,
                message: 'code does not exist',
            });
            return;
        }
        if (!detailedDiscount) {
            res.status(404).send({
                status: 'error',
                data: null,
                message: 'code does not exist',
            });
            return;
        }
        if (detailedDiscount.trang_thai_su_dung == 1) {
            res.status(404).send({
                status: 'error',
                data: null,
                message: 'used code',
            });
            return;
        } else if (detailedDiscount.trang_thai_su_dung == 2) {
            res.status(404).send({
                status: 'error',
                data: null,
                message: 'stop using',
            });
            return;
        }
        dealerDiscount = await sequelize.query(
            `SELECT chiet_khau_dai_ly.chiet_khau_sv, chiet_khau_chi_tiet.chiet_khau_chi_tiet_id FROM chiet_khau_dai_ly JOIN chiet_khau_chi_tiet 
            ON chiet_khau_dai_ly.chiet_khau_id=chiet_khau_chi_tiet.chiet_khau_id 
            WHERE chiet_khau_ma=:chiet_khau_ma`,
            { 
                replacements: {
                    chiet_khau_ma: req.query.chiet_khau_ma
                },
                type: sequelize.QueryTypes.SELECT 
            }
        );
        res.status(200).send({
            status: 'success',
            data: dealerDiscount[0]??0,
            message: null,
        });
    }
    else{
        res.status(200).send({
            status: 'success',
            data: 0,
            message: null,
        });
    }
}

const postCreate = async (req, res) => {
    const dealerDiscount = await DealerDiscount.findOne({
        where: {
            chiet_khau_id: req.body.chiet_khau_id,
        },
        raw: true,
    });
    let detailedDiscounts = [];
    let chiet_khau_ma;
    for (var i = 0; i < dealerDiscount.so_luong; i++) {
        chiet_khau_ma = `${makeid(4)}-${makeid(4)}-${makeid(4)}`;
        detailedDiscounts.push({
            chiet_khau_id: req.body.chiet_khau_id,
            chiet_khau_ma: chiet_khau_ma,
        });
    }
    await DetailedDiscount.bulkCreate(detailedDiscounts);
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    await DetailedDiscount.update(
        {
            ...req.body,
        },
        {
            where: {
                chiet_khau_chi_tiet_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const changeState = async (req, res) => {
    await sequelize.query(
        `UPDATE chiet_khau_chi_tiet SET trang_thai_quyet_toan=1 WHERE 
        chiet_khau_chi_tiet_id IN (${req.body.gia_tri}) AND trang_thai_su_dung=1`,
        {type: sequelize.QueryTypes.UPDATE});
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
}

const deleteById = async (req, res) => {
    await DetailedDiscount.destroy({
        where: {
            chiet_khau_chi_tiet_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const deleteList = async (req, res) => {
    await sequelize.query(
        `DELETE FROM chiet_khau_chi_tiet WHERE chiet_khau_chi_tiet_id IN (${req.body.gia_tri})`,
        {type: sequelize.QueryTypes.DELETE});
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
}

module.exports = {
    getAll,
    getById,
    getDetailByUser,
    checkCode,
    postCreate,
    putUpdate,
    deleteById,
    changeState,
    deleteList
};
