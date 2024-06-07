const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const loaitailieu = sequelize.define(
    'loai_tai_lieu',
    {
        loai_tai_lieu_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        modelName: 'loai_tai_lieu',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = loaitailieu;
