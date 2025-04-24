const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const donvi = sequelize.define(
    'don_vi',
    {
        don_vi_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        mo_ta: {
            type: DataTypes.STRING,
        },
        ten: {
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
        modelName: 'don_vi',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = donvi;
