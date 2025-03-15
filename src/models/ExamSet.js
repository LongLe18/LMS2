const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const bodethi = sequelize.define(
    'bo_de_thi',
    {
        bo_de_thi_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ten: {
            type: DataTypes.STRING,
        },
        anh_dai_dien: {
            type: DataTypes.STRING,
        },
        mo_ta: {
            type: DataTypes.STRING,
        },
        trang_thai: {
            type: DataTypes.BOOLEAN,
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
        modelName: 'bo_de_thi',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = bodethi;
