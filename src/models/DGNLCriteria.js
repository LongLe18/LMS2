const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const tieuchidethidgnl = sequelize.define(
    'tieu_chi_de_thi_dgnl',
    {
        idtieu_chi_de_thi_dgnl: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        khoa_hoc_id: {
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
        modelName: 'tieu_chi_de_thi_dgnl',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = tieuchidethidgnl;
