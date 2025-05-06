const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const hocvien = sequelize.define(
    'hoc_vien',
    {
        hoc_vien_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        hoc_vien_ma: {
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
        ttp_id: {
            type: DataTypes.INTEGER,
        },
        truong_hoc: {
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
        ngay_sinh: {
            type: DataTypes.DATE,
        },
        anh_dai_dien: {
            type: DataTypes.STRING,
        },
        gioi_thieu: {
            type: DataTypes.STRING,
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
        modelName: 'hoc_vien',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = hocvien;
