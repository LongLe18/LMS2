const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const nhanvien = sequelize.define(
    'nhan_vien',
    {
        nhan_vien_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nhan_vien_ma: {
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
        chuc_vu_id: {
            type: DataTypes.INTEGER,
        },
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
        phan_quyen_id: {
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
        modelName: 'nhan_vien',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = nhanvien;
