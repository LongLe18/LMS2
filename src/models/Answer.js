const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const dapan = sequelize.define(
    'dap_an',
    {
        dap_an_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        noi_dung_dap_an: {
            type: DataTypes.STRING,
        },
        dap_an_dung: {
            type: DataTypes.BOOLEAN,
        },
        cau_hoi_id: {
            type: DataTypes.INTEGER,
        },
        de_thi_id: {
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
        modelName: 'dap_an',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = dapan;
