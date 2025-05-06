const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const lienhe = sequelize.define(
    'lien_he',
    {
        lien_he_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        mo_ta: {
            type: DataTypes.STRING,
        },
        link_lien_ket: {
            type: DataTypes.STRING,
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
        modelName: 'lien_he',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = lienhe;
