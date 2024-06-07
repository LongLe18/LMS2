const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const hoadonchitiet = sequelize.define(
    'hoa_don_chi_tiet',
    {
        hoa_don_chi_tiet_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        so_luong: {
            type: DataTypes.INTEGER,
        },
        chiet_khau_ma: {
            type: DataTypes.STRING,
        },
        tong_tien:{
            type: DataTypes.INTEGER,
        },
        san_pham_id: {
            type: DataTypes.INTEGER,
        },
        loai_san_pham: {
            type: DataTypes.STRING,
        },
        hoa_don_id: {
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
        modelName: 'hoa_don_chi_tiet',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = hoadonchitiet;
