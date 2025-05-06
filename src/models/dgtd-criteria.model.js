const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const tieuchidethidgtd = sequelize.define(
    'tieu_chi_de_thi_dgtd',
    {
        idtieu_chi_de_thi_dgtd: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        khoa_hoc_id: {
            type: DataTypes.INTEGER,
        },
        so_phan: {
            type: DataTypes.INTEGER,
        },
        so_cau_hoi: {
            type: DataTypes.INTEGER,
        },
        thoi_gian: {
            type: DataTypes.INTEGER,
        },
        so_cau_hoi_phan_1: {
            type: DataTypes.INTEGER,
        },
        thoi_gian_phan_1: {
            type: DataTypes.INTEGER,
        },
        so_cau_hoi_phan_2: {
            type: DataTypes.INTEGER,
        },
        thoi_gian_phan_2: {
            type: DataTypes.INTEGER,
        },
        so_cau_hoi_phan_3: {
            type: DataTypes.INTEGER,
        },
        thoi_gian_phan_3: {
            type: DataTypes.INTEGER,
        },
        so_cau_hoi_phan_4: {
            type: DataTypes.INTEGER,
        },
        thoi_gian_phan_4: {
            type: DataTypes.INTEGER,
        },
        so_cau_hoi_phan_5: {
            type: DataTypes.INTEGER,
        },
        thoi_gian_phan_5: {
            type: DataTypes.INTEGER,
        },
        so_cau_hoi_phan_6: {
            type: DataTypes.INTEGER,
        },
        thoi_gian_phan_6: {
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
        modelName: 'tieu_chi_de_thi_dgtd',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = tieuchidethidgtd;
