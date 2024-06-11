const { Evaluate, OnlineCriteria } = require('../models');
const sequelize = require('../utils/db');
const fs = require('fs');
const e = require('cors');
const security = require('../utils/security');
const path = require('path');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');

const getAll = async (req, res) => {
    let de_thi_id = 1;
    let offset = 0;
    let limit = 100;
    if(req.query.offset){
        offset = req.query.offset;
    }
    if(req.query.limit){
        limit = req.query.limit;
    }
    if(req.query.de_thi_id){
        de_thi_id = 'danh_gia.de_thi_id=:de_thi_id';
    }
    
    const filter = `WHERE ${de_thi_id}`;
    const sum_index = await sequelize.query(`
        SELECT COUNT(*) AS tong FROM danh_gia ${filter}`,
        {
            replacements: { 
                de_thi_id: parseInt(req.query.de_thi_id),
            },
            type: sequelize.QueryTypes.SELECT
        });
    const evaluations = await sequelize.query(
        `
        SELECT danh_gia.*, de_thi.ten_de_thi FROM danh_gia JOIN de_thi ON danh_gia.de_thi_id = de_thi.de_thi_id
        ${filter} ORDER BY danh_gia.ngay_tao DESC LIMIT :offset, :limit`,
        {
            replacements: { 
                offset: parseInt(offset),
                limit: parseInt(limit),
                de_thi_id: parseInt(req.query.de_thi_id),
            },
            type: sequelize.QueryTypes.SELECT
        }
    );
    res.status(200).send({
        status: 'success',
        data: evaluations,
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
                message: 'Bạn không có quyền đọc đánh giá này',
            });
        } else {
            const evaluate = await sequelize.query(`
                SELECT danh_gia.*, de_thi.ten_de_thi FROM danh_gia JOIN de_thi 
                ON danh_gia.de_thi_id = de_thi.de_thi_id WHERE danh_gia.danh_gia_id=${req.params.id}`, 
                {type: sequelize.QueryTypes.SELECT});
            res.status(200).send({
                status: 'success',
                data: evaluate[0],
                message: null
            })  
        }
    } catch (error) {
        res.status(401).send({
            status: 'success',
            data: null,
            message: 'Bạn không có quyền đọc đánh giá này ' + error,
        });
    }  
}

const postCreate = async (req, res) => {
    // check nếu đề thi đã có đánh giá của phần thi đó thì không thể tạo mới

    const check = await Evaluate.findOne({
        where: {
            de_thi_id: req.body.de_thi_id,
            phan_thi: req.body.phan_thi,
        }
    });
    if(check) { // Đã có phần thi này của đề thi
        // nếu khoảng bắt đầu và kết thúc khác thì cho phép tạo mới
        if(check.cau_bat_dau !== req.body.cau_bat_dau && check.cau_ket_thuc !== req.body.cau_ket_thuc){
            const danh_gia = await Evaluate.create({
                ...req.body,
            })
            res.status(200).send({
                status: 'success',
                data: danh_gia,
                message: 'Tạo mới thành công'
            })
            return;
        }
        else {
            res.status(400).send({
                status: 'error',
                data: null,
                message: 'Đề thi đã có đánh giá của phần thi này',
            });
            return;
        }
    } 

    const danh_gia = await Evaluate.create({
        ...req.body,
    })
    res.status(200).send({
        status: 'success',
        data: danh_gia,
        message: 'Tạo mới thành công'
    })
}

const putUpdate = async (req, res) => {
    // check nếu đề thi đã có đánh giá của phần thi đó thì không thể tạo mới

    const check = await Evaluate.findOne({
        where: {
            de_thi_id: req.body.de_thi_id,
            phan_thi: req.body.phan_thi,
        }
    });
    if(check) {
        // Nếu câu bắt đầu hoặc câu kết thúc khác thì cho phép update
        if(check.cau_bat_dau !== req.body.cau_bat_dau || check.cau_ket_thuc !== req.body.cau_ket_thuc){
            await Evaluate.update({
                ...req.body,
            },{
                where:{
                    danh_gia_id: req.params.id,
                }
            })
            res.status(200).send({
                status: 'success',
                data: null,
                message: 'Cập nhật thành công'
            })
            return;
        } else {
            res.status(400).send({
                status: 'error',
                data: null,
                message: 'Đề thi đã có đánh giá của phần thi này',
            });
            return;
        }
    } 

    await Evaluate.update({
        ...req.body,
    },{
        where:{
            danh_gia_id: req.params.id,
        }
    })
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'Cập nhật thành công'
    })
}

const deleteById = async (req, res) => {
    await Evaluate.destroy({
        where: {
            danh_gia_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'Xóa thành công',
    });
    
}

const download = async (req, res) => {
    // Load the docx file as binary content
    const content = fs.readFileSync(path.resolve(__dirname, '../public','formMau.doc'), 'binary');
    
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip);

    // Insert data into the document
    const data = {
        X1: 'X1/15 or X1/10',
        X2: 'X2/5 or X2/4',
        X3: 'X3/3 or X3/2',
    };

    doc.setData(data);

    try {
        // Render the document
        doc.render();
    } catch (error) {
        console.error(JSON.stringify({ error: error }, null, 2));
        throw error;
    }

    const buf = doc.getZip().generate({ type: 'nodebuffer' });

    const filePath = path.join(__dirname, '../public', 'formMau.docx');
    fs.writeFileSync(filePath, buf);

    res.download(filePath, 'output.docx', (err) => {
        if (err) {
            console.error('File download error:', err);
        }
    });
}

module.exports = {
    getAll,
    getById,
    postCreate,
    putUpdate,
    deleteById,
    download,
}
