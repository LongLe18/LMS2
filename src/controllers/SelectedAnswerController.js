const { SelectedAnswer } = require('../models');
const sequelize = require('../utils/db');

const getAll = async (req, res) => {
    let dthv_id =1;
    let cau_hoi_id=1;
    if (req.query.dthv_id) dthv_id = 'dap_an_da_chon.dthv_id=:dthv_id';
    if (req.query.cau_hoi_id) cau_hoi_id = 'dap_an_da_chon.cau_hoi_id=:cau_hoi_id';
    let filter=`WHERE ${dthv_id} AND ${cau_hoi_id} AND de_thi_hoc_vien.hoc_vien_id=:hoc_vien_id`;
    let selectedAnswers = await sequelize.query(`
        SELECT dap_an_da_chon.* FROM dap_an_da_chon JOIN de_thi_hoc_vien ON 
        dap_an_da_chon.dthv_id=de_thi_hoc_vien.dthv_id ${filter}`,
        {
            replacements:{
                dthv_id: parseInt(req.query.dthv_id),
                cau_hoi_id: parseInt(req.query.cau_hoi_id),
                hoc_vien_id: parseInt(req.userId)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: selectedAnswers,
        message: null,
    });
};

const getById = async (req, res) => {
    const selectedAnswer = await SelectedAnswer.findOne({
        where: {
            dadc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: selectedAnswer,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const selectedAnswer=[];
    for (var i = 0; i < req.body.ket_qua_chons.length; i++) {
        selectedAnswer.push({
            ket_qua_chon: req.body.ket_qua_chons[i].ket_qua,
            dthv_id: req.body.dthv_id,
            cau_hoi_id: req.body.ket_qua_chons[i].cau_hoi_id,
        });
    }
    for (var i = 0; i < req.body.noi_dung_tra_lois.length; i++) {
        selectedAnswer.push({
            noi_dung_tra_loi: req.body.noi_dung_tra_lois[i].noi_dung,
            dthv_id: req.body.dthv_id,
            cau_hoi_id: req.body.noi_dung_tra_lois[i].cau_hoi_id,
        });
    }
    await SelectedAnswer.bulkCreate(selectedAnswer);
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    const selectedAnswer = await SelectedAnswer.update(
        {
            ...req.body,
        },
        {
            where: {
                dadc_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: selectedAnswer,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    await SelectedAnswer.destroy({
        where: {
            dadc_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    getAll,
    getById,
    postCreate,
    putUpdate,
    forceDelete,
};
