const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const lop = sequelize.define(
    'lop',
    {
        lop_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ten_lop: {
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
        modelName: 'lop',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = lop;
