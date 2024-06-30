const { Menu, MenuType } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../utils/db');

const getAll = async (req, res) => {
    const menus = await Menu.findAll({
        include: {
            model: MenuType,
            attributes: ['ten_loai_menu'],
        },
        order: [['vi_tri_hien_thi', 'ASC']],
        limit: 100
    });
    for (const menu of menus) {
        menu.dataValues.loai_menu = menu.loai_menu.ten_loai_menu;
        if (menu.loai_menu_id == 2) {
            const program = await sequelize.query(
                `SELECT kct_id AS 'key', ten_khung_ct AS 'label' FROM khung_chuong_trinh WHERE kct_id IN (${menu.gia_tri}) `,
                { type: sequelize.QueryTypes.SELECT }
            );
            menu.dataValues.kct = program;
        } else if (menu.loai_menu_id === 3) {
            const program = await sequelize.query(
                `SELECT loai_kct FROM khung_chuong_trinh WHERE kct_id IN (${menu.gia_tri}) `,
                { type: sequelize.QueryTypes.SELECT }
            );
            if(program[0])
                menu.dataValues.loai_kct = program[0].loai_kct;
        }
    }
    res.status(200).send({
        status: 'success',
        data: menus,
        message: null,
    });
};

const getById = async (req, res) => {
    const menu = await Menu.findOne({
        where: {
            menu_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: menu,
        message: null,
    });
};

const postCreate = async (req, res) => {
    let menu;
    menu = await Menu.findOne({
        where: {
            vi_tri_hien_thi: req.body.vi_tri_hien_thi,
        },
    });
    if (menu) {
        res.status(404).send({
            status: 'error',
            data: menu,
            message: 'coincide',
        });
        return;
    }
    menu = await Menu.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: menu,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    let menu;
    menu = await Menu.findOne({
        where: {
            vi_tri_hien_thi: req.body.vi_tri_hien_thi,
            menu_id: {
                [Op.not]: req.params.id,
            },
        },
    });
    if (menu) {
        res.status(404).send({
            status: 'error',
            data: menu,
            message: 'Vị trí đã sử dụng',
        });
        return;
    }
    await Menu.update(
        {
            ...req.body,
        },
        {
            where: {
                menu_id: req.params.id,
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
    await Menu.destroy({
        where: {
            menu_id: req.params.id,
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
