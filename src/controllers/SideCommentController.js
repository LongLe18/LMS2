const {SideComment, Student, Staff, Notification, Teacher}=require('../models');
const fs = require('fs');
const sequelize = require('../utils/db');

const getAll = async (req, res) => {
    let binh_luan_id=1;
    if(req.query.binh_luan_id){
        binh_luan_id=`binh_luan_phu.binh_luan_id=:binh_luan_id`;
    }
    let filter=`AND ${binh_luan_id}`;
    const sideComments=await sequelize.query(`
        SELECT * FROM ((SELECT binh_luan_phu.*, hoc_vien.ho_ten, hoc_vien.anh_dai_dien FROM binh_luan_phu JOIN 
        hoc_vien ON binh_luan_phu.nguoi_tra_loi_id=hoc_vien.hoc_vien_id WHERE loai_quyen=0 ${filter})
        UNION (SELECT binh_luan_phu.*, giao_vien.ho_ten, giao_vien.anh_dai_dien FROM binh_luan_phu JOIN 
            giao_vien ON binh_luan_phu.nguoi_tra_loi_id=giao_vien.giao_vien_id WHERE loai_quyen=1 ${filter}) UNION
        (SELECT binh_luan_phu.*, nhan_vien.ho_ten, nhan_vien.anh_dai_dien FROM binh_luan_phu JOIN 
            nhan_vien ON binh_luan_phu.nguoi_tra_loi_id=nhan_vien.nhan_vien_id WHERE loai_quyen=2 ${filter})) AS binh_luan_phu LIMIT 100`,
        {
            replacements:{
                binh_luan_id: parseInt(req.query.binh_luan_id)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: sideComments,
        message: null,
    })
}

const getById = async (req, res) => {
    let user;
    let sideComment= await SideComment.findOne({
        where: {
            binh_luan_phu_id: req.params.id
        },
    })
    if(sideComment.loai_quyen==0){
        user=await Student.findOne({
            where: {
                hoc_vien_id: sideComment.nguoi_tra_loi_id
            },
            raw: true
        })
    }else if(sideComment.loai_quyen==1){
        user=await Teacher.findOne({
            where: {
                giao_vien_id: sideComment.nguoi_tra_loi_id
            },
            raw: true
        })
    }else if(sideComment.loai_quyen==2){
        user=await Staff.findOne({
            where: {
                nhan_vien_id: sideComment.nguoi_tra_loi_id
            },
            raw: true
        })
    }
    sideComment.ho_ten=user.ho_ten;
    sideComment.anh_dai_dien=user.anh_dai_dien;
    res.status(200).send({
        status: 'success',
        data: sideComment,
        message: null,
    })
}

const postCreate = async (req, res) => {
    if(req.role==1||req.role==2){
        req.body.tra_loi=1;
    }
    if(req.body.anh_dinh_kem){
        let link=[];
        for(const file of req.files){
            link.push(`/image/${file.filename}`);
        }
        req.body.anh_dinh_kem=`${link}`;
    }
    const sideComment = await SideComment.create({
        ...req.body,
        loai_quyen: req.role,
        nguoi_tra_loi_id: req.userId
    });
    res.status(200).send({
        status: 'success',
        data: sideComment,
        message: null,
    })
}

const putUpdate = async (req, res) => {
    if(req.body.anh_dinh_kem){
        let link=[];
        for(const file of req.files){
            link.push(`/image/${file.filename}`);
        }
        req.body.anh_dinh_kem=`${link}`;
        const sideComment = await SideComment.findOne({
            where:{
                binh_luan_phu_id: req.params.id
            },
            raw: true
        })
        if(sideComment.anh_dinh_kem){
            for(const anh_dinh_kem of sideComment.anh_dinh_kem.split(',')){
                if (fs.existsSync(`public${anh_dinh_kem}`))
                    fs.unlinkSync(`public${anh_dinh_kem}`);
            }
        }
    }
    await SideComment.update({
        ...req.body,
    },{
        where:{
            binh_luan_phu_id: req.params.id
        }
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    })
}

const deleteById = async (req, res) => {
    const sideComment = await SideComment.findOne({
        where:{
            binh_luan_phu_id: req.params.id
        },
        raw: true
    })
    if(sideComment.anh_dinh_kem){
        for(const anh_dinh_kem of sideComment.anh_dinh_kem.split(',')){
            if (fs.existsSync(`public${anh_dinh_kem}`))
                fs.unlinkSync(`public${anh_dinh_kem}`);
        }
    }
    await SideComment.destroy({
        where:{
            binh_luan_phu_id: req.params.id,
        }
    })
    await Notification.destroy({
        where:{
            lien_ket_id: req.params.id,
            loai_thong_bao: 1
        }
    })
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    })
}

module.exports ={
    getAll,
    getById,
    postCreate,
    putUpdate,
    deleteById
}