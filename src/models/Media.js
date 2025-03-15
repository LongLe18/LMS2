const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const teptin = sequelize.define(
    'tep_tin',
    {
        tep_tin_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ten: {
            type: DataTypes.STRING,
        },
        duong_dan: {
            type: DataTypes.STRING,
        },
        loai: {
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
        modelName: 'tep_tin',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = teptin;
