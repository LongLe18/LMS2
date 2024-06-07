const {Comment, Notification}=require('../models');
const sequelize = require('../utils/db');
const fs = require('fs');
const e = require('cors');
const security = require('../utils/security');

const getAll=async (req, res) => {
    let khoa_hoc_id=1;
    let mo_dun_id=1;
    let lien_ket_id=1;
    let loai_hoi_dap=1;
    let offset=0;
    let limit=100;
    if(req.query.offset){
        offset=req.query.offset;
    }
    if(req.query.limit){
        limit=req.query.limit;
    }
    if(req.query.khoa_hoc_id){
        khoa_hoc_id= 'binh_luan.khoa_hoc_id=:khoa_hoc_id';
    }
    if(req.query.mo_dun_id){
        mo_dun_id='binh_luan.mo_dun_id=:mo_dun_id';
    }
    if(req.query.lien_ket_id){
      lien_ket_id='binh_luan.lien_ket_id=:lien_ket_id';
  }
    if(req.query.loai_hoi_dap){
        loai_hoi_dap='binh_luan.loai_hoi_dap=:loai_hoi_dap';
    }
    const filter=`WHERE ${khoa_hoc_id} AND ${mo_dun_id} AND ${loai_hoi_dap} AND ${lien_ket_id}`;
    const sum_index=await sequelize.query(`
        SELECT COUNT(*) AS tong FROM binh_luan ${filter}`,
        {
            replacements: { 
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
                mo_dun_id: parseInt(req.query.mo_dun_id),
                loai_hoi_dap: parseInt(req.query.loai_hoi_dap),
                lien_ket_id: parseInt(req.query.lien_ket_id)
            },
            type: sequelize.QueryTypes.SELECT
        });
    const comments = await sequelize.query(
        `
        SELECT binh_luan.binh_luan_id, binh_luan.noi_dung, binh_luan.anh_dinh_kem, binh_luan.khoa_hoc_id,
        binh_luan.mo_dun_id, binh_luan.loai_hoi_dap, binh_luan.lien_ket_id, binh_luan.hoc_vien_id,
        binh_luan.tra_loi, binh_luan.phu_trach_id, binh_luan.ngay_tao, khoa_hoc.ten_khoa_hoc, mo_dun.ten_mo_dun, 
        hoc_vien.anh_dai_dien, hoc_vien.ho_ten AS ten_hoc_vien, (SELECT COUNT(binh_luan_phu.binh_luan_phu_id) 
        FROM binh_luan_phu WHERE binh_luan_phu.binh_luan_id=binh_luan.binh_luan_id) AS so_binh_luan_phu,
        giao_vien.ho_ten AS ten_giao_vien FROM binh_luan JOIN hoc_vien ON hoc_vien.hoc_vien_id=binh_luan.hoc_vien_id 
        LEFT JOIN khoa_hoc ON khoa_hoc.khoa_hoc_id=binh_luan.khoa_hoc_id LEFT JOIN mo_dun ON mo_dun.mo_dun_id=binh_luan.mo_dun_id 
        LEFT JOIN giao_vien ON giao_vien.giao_vien_id=binh_luan.phu_trach_id ${filter} 
        ORDER BY binh_luan.ngay_tao DESC LIMIT :offset, :limit`,
        {
            replacements: { 
                offset: parseInt(offset),
                limit: parseInt(limit),
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
                mo_dun_id: parseInt(req.query.mo_dun_id),
                loai_hoi_dap: parseInt(req.query.loai_hoi_dap),
                lien_ket_id: parseInt(req.query.lien_ket_id)
            },
            type: sequelize.QueryTypes.SELECT
        }
    );
    res.status(200).send({
        status: 'success',
        data: comments,
        count: sum_index[0].tong,
        message: null
    })
}


const getById = async (req, res) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            res.status(401).send({
                status: 'success',
                data: null,
                message: 'Bạn không có quyền đọc bình luận này',
            });
        } else {
            const decodedToken = security.verifyToken(token);
            if (decodedToken.role === 2 || decodedToken.role === 1) { // nhân viên
                const comment=await sequelize.query(`
                    SELECT binh_luan.*, hoc_vien.ho_ten, hoc_vien.anh_dai_dien FROM binh_luan JOIN hoc_vien 
                    ON binh_luan.hoc_vien_id=hoc_vien.hoc_vien_id WHERE binh_luan.binh_luan_id=${req.params.id}`, 
                    {type: sequelize.QueryTypes.SELECT});
                res.status(200).send({
                    status: 'success',
                    data: comment[0],
                    message: null
                })  
            } else if (decodedToken.role === 0) { // học viên
                const comment=await sequelize.query(`
                    SELECT binh_luan.*, hoc_vien.ho_ten, hoc_vien.anh_dai_dien FROM binh_luan JOIN hoc_vien 
                    ON binh_luan.hoc_vien_id=hoc_vien.hoc_vien_id WHERE binh_luan.binh_luan_id=${req.params.id} AND binh_luan.hoc_vien_id=${decodedToken.userId}`, 
                    {type: sequelize.QueryTypes.SELECT});
                if (comment[0] === undefined) {
                    res.status(403).send({
                        status: 'failed',
                        data: comment[0],
                        message: 'Bạn không có quyền đọc bình luận này'
                    }) 
                } else {
                    res.status(200).send({
                        status: 'success',
                        data: comment[0],
                        message: null
                    })  
                }   
            }
            
        }
    } catch (error) {
        res.status(401).send({
            status: 'success',
            data: null,
            message: 'Bạn không có quyền đọc bình luận này ' + error,
        });
    }  
}

