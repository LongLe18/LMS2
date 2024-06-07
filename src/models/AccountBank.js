const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const taikhoanbank = sequelize.define(
    'tai_khoan_bank',
    {
        tai_khoan_bank_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ten_ngan_hang: {
            type: DataTypes.STRING,
        },
        so_tai_khoan: {
            type: DataTypes.STRING,
        },
        ten_dvth: {
            type: DataTypes.STRING,
        },
        chi_nhanh: {
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
        modelName: 'tai_khoan_bank',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = taikhoanbank;
