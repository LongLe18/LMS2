const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const bodethiteptin = sequelize.define(
    'bo_de_thi_tep_tin',
    {
        bdttt_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        bo_de_thi_id: {
            type: DataTypes.INTEGER,
        },
        tep_tin_id: {
            type: DataTypes.STRING,
        },
    },
    {
        sequelize,
        modelName: 'bo_de_thi_tep_tin',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = bodethiteptin;
