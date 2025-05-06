const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const loaikhoahoc = sequelize.define(
    'loai_khoa_hoc',
    {
        lkh_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        modelName: 'loai_khoa_hoc',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = loaikhoahoc;
