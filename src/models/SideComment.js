const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const binhluanphu = sequelize.define(
    'binh_luan_phu',
    {
        binh_luan_phu_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nguoi_tra_loi_id: {
            type: DataTypes.INTEGER,
        },
        loai_quyen: {
            type: DataTypes.INTEGER,
        },
        noi_dung: {
            type: DataTypes.STRING,
        },
        anh_dinh_kem: {
            type: DataTypes.STRING,
        },
        binh_luan_id:{
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
        modelName: 'binh_luan_phu',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = binhluanphu;
