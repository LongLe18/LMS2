const { AccountBank } = require('../models');

//[GET] /account_bank
//by Pham Viet Trieu
const getAll = async (req, res) => {
    const accountBanks = await AccountBank.findAll({limit: 100});
    res.status(200).send({
        status: 'success',
        data: accountBanks,
        message: null,
    });
};

//[GET] /account_bank/:id
//by Pham Viet Trieu
const getById = async (req, res) => {
    const accountBank = await AccountBank.findOne({
        where: {
            tai_khoan_bank_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: accountBank,
        message: null,
    });
};

//[POST] /account_bank/create
//by Pham Viet Trieu
const postCreate = async (req, res) => {
    const accountBank = await AccountBank.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: accountBank,
        message: null,
    });
};

//[PUT] /account_bank/:id
//by Pham Viet Trieu
const putUpdate = async (req, res) => {
    await AccountBank.update(
        {
            ...req.body,
        },
        {
            where: {
                tai_khoan_bank_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[DELETE] /account_bank/:id
//by Pham Viet Trieu
const deleteById = async (req, res) => {
    await AccountBank.destroy({
        where: {
            tai_khoan_bank_id: req.params.id,
        },
    });
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
    putUpdate,
    deleteById,
};
