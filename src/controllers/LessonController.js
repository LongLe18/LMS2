const { Lesson, Thematic, Modun } = require('../models/');
const sequelize = require('../utils/db');
const { Op } = require('sequelize');
const fs = require('fs');
const security = require('../utils/security');

//[GET] lesson?id
// const getAllv2 = async (req, res) => {
//     const lessons = await sequelize.query(
//         `
//         SELECT bai_giang.*, chuyen_de.ten_chuyen_de FROM bai_giang LEFT JOIN chuyen_de 
//         ON bai_giang.chuyen_de_id=chuyen_de.chuyen_de_id ORDER BY bai_giang.chuyen_de_id ASC`,
//         { type: sequelize.QueryTypes.SELECT }
//     );
//     const rows = [];
//     let videos = [];
//     let pdf = [];
//     let id = 0;
//     let ten_chuyen_de;
//     if (lessons) {
//         for (let lesson of lessons) {
//             if (lesson.chuyen_de_id !== id && id !== 0) {
//                 rows.push({
//                     chuyen_de_id: id,
//                     ten_chuyen_de: ten_chuyen_de,
//                     videos: videos,
//                     pdf: pdf,
//                 });
//                 pdf = [];
//                 videos = [];
//             }
//             if (lesson.loai_bai_giang === 'pdf') {
//                 pdf.push(lesson);
//             } else {
//                 videos.push(lesson);
//             }
//             id = lesson.chuyen_de_id;
//             ten_chuyen_de = lesson.ten_chuyen_de;
//         }
//         rows.push({
//             chuyen_de_id: id,
//             ten_chuyen_de: ten_chuyen_de,
//             videos: videos,
//             pdf: pdf,
//         });
//     }
//     res.status(200).send({
//         status: 'success',
//         data: rows,
//         message: null,
//     });
// };

const getByIDThematic= async (req, res) => {
    const count=await sequelize.query(`
        SELECT COUNT(DISTINCT mo_dun.khoa_hoc_id) AS tong FROM chuyen_de JOIN mo_dun ON 
        chuyen_de.mo_dun_id=mo_dun.mo_dun_id JOIN khoa_hoc_hoc_vien ON mo_dun.khoa_hoc_id=khoa_hoc_hoc_vien.khoa_hoc_id
        WHERE khoa_hoc_hoc_vien.hoc_vien_id=:hoc_vien_id AND chuyen_de.chuyen_de_id=:chuyen_de_id`,
        {
            replacements: {
                hoc_vien_id: parseInt(req.userId),
                chuyen_de_id: parseInt(req.params.id)
            },
            type: sequelize.QueryTypes.SELECT
        });
    if(count[0].tong==0){
        res.status(401).send({
            status: 'error',
            data: null,
            message: 'Bạn chưa mua khóa học',
        });
    }else{
        const lessons= await sequelize.query(`
        SELECT bai_giang.* FROM bai_giang WHERE trang_thai=true
        AND loai_bai_giang=:loai_bai_giang
        AND chuyen_de_id=:chuyen_de_id`, 
        {
            replacements:{
                loai_bai_giang: decodeURI(req.query.loai_bai_giang),
                chuyen_de_id: parseInt(req.params.id)
            },
            type: sequelize.QueryTypes.SELECT
        });
        res.status(200).send({
            status: 'success',
            data: lessons,
            message: null,
        });
    }
}

