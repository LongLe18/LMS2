const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const cauhoidethi = sequelize.define(
    'cau_hoi_de_thi',
    {
        chdt_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        modelName: 'cau_hoi_de_thi',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = cauhoidethi;
