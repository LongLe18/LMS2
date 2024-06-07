const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const loaidethi = sequelize.define(
    'loai_de_thi',
    {
        loai_de_thi_id: {
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
        modelName: 'loai_de_thi',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = loaidethi;
