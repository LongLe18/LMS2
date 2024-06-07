const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const chuyende = sequelize.define(
    'chuyen_de',
    {
        chuyen_de_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ten_chuyen_de: {
            type: DataTypes.STRING,
        },
        mo_ta: {
            type: DataTypes.STRING,
        },
        mo_dun_id: {
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
        modelName: 'chuyen_de',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = chuyende;
