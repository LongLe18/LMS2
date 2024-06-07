const {Province}=require('../models');

const getAll= async (req, res) => {
    const provinces = await Province.findAll();
    res.status(200).send({
        status: 'success',
        data: provinces,
        message: null
    });
}

const getById= async (req, res) => {
    const province= await Province.findOne({
        where:{
            ttp_id: req.params.id
        },
    });
    res.status(200).send({
        status: 'success',
        data: province,
        message: null
    });
}

const postCreate= async (req, res) => {
    const province=await Province.create({
        ...req.body
    });
    res.status(200).send({
        status: 'success',
        data: province,
        message: null
    });
}

const putUpdate= async (req, res) => {
    await Province.update({
        ...req.body,
    },{
        where:{
            ttp_id: req.params.id
        }
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: null
    });
}

const deleteById = async (req, res) => {
    await Province.destroy({
        where:{
            ttp_id: req.params.id
        }
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: null
    });
}

module.exports = {
    getAll,
    getById,
    postCreate,
    putUpdate,
    deleteById
}