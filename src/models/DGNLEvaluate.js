const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const danhgiadgnl = sequelize.define(
    'danh_gia_dgnl',
    {
        danh_gia_dgnl_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        khoa_hoc_id: {
            type: DataTypes.INTEGER,
        },
        danh_gia: {
            type: DataTypes.STRING,
        },
        cau_bat_dau: {
            type: DataTypes.FLOAT,
        },
        cau_ket_thuc: {
            type: DataTypes.FLOAT,
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
        modelName: 'danh_gia_dgnl',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = danhgiadgnl;
