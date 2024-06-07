const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const khoahochocvien = sequelize.define(
    'khoa_hoc_hoc_vien',
    {
        khhv_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        khoa_hoc_id: {
            type: DataTypes.INTEGER,
        },
        hoc_vien_id: {
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
        modelName: 'khoa_hoc_hoc_vien',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = khoahochocvien;
