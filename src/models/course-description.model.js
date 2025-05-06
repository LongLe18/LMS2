const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const motakhoahoc = sequelize.define(
    'mo_ta_khoa_hoc',
    {
        khoa_hoc_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        mo_ta_chung: {
            type: DataTypes.STRING,
        },
        gioi_thieu: {
            type: DataTypes.STRING,
        },
        hinh_thuc_dao_tao: {
            type: DataTypes.STRING,
        },
        muc_tieu_cam_ket: {
            type: DataTypes.STRING,
        },
        doi_tuong: {
            type: DataTypes.STRING,
        },
        noi_dung_chi_tiet: {
            type: DataTypes.STRING,
        },
        xep_lop_thoi_gian: {
            type: DataTypes.STRING,
        },
        gia_goc: {
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
        modelName: 'mo_ta_khoa_hoc',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = motakhoahoc;
