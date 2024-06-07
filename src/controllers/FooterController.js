const {Footer} =require('../models');

const getAll= async (req, res) => {
    const footers= await Footer.findAll({limit: 100});
    res.status(200).send({
        status: 'success',
        data: footers,
        message: null
    });
}

const postCreate = async (req, res) => {
    const footer= await Footer.create({
        ...req.body
    })
    res.status(200).send({
        status: 'success',
        data: footer,
        message: null
    });
}

const getById= async (req, res) => {
    const footer=await Footer.findOne({
        where:{
            footer_id: req.params.id
        },
        raw: true
    });
    res.status(200).send({
        status: 'success',
        data: footer,
        message: null
    });
}

const putUpdate= async (req, res) => {
    await Footer.update({
            ...req.body
        },
        {
        where:{
            footer_id: req.params.id
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: null
    });
}

const deleteById = async (req, res) => {
    await Footer.destroy({
        where:{
            footer_id: req.params.id
        }
    })
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