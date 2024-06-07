const {Contact}=require('../models');

const getAll= async (req, res) => {
    const contacts = await Contact.findAll({
        raw: true,
        limit: 100
    });
    res.status(200).send({
        status: 'success',
        data: contacts,
        message: null
    });
}

const getById= async (req, res) => {
    const contact= await Contact.findOne({
        where:{
            lien_he_id: req.params.id
        },
        raw: true
    });
    res.status(200).send({
        status: 'success',
        data: contact,
        message: null
    });
}

const postCreate= async (req, res) => {
    const contact=await Contact.create({
        ...req.body
    });
    res.status(200).send({
        status: 'success',
        data: contact,
        message: null
    });
}

const putUpdate= async (req, res) => {
    await Contact.update({
        ...req.body,
    },{
        where:{
            lien_he_id: req.params.id
        }
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: null
    });
}

const deleteById = async (req, res) => {
    await Contact.destroy({
        where:{
            lien_he_id: req.params.id
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