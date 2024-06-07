const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const token = sequelize.define(
    'token',
    {
        token_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ma: {
            type: DataTypes.STRING,
        },
        trang_thai: {
            type: DataTypes.TINYINT,
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
        modelName: 'token',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = token;
