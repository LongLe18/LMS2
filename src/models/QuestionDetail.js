const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const cauhoichitiet = sequelize.define(
    'cau_hoi_chi_tiet',
    {
        chct_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        noi_dung: {
            type: DataTypes.STRING,
        },
        cau_hoi_id: {
            type: DataTypes.INTEGER,
        },
        ngay_tao: {
            type: DataTypes.DATE,
        },
        ngay_sua: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        modelName: 'cau_hoi_chi_tiet',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = cauhoichitiet;
