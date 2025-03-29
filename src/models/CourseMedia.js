const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const khoahocteptin = sequelize.define(
    'khoa_hoc_tep_tin',
    {
        khtt_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        khoa_hoc_id: {
            type: DataTypes.INTEGER,
        },
        tep_tin_id: {
            type: DataTypes.INTEGER,
        },
        tep_tin_cha_id: {
            type: DataTypes.INTEGER,
        },
    },
    {
        sequelize,
        modelName: 'khoa_hoc_tep_tin',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = khoahocteptin;
