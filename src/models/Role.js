const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const phanquyen = sequelize.define(
    'phan_quyen',
    {
        quyen_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        quyen_he_thong: {
            type: DataTypes.STRING,
        },
        quyen_nhan_su: {
            type: DataTypes.STRING,
        },
        quyen_kinh_doanh: {
            type: DataTypes.STRING,
        },
        quyen_khao_thi: {
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
        modelName: 'phan_quyen',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = phanquyen;
