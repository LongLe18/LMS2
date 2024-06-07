const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const tailieu = sequelize.define(
    'tai_lieu',
    {
        tai_lieu_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        tai_lieu_ma: {
            type: DataTypes.STRING,
        },
        mo_ta: {
            type: DataTypes.STRING,
        },
        ten_tai_lieu: {
            type: DataTypes.STRING,
        },
        anh_dai_dien: {
            type: DataTypes.STRING,
        },
        noi_dung: {
            type: DataTypes.STRING,
        },
        loai_tai_lieu_id: {
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
        modelName: 'tai_lieu',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = tailieu;
