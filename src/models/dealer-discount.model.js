const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const chietkhaudaily = sequelize.define(
    'chiet_khau_dai_ly',
    {
        chiet_khau_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        khoa_hoc_id: {
            type: DataTypes.INTEGER,
        },
        giao_vien_id: {
            type: DataTypes.INTEGER,
        },
        chiet_khau_sv: {
            type: DataTypes.INTEGER,
        },
        chiet_khau_gv: {
            type: DataTypes.INTEGER,
        },
        so_luong: {
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
        modelName: 'chiet_khau_dai_ly',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = chietkhaudaily;
