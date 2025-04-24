const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const chucvu = sequelize.define(
    'chuc_vu',
    {
        chuc_vu_id: {
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
        ma: {
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
        modelName: 'chuc_vu',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = chucvu;