const getByFilter = async (req, res) => {
    let search = 1;
    let ngay_tao=1;
    let trang_thai=1;
    let chuyen_de_id=1;
    let mo_dun_id=1;
    let khoa_hoc_id=1;
    let offset = 0;
    let limit =100;
    if(req.query.offset){
        offset=req.query.offset;
    }
    if(req.query.limit){
        limit=req.query.limit;
    }
    if (req.query.search) {
        search = 'bai_giang.ten_bai_giang LIKE :search';
    }
    if (req.query.ngay_bat_dau&&req.query.ngay_ket_thuc) {
        ngay_tao = 'bai_giang.ngay_tao BETWEEN :ngay_bat_dau AND :ngay_ket_thuc';
    }
    if (req.query.trang_thai) {
        trang_thai='bai_giang.trang_thai=:trang_thai';
    }
    if (req.query.chuyen_de_id) {
        chuyen_de_id='bai_giang.chuyen_de_id=:chuyen_de_id';
    }
    if (req.query.mo_dun_id) {
        mo_dun_id='chuyen_de.mo_dun_id=:mo_dun_id';
    }
    if (req.query.khoa_hoc_id) {
        khoa_hoc_id='mo_dun.khoa_hoc_id=:khoa_hoc_id';
    }
    const filter=`WHERE ${search} AND ${ngay_tao} AND ${trang_thai} AND ${chuyen_de_id} AND ${mo_dun_id} AND ${khoa_hoc_id}`;
    const lessons= await sequelize.query(`
        SELECT bai_giang.*, chuyen_de.ten_chuyen_de FROM bai_giang JOIN chuyen_de ON bai_giang.chuyen_de_id=chuyen_de.chuyen_de_id 
        JOIN mo_dun ON chuyen_de.mo_dun_id=mo_dun.mo_dun_id ${filter} ORDER BY bai_giang.ngay_tao DESC LIMIT :offset, :limit`,
        {
            replacements: {
                trang_thai: parseInt(req.query.trang_thai),
                search: `%${decodeURI(req.query.search)}%`,
                ngay_bat_dau: req.query.ngay_bat_dau,
                ngay_ket_thuc: req.query.ngay_ket_thuc,
                chuyen_de_id: parseInt(req.query.chuyen_de_id),
                mo_dun_id: parseInt(req.query.mo_dun_id),
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
                limit: parseInt(limit),
                offset: parseInt(offset)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: lessons,
        message: null,
    });
};

//[GET] lesson?id
const getAll = async (req, res) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            res.status(401).send({
                status: 'fail',
                data: null,
                message: 'Bạn không có quyền đọc thông tin này',
            });
        } else {
            const decodedToken = security.verifyToken(token);
            const count=await sequelize.query(`
                SELECT COUNT(DISTINCT mo_dun.khoa_hoc_id) AS tong FROM bai_giang JOIN chuyen_de ON bai_giang.chuyen_de_id=chuyen_de.chuyen_de_id JOIN mo_dun ON 
                chuyen_de.mo_dun_id=mo_dun.mo_dun_id JOIN khoa_hoc_hoc_vien ON mo_dun.khoa_hoc_id=khoa_hoc_hoc_vien.khoa_hoc_id
                WHERE khoa_hoc_hoc_vien.hoc_vien_id=:hoc_vien_id AND khoa_hoc_hoc_vien.khoa_hoc_id=:khoa_hoc_id`,
                {
                    replacements: {
                        hoc_vien_id: parseInt(decodedToken.userId),
                        khoa_hoc_id: parseInt(req.query.khoa_hoc_id)
                    },
                    type: sequelize.QueryTypes.SELECT
                });
            if (count[0].tong == 0){
                const firstThematic = await sequelize.query(`
                select chuyen_de.chuyen_de_id from chuyen_de JOIN mo_dun ON chuyen_de.mo_dun_id = mo_dun.mo_dun_id
                    JOIN khoa_hoc ON khoa_hoc.khoa_hoc_id = mo_dun.khoa_hoc_id where khoa_hoc.khoa_hoc_id=:khoa_hoc_id
                    and mo_dun.mo_dun_id=:mo_dun_id LIMIT 1`,
                {
                    replacements: {
                        khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
                        mo_dun_id: parseInt(req.query.mo_dun_id)
                    },
                    type: sequelize.QueryTypes.SELECT
                });
                if (firstThematic.length > 0 && parseInt(req.query.id) === firstThematic[0].chuyen_de_id) {
                    const filter = {};
                    if (req.query.id) {
                        filter.chuyen_de_id = req.query.id;
                        filter.trang_thai = true;
                    }
                    const video = await Lesson.findAll({
                        where: {
                            ...filter,
                            loai_bai_giang: 'video',
                        },
                        order: [
                            ['ten_bai_giang', 'ASC']
                        ]
                    });
                    const pdf = await Lesson.findOne({
                        where: {
                            ...filter,
                            loai_bai_giang: 'pdf',
                        },
                    });
                    res.status(200).send({
                        status: 'success',
                        data: {
                            video: video,
                            pdf: pdf,
                        },
                        message: null,
                    });       
                } else {
                    res.status(402).send({
                        status: 'fail',
                        data: null,
                        message: 'Bạn chưa mua khóa học',
                    });
                }
            } else{
                const filter = {};
                if (req.query.id) {
                    filter.chuyen_de_id = req.query.id;
                    filter.trang_thai = true;
                }
                const video = await Lesson.findAll({
                    where: {
                        ...filter,
                        loai_bai_giang: 'video',
                    },
                    order: [
                        ['ten_bai_giang', 'ASC']
                    ]
                });
                const pdf = await Lesson.findOne({
                    where: {
                        ...filter,
                        loai_bai_giang: 'pdf',
                    },
                });
                res.status(200).send({
                    status: 'success',
                    data: {
                        video: video,
                        pdf: pdf,
                    },
                    message: null,
                });       
            }
        }
    } catch (error) {
        res.status(401).send({
            status: 'fail',
            data: null,
            message: 'Bạn không có quyền đọc thông tin này ' + error,
        });
    }  
};

