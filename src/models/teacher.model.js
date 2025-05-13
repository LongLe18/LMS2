const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const giaovien = sequelize.define(
    'giao_vien',
    {
        giao_vien_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        giao_vien_ma: {
            type: DataTypes.STRING,
        },
        ho_ten: {
            type: DataTypes.STRING,
        },
        gioi_tinh: {
            type: DataTypes.STRING,
        },
        dia_chi: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        sdt: {
            type: DataTypes.STRING,
        },
        ten_dang_nhap: {
            type: DataTypes.STRING,
        },
        mat_khau: {
            type: DataTypes.STRING,
        },
        hoc_ham: {
            type: DataTypes.STRING,
        },
        hoc_vi: {
            type: DataTypes.STRING,
        },
        chuc_danh: {
            type: DataTypes.STRING,
        },
        // chuc_vu_id: {
        //     type: DataTypes.INTEGER,
        // },
        don_vi_id: {
            type: DataTypes.INTEGER,
        },
        ngay_sinh: {
            type: DataTypes.DATE,
        },
        anh_dai_dien: {
            type: DataTypes.STRING,
        },
        gioi_thieu: {
            type: DataTypes.STRING,
        },
        chuyen_nganh_id: {
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
        modelName: 'giao_vien',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = giaovien;
