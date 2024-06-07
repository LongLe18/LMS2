const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const baigiang = sequelize.define(
    'bai_giang',
    {
        bai_giang_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ten_bai_giang: {
            type: DataTypes.STRING,
        },
        mo_ta: {
            type: DataTypes.STRING,
        },
        loai_bai_giang: {
            type: DataTypes.STRING,
        },
        link_bai_giang: {
            type: DataTypes.STRING,
        },
        chuyen_de_id: {
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
        modelName: 'bai_giang',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = baigiang;
