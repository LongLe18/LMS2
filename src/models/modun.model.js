const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const modun = sequelize.define(
    'mo_dun',
    {
        mo_dun_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        mo_dun_ma: {
            type: DataTypes.STRING,
        },
        ten_mo_dun: {
            type: DataTypes.STRING,
        },
        linh_vuc: {
            type: DataTypes.STRING,
        },
        mo_ta: {
            type: DataTypes.STRING,
        },
        video_gioi_thieu: {
            type: DataTypes.STRING,
        },
        anh_dai_dien: {
            type: DataTypes.STRING,
        },
        loai_tong_hop: {
            type: DataTypes.BOOLEAN,
        },
        giao_vien_id: {
            type: DataTypes.INTEGER,
        },
        khoa_hoc_id: {
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
        modelName: 'mo_dun',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = modun;
