const { MenuType } = require('../models');

const findAll = async (req, res) => {
    const menuTypes = await MenuType.findAll();

    return res.status(200).send({
        status: 'success',
        data: menuTypes,
        message: null,
    });
};

const findOne = async (req, res) => {
    const menuType = await MenuType.findOne({
        where: {
            loai_menu_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: menuType,
        message: null,
    });
};

const create = async (req, res) => {
    const menuType = await MenuType.create({
        ...req.body,
    });

    return res.status(200).send({
        status: 'success',
        data: menuType,
        message: null,
    });
};

const update = async (req, res) => {
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

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const remove = async (req, res) => {
    await MenuType.destroy({
        where: {
            loai_menu_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    findAll,
    findOne,
    create,
    update,
    remove,
};
