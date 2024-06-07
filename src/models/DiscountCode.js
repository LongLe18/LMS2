const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const magiamgia = sequelize.define(
    'ma_giam_gia',
    {
        giam_gia_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        khoa_hoc_id: {
            type: DataTypes.INTEGER,
        },
        muc_giam_gia: {
            type: DataTypes.STRING,
        },
        trang_thai: {
            type: DataTypes.BOOLEAN,
        },
        ngay_bat_dau: {
            type: DataTypes.DATE,
        },
        ngay_ket_thuc: {
            type: DataTypes.DATE,
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
        modelName: 'ma_giam_gia',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = magiamgia;
