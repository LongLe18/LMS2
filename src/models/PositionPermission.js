const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const chucvuqtc = sequelize.define(
    'chuc_vu_qtc',
    {
        cvqtc_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        chuc_vu_id: {
            type: DataTypes.INTEGER,
        },
        qtc_id: {
            type: DataTypes.INTEGER,
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
        modelName: 'chuc_vu_qtc',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = chucvuqtc;
