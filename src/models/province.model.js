const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const tinhthanhpho = sequelize.define(
    'tinh_thanhpho',
    {
        ttp_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ten: {
            type: DataTypes.STRING,
        },
    },
    {
        sequelize,
        modelName: 'tinh_thanhpho',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = tinhthanhpho;
