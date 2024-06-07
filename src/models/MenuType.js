const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const loaimenu = sequelize.define(
    'loai_menu',
    {
        loai_menu_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ten_loai_menu: {
            type: DataTypes.STRING,
        },
        mo_ta: {
            type: DataTypes.STRING,
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
        modelName: 'loai_menu',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = loaimenu;
