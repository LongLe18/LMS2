const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const hoadon = sequelize.define(
    'hoa_don',
    {
        hoa_don_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        hoa_don_ma: {
            type: DataTypes.STRING,
        },
        hoc_vien_id: {
            type: DataTypes.INTEGER,
        },
        ngay_lap: {
            type: DataTypes.DATE,
        },
        trang_thai: {
            type: DataTypes.BOOLEAN,
        },
        nhan_vien_id: {
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
        modelName: 'hoa_don',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = hoadon;
