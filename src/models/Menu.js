const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const menu = sequelize.define(
    'menu',
    {
        menu_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ten_menu: {
            type: DataTypes.STRING,
        },
        vi_tri_hien_thi: {
            type: DataTypes.INTEGER,
        },
        gia_tri: {
            type: DataTypes.STRING,
        },
        loai_menu_id: {
            type: DataTypes.INTEGER,
        },
        nguoi_tao: {
            type: DataTypes.STRING,
        },
        ngay_tao: {
            type: DataTypes.DATE,
        },
        nguoi_sua: {
            type: DataTypes.STRING,
        },
        ngay_sua: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        modelName: 'menu',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = menu;
