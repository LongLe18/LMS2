const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const dethihocvien = sequelize.define(
    'de_thi_hoc_vien',
    {
        dthv_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ket_qua_diem: {
            type: DataTypes.FLOAT(10, 2),
        },
        so_cau_tra_loi_dung: {
            type: DataTypes.INTEGER,
        },
        so_cau_tra_loi_sai: {
            type: DataTypes.INTEGER,
        },
        dat_yeu_cau: {
            type: DataTypes.BOOLEAN,
        },
        thoi_gian_lam_bai: {
            type: DataTypes.TIME,
        },
        thoi_diem_bat_dau: {
            type: DataTypes.DATE,
        },
        thoi_diem_ket_thuc: {
            type: DataTypes.DATE,
        },
        phan_dang_lam: {
            type: DataTypes.INTEGER,
        },
        thoi_gian_lam_phan: {
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
        diem_cac_phan: {
            type: DataTypes.STRING,
        },
        de_thi_id: {
            type: DataTypes.INTEGER,
        },
        hoc_vien_id: {
            type: DataTypes.INTEGER,
        },
        loai_de_thi_id: {
            type: DataTypes.INTEGER,
        },
        khoa_hoc_id: {
            type: DataTypes.INTEGER,
        },
    },
    {
        sequelize,
        modelName: 'de_thi_hoc_vien',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = dethihocvien;
