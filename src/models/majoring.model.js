const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const chuyennganh = sequelize.define(
    'chuyen_nganh',
    {
        chuyen_nganh_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        chuyen_nganh_ma: {
            type: DataTypes.STRING,
        },
        ten_chuyen_nganh: {
            type: DataTypes.STRING,
        },
        mo_ta: {
            type: DataTypes.STRING,
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
        modelName: 'chuyen_nganh',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = chuyennganh;
