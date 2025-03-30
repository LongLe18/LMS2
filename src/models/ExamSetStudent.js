const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const bodehocvien = sequelize.define(
    'bo_de_hoc_vien',
    {
        bdhv_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        khtt_id: {
            type: DataTypes.INTEGER,
        },
        hoc_vien_id: {
            type: DataTypes.INTEGER,
        },
        khoa_hoc_id: {
            type: DataTypes.INTEGER,
        },
        ngay_tao: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        modelName: 'bo_de_hoc_vien',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = bodehocvien;
