const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const trichdoan = sequelize.define(
    'trich_doan',
    {
        trich_doan_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        noi_dung: {
            type: DataTypes.STRING,
        },
        tep_dinh_kem: {
            type: DataTypes.STRING,
        },
        loai_trich_doan_id: {
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
        modelName: 'trich_doan',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = trichdoan;
