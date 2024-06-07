const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const footer = sequelize.define(
    'footer',
    {
        footer_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ten_footer: {
            type: DataTypes.STRING,
        },
        noi_dung: {
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
        modelName: 'footer',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = footer;
