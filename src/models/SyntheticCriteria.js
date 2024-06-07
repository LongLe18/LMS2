const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const tieuchidetonghop = sequelize.define(
    'tieu_chi_de_tong_hop',
    {
        tcdth_khoa_hoc_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        so_cau_hoi: {
            type: DataTypes.INTEGER,
        },
        thoi_gian: {
            type: DataTypes.INTEGER,
        },
        yeu_cau: {
            type: DataTypes.INTEGER,
        },
        so_lan_thi: {
            type: DataTypes.INTEGER,
        },
        khoa_hoc_id: {
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
        modelName: 'tieu_chi_de_tong_hop',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = tieuchidetonghop;
