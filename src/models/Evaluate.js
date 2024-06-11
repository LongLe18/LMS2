const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const danhgia = sequelize.define(
    'danh_gia',
    {
        danh_gia_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        de_thi_id: {
            type: DataTypes.INTEGER,
        },
        danh_gia: {
            type: DataTypes.STRING,
        },
        cau_bat_dau: {
            type: DataTypes.INTEGER,
        },
        cau_ket_thuc: {
            type: DataTypes.INTEGER,
        },
        phan_thi: {
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
        modelName: 'danh_gia',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = danhgia;
