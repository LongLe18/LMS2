const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const quangcaokhoahoc = sequelize.define(
    'quang_cao_khoa_hoc',
    {
        qckh_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        mo_ta: {
            type: DataTypes.STRING,
        },
        khoa_hoc_id: {
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
        modelName: 'quang_cao_khoa_hoc',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = quangcaokhoahoc;
