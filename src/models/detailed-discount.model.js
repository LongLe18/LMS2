const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const chietkhauchitiet = sequelize.define(
    'chiet_khau_chi_tiet',
    {
        chiet_khau_chi_tiet_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        chiet_khau_id: {
            type: DataTypes.INTEGER,
        },
        chiet_khau_ma: {
            type: DataTypes.STRING,
        },
        trang_thai_su_dung: {
            type: DataTypes.BOOLEAN,
        },
        trang_thai_quyet_toan: {
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
        modelName: 'chiet_khau_chi_tiet',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = chietkhauchitiet;
