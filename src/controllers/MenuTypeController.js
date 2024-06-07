const { MenuType } = require('../models');

const getAll = async (req, res) => {
    const menuTypes = await MenuType.findAll({limit: 100});
    res.status(200).send({
        status: 'success',
        data: menuTypes,
        message: null,
    });
};

const getById = async (req, res) => {
    const menuType = await MenuType.findOne({
        where: {
            loai_menu_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: menuType,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const menuType = await MenuType.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: menuType,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    await MenuType.update(
        {
            ...req.body,
        },
        {
            where: {
                loai_menu_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const deleteById = async (req, res) => {
    await MenuType.destroy({
        where: {
            loai_menu_id: req.params.id,
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
    deleteById,
};