const postCreate = async (req, res) => {
    if(req.role!=0){
        res.status(404).send({
            status: 'error',
            data: null,
            message: null
        })
    }
    if(req.body.loai_hoi_dap==0){
        const modun= await sequelize.query(`
            SELECT giao_vien.giao_vien_id FROM mo_dun JOIN giao_vien 
            ON mo_dun.giao_vien_id = giao_vien.giao_vien_id
            WHERE mo_dun.mo_dun_id=${req.body.mo_dun_id}`, 
            {type: sequelize.QueryTypes.SELECT});
        if(modun.length>0){
            req.body.phu_trach_id=modun[0].giao_vien_id
        }
    }
    else if(req.body.loai_hoi_dap==1){
        const exam=await sequelize.query(`
            SELECT giao_vien.giao_vien_id FROM giao_vien JOIN mo_dun ON giao_vien.giao_vien_id=mo_dun.giao_vien_id 
            JOIN de_thi ON mo_dun.mo_dun_id=de_thi.de_thi_id WHERE de_thi.de_thi_id=${req.body.lien_ket_id.split('/')[0]}`,
            {type: sequelize.QueryTypes.SELECT});
        if(exam.length>0){
            req.body.phu_trach_id=exam[0].giao_vien_id;
        }
    }
    if(req.body.anh_dinh_kem){
        let link=[];
        for(const file of req.files){
            link.push(`/image/${file.filename}`);
        }
        req.body.anh_dinh_kem=`${link}`;
    }
    const comment = await Comment.create({
        ...req.body,
        hoc_vien_id: req.userId
    })
    res.status(200).send({
        status: 'success',
        data: comment,
        message: null
    })
}

const putUpdate = async (req, res) => {
    if(req.body.anh_dinh_kem){
        let link=[];
        for(const file of req.files){
            link.push(`/image/${file.filename}`);
        }
        req.body.anh_dinh_kem=`${link}`;
        const comment = await Comment.findOne({
            where:{
                binh_luan_id: req.params.id
            },
            raw: true
        })
        if(comment.anh_dinh_kem){
            for(const anh_dinh_kem of comment.anh_dinh_kem.split(',')){
                if (fs.existsSync(`src/public${anh_dinh_kem}`))
                    fs.unlinkSync(`src/public${anh_dinh_kem}`);
            }
        }
    }
    await Comment.update({
        ...req.body,
    },{
        where:{
            binh_luan_id: req.params.id,
        }
    })
    res.status(200).send({
        status: 'success',
        data: null,
        message: null
    })
}

const deleteById = async (req, res) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            res.status(401).send({
                status: 'success',
                data: null,
                message: 'Bạn không có quyền xóa bình luận này',
            });
        } else {
            const decodedToken = security.verifyToken(token);
            const comment = await Comment.findOne({
                where:{
                    binh_luan_id: req.params.id
                },
            })
            if(comment.anh_dinh_kem){
                for(const anh_dinh_kem of comment.anh_dinh_kem.split(',')){
                    if (fs.existsSync(`src/public${anh_dinh_kem}`))
                        fs.unlinkSync(`src/public${anh_dinh_kem}`);
                }
            }
            if (decodedToken.role === 0)  { // hoc vien 
                await Comment.destroy({
                    where:{
                        binh_luan_id: req.params.id,
                        hoc_vien_id: decodedToken.userId
                    }
                })
            } else {
                await Comment.destroy({ // giao viên và nhân viên
                    where:{
                        binh_luan_id: req.params.id,
                    }
                })
            }
            
            await Notification.destroy({
                where:{
                    loai_thong_bao: 0,
                    lien_ket_id: req.params.id
                }
            })
            await sequelize.query(`
                DELETE FROM thong_bao WHERE thong_bao.loai_thong_bao=1 AND thong_bao.lien_ket_id=
                (SELECT binh_luan_phu.binh_luan_phu_id FROM binh_luan_phu WHERE binh_luan_phu.binh_luan_id=${req.params.id})`, 
            {type: sequelize.QueryTypes.DELETE});
            res.status(200).send({
                status: 'success',
                data: null,
                message: null
            })
        }
    } catch (error) {
        res.status(401).send({
            status: 'success',
            data: null,
            message: 'Bạn không có quyền xóa bình luận này ' + error,
        });
    }  
}

module.exports = {
    getAll,
    getById,
    postCreate,
    putUpdate,
    deleteById
}