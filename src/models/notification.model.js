const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const thongbao = sequelize.define(
    'thong_bao',
    {
        thong_bao_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        loai_thong_bao: {
            type: DataTypes.INTEGER,
        },
        lien_ket_id: {
            type: DataTypes.INTEGER,
        },
        link_lien_ket:{
            type: DataTypes.STRING,
        },
        loai_quyen: {
            type: DataTypes.INTEGER,
        },
        nguoi_nhan_id: {
            type: DataTypes.INTEGER,
        },
        noi_dung: {
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
        modelName: 'thong_bao',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = thongbao;
