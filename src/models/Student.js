const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const hocvien = sequelize.define(
    'hoc_vien',
    {
        hoc_vien_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        hoc_vien_ma: {
            type: DataTypes.STRING,
        },
        ho_ten: {
            type: DataTypes.STRING,
        },
        gioi_tinh: {
            type: DataTypes.STRING,
        },
        dia_chi: {
            type: DataTypes.STRING,
        },
        ttp_id: {
            type: DataTypes.INTEGER,
        },
        truong_hoc: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        sdt: {
            type: DataTypes.STRING,
        },
        ten_dang_nhap: {
            type: DataTypes.STRING,
        },
        mat_khau: {
            type: DataTypes.STRING,
        },
        ngay_sinh: {
            type: DataTypes.DATE,
        },
        anh_dai_dien: {
            type: DataTypes.STRING,
        },
        gioi_thieu: {
            type: DataTypes.STRING,
        },
        trang_thai: {
            type: DataTypes.BOOLEAN,
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
        user_id: {
            type: DataTypes.INTEGER,
        },
        university_id: {
            type: DataTypes.INTEGER,
        },
        university_class: {
            type: DataTypes.STRING,
        },
        university_unit: {
            type: DataTypes.STRING,
        },
        class: {
            type: DataTypes.STRING,
        },
        high_school_id: {
            type: DataTypes.INTEGER,
        },
        namehightschool: {
            type: DataTypes.STRING,
        },
        juniorschool: {
            type: DataTypes.STRING,
        },
        search_name: {
            type: DataTypes.STRING,
        },
        search_phone: {
            type: DataTypes.STRING,
        },
        search_address: {
            type: DataTypes.STRING,
        },
        search_email: {
            type: DataTypes.STRING,
        },
        search_permission: {
            type: DataTypes.STRING,
        },
        examforms: {
            type: DataTypes.STRING,
        },
        placeexam_id: {
            type: DataTypes.INTEGER,
        },
        content_bank: {
            type: DataTypes.STRING,
        },
        title_people: {
            type: DataTypes.STRING,
        },
        id_type: {
            type: DataTypes.STRING,
        },
        id_number: {
            type: DataTypes.STRING,
        },
        id_deadline: {
            type: DataTypes.STRING,
        },
        id_issued: {
            type: DataTypes.STRING,
        },
        years_studying_english: {
            type: DataTypes.STRING,
        },
        level_education: {
            type: DataTypes.STRING,
        },
        occupation_sector: {
            type: DataTypes.STRING,
        },
        occupation_level: {
            type: DataTypes.STRING,
        },
        reason_for_taking_test: {
            type: DataTypes.STRING,
        },
        destination_country: {
            type: DataTypes.STRING,
        },
        lang: {
            type: DataTypes.STRING,
        },
        voted: {
            type: DataTypes.INTEGER,
        },
        char_code: {
            type: DataTypes.STRING,
        },
        stt: {
            type: DataTypes.INTEGER,
        },
    },
    {
        sequelize,
        modelName: 'hoc_vien',
        freezeTableName: true,
        timestamps: false,
    }
);

module.exports = hocvien;
