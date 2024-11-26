const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const cauhoi = sequelize.define(
    'cau_hoi',
    {
        cau_hoi_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        noi_dung: {
            type: DataTypes.STRING,
        },
        // 0: tự luận, 1: trắc nghiệm, 2: trắc nghiệm nhiều lựa chọn, 3: trắc nghiệm nhiều lựa chọn đúng sai, 4: trắc nghiệm đúng sai, 5: tự luận nhiều vị trí, 6: kéo thả
        loai_cau_hoi: {
            type: DataTypes.TINYINT,
        },
        diem: {
            type: DataTypes.DECIMAL(10, 2),
        },
        loi_giai: {
            type: DataTypes.STRING,
        },
        cot_tren_hang: {
            type: DataTypes.INTEGER,
        },
        trich_doan_id: {
            type: DataTypes.INTEGER,
        },
        mdch_id: {
            type: DataTypes.INTEGER,
        },
        chuyen_de_id: {
            type: DataTypes.INTEGER,
        },
        mo_dun_id: {
            type: DataTypes.INTEGER,
        },
        de_thi_id: {
            type: DataTypes.INTEGER,
        },
        kct_id: {
            type: DataTypes.INTEGER,
        },
        chuyen_nganh_id: {
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
        modelName: 'cau_hoi',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = cauhoi;
