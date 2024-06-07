const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const binhluan = sequelize.define(
    'binh_luan',
    {
        binh_luan_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        noi_dung: {
            type: DataTypes.STRING,
        },
        anh_dinh_kem: {
            type: DataTypes.BOOLEAN,
        },
        khoa_hoc_id: {
            type: DataTypes.INTEGER,
        },
        mo_dun_id: {
            type: DataTypes.INTEGER,
        },
        loai_hoi_dap: {
            type: DataTypes.INTEGER,
        },
        lien_ket_id: {
            type: DataTypes.STRING,
        },
        hoc_vien_id: {
            type: DataTypes.INTEGER,
        },
        tra_loi: {
            type: DataTypes.BOOLEAN,
        },
        phu_trach_id: {
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
        modelName: 'binh_luan',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = binhluan;