//[GET] lesson/:id
const getById = async (req, res) => {
    if(req.role==2){
        const lesson = await Lesson.findOne({
            where: {
                bai_giang_id: req.params.id,
            },
        });
        res.status(200).send({
            status: 'success',
            data: lesson,
            message: null,
        });
    }else if(req.role==0){
        const count=await sequelize.query(`
        SELECT COUNT(DISTINCT mo_dun.khoa_hoc_id) AS tong FROM bai_giang JOIN chuyen_de ON bai_giang.chuyen_de_id=chuyen_de.chuyen_de_id JOIN mo_dun ON 
        chuyen_de.mo_dun_id=mo_dun.mo_dun_id JOIN khoa_hoc_hoc_vien ON mo_dun.khoa_hoc_id=khoa_hoc_hoc_vien.khoa_hoc_id
        WHERE khoa_hoc_hoc_vien.hoc_vien_id=:hoc_vien_id AND bai_giang.bai_giang_id=:bai_giang_id`,
        {
            replacements: {
                hoc_vien_id: parseInt(req.userId),
                bai_giang_id: parseInt(req.params.id)
            },
            type: sequelize.QueryTypes.SELECT
        });
        if(count[0].tong==0){
            res.status(401).send({
                status: 'error',
                data: null,
                message: 'Bạn chưa mua khóa học',
            });
        }else{
            const lesson = await Lesson.findOne({
                where: {
                    bai_giang_id: req.params.id,
                },
            });
            res.status(200).send({
                status: 'success',
                data: lesson,
                message: null,
            });
        }
    }else{
        res.status(404).send({
            status: 'error',
            data: null,
            message: null,
        });
    }
};

//[POST] lesson/create
const postCreate = async (req, res) => {
    if (req.body.loai_bai_giang === 'pdf') {
        await Lesson.update(
            {
                trang_thai: false,
            },
            {
                where: {
                    chuyen_de_id: req.body.chuyen_de_id,
                    loai_bai_giang: 'pdf',
                },
            }
        );
    }
    const lesson = await Lesson.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: lesson,
        message: null,
    });
};

//[POST] lesson/create
const uploadVideos = async (req, res) => {
    let lessons = [];
    for (let file of req.files) {
        lessons.push({
            ten_bai_giang: file.originalname.slice(
                0,
                file.originalname.lastIndexOf('.')
            ),
            loai_bai_giang: 'video',
            link_bai_giang: `/video/${file.filename}`,
            chuyen_de_id: req.body.chuyen_de_id,
        });
    }
    lessons = await Lesson.bulkCreate(lessons);
    res.status(200).send({
        status: 'success',
        data: lessons,
        message: null,
    });
};

//[GET] lesson/:id
const getUpdate = async (req, res) => {
    let lesson = await sequelize.query(`
        SELECT bai_giang.*, chuyen_de.mo_dun_id, mo_dun.khoa_hoc_id FROM bai_giang LEFT JOIN chuyen_de ON
        bai_giang.chuyen_de_id=chuyen_de.chuyen_de_id LEFT JOIN mo_dun ON mo_dun.mo_dun_id=chuyen_de.mo_dun_id 
        WHERE bai_giang.bai_giang_id=:bai_giang_id`,
        {
            replacements: {
                bai_giang_id: req.params.id
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: lesson[0],
        message: null,
    });
};

//[PUT] lesson/:id/edit
const putUpdate = async (req, res) => {
    if (req.body.trang_thai == 'true' && req.body.loai_bai_giang == 'pdf') {
        await Lesson.update(
            {
                trang_thai: false,
            },
            {
                where: {
                    chuyen_de_id: req.body.chuyen_de_id,
                    loai_bai_giang: 'pdf',
                },
            }
        );
    }
    if (req.file) {
        const lesson = await Lesson.findOne({
            where: {
                bai_giang_id: req.params.id,
            },
            attributes: ['link_bai_giang'],
        });
        if (
            lesson.link_bai_giang &&
            fs.existsSync(`src/public${lesson.link_bai_giang}`)
        )
            fs.unlinkSync(`src/public${lesson.link_bai_giang}`);
    }
    await Lesson.update(
        {
            ...req.body,
        },
        {
            where: {
                bai_giang_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[DELETE] lesson/:id
const deleteById = async (req, res) => {
    await Lesson.update(
        {
            trang_thai: false,
        },
        {
            where: {
                bai_giang_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[PATCH] lesson/:id/restore
const restore = async (req, res) => {
    await Lesson.update(
        {
            trang_thai: true,
        },
        {
            where: {
                bai_giang_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[DELETE] lesson/:id/force
const forceDelete = async (req, res) => {
    const lesson = await Lesson.findOne({
        where: {
            bai_giang_id: req.params.id,
        },
        attributes: ['link_bai_giang'],
    });
    if (
        lesson.link_bai_giang &&
        fs.existsSync(`src/public${lesson.link_bai_giang}`)
    )
        fs.unlinkSync(`src/public${lesson.link_bai_giang}`);
    await Lesson.destroy({
        where: {
            bai_giang_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    //getAllv2,
    getAll,
    getById,
    getByFilter,
    postCreate,
    uploadVideos,
    getByIDThematic,
    getUpdate,
    putUpdate,
    deleteById,
    restore,
    forceDelete,
};
