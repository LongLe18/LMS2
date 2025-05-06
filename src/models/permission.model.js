const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const quyentruycap = sequelize.define(
    'quyen_truy_cap',
    {
        qtc_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        hanh_dong: {
            type: DataTypes.STRING,
        },
        ten: {
            type: DataTypes.STRING,
        },
        loai: {
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
        modelName: 'quyen_truy_cap',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = quyentruycap;
