const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const dapandachon = sequelize.define(
    'dap_an_da_chon',
    {
        dadc_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ket_qua_chon: {
            type: DataTypes.STRING,
        },
        noi_dung_tra_loi: {
            type: DataTypes.STRING,
        },
        ket_qua: {
            type: DataTypes.BOOLEAN,
        },
        dthv_id: {
            type: DataTypes.INTEGER,
        },
        cau_hoi_id: {
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
        modelName: 'dap_an_da_chon',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = dapandachon;
