const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const dethi = sequelize.define(
    'de_thi',
    {
        de_thi_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        de_thi_ma: {
            type: DataTypes.STRING,
        },
        ten_de_thi: {
            type: DataTypes.STRING,
        },
        mo_ta: {
            type: DataTypes.STRING,
        },
        tong_diem: {
            type: DataTypes.FLOAT(10, 2),
        },
        anh_dai_dien: {
            type: DataTypes.STRING,
        },
        loai_de_thi_id: {
            type: DataTypes.INTEGER,
        },
        khoa_hoc_id: {
            type: DataTypes.INTEGER,
        },
        de_cha_id: {
            type: DataTypes.INTEGER,
        },
        kct_id: {
            type: DataTypes.INTEGER,
        },
        mo_dun_id: {
            type: DataTypes.INTEGER,
        },
        chuyen_de_id: {
            type: DataTypes.INTEGER,
        },
        de_mau_id: {
            type: DataTypes.INTEGER,
        },
        de_mau: {
            type: DataTypes.BOOLEAN,
        },
        xuat_ban: {
            type: DataTypes.BOOLEAN,
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
        modelName: 'de_thi',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = dethi;
