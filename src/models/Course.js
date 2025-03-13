const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const khoahoc = sequelize.define(
    'khoa_hoc',
    {
        khoa_hoc_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        khoa_hoc_ma: {
            type: DataTypes.STRING,
        },
        ten_khoa_hoc: {
            type: DataTypes.STRING,
        },
        mo_ta:{
            type: DataTypes.STRING,
        },
        anh_dai_dien: {
            type: DataTypes.STRING,
        },
        video_mo_ta: {
            type: DataTypes.STRING,
        },
        ngay_bat_dau: {
            type: DataTypes.DATE,
        },
        ngay_ket_thuc: {
            type: DataTypes.DATE,
        },
        kct_id: {
            type: DataTypes.INTEGER,
        },
        lkh_id: {
            type: DataTypes.INTEGER,
        },
        trang_thai: {
            type: DataTypes.BOOLEAN,
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
        modelName: 'khoa_hoc',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = khoahoc;
