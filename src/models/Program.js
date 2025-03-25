const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const khungchuongtrinh = sequelize.define(
    'khung_chuong_trinh',
    {
        kct_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        kct_ma: {
            type: DataTypes.STRING,
        },
        ten_khung_ct: {
            type: DataTypes.STRING,
        },
        mo_ta: {
            type: DataTypes.STRING,
        },
        anh_dai_dien: {
            type: DataTypes.STRING,
        },
        thu_tu: {
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
        loai_kct: {
            type: DataTypes.INTEGER,
        }
    },
    {
        sequelize,
        modelName: 'khung_chuong_trinh',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = khungchuongtrinh;
