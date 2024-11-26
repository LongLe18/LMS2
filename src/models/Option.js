const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const luachon = sequelize.define(
    'lua_chon',
    {
        lua_chon_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        noi_dung: {
            type: DataTypes.STRING,
        },
        cau_hoi_id: {
            type: DataTypes.INTEGER,
        },
        ngay_tao: {
            type: DataTypes.DATE,
        },
        ngay_sua: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        modelName: 'lua_chon',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = luachon;
