const fs = require('fs');

const { ExamSet, Media, ExamSetMedia } = require('../models');
const { checkFileType } = require('../middlewares/upload');

const getAll = async (req, res) => {
    const { count, rows } = await ExamSet.findAndCountAll({
        where: {
            ...(req.query.trang_thai && { trang_thai: req.query.trang_thai }),
            ...(req.query.search && {
                [Op.or]: [
                    { ten: { [Op.like]: `%${req.query.search}%` } },
                    { mo_ta: { [Op.like]: `%${req.query.search}%` } },
                ],
            }),
        },
        offset:
            (Number(req.query.pageIndex || 1) - 1) *
            Number(req.query.pageSize || 10),
        limit: Number(req.query.pageSize || 10),
        order: [
            req.query.sortBy
                ? req.query.sortBy.split(',')
                : ['ngay_tao', 'DESC'],
        ],
    });

    res.status(200).send({
        status: 'success',
        data: rows,
        pageIndex: Number(req.query.pageIndex || 1),
        pageSize: Number(req.query.pageSize || 10),
        totalCount: count,
        totalPage: Math.ceil(count / Number(req.query.pageSize || 10)),
        message: null,
    });
};

const getById = async (req, res) => {
    const examSet = await ExamSet.findOne({
        include: [
            {
                model: ExamSetMedia,
                required: true,
                include: [
                    {
                        model: Media,
                        attributes: ['tep_tin_id', 'ten', 'duong_dan'],
                        required: true,
                    },
                ],
            },
        ],
        where: {
            bo_de_thi_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: examSet,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const examSet = await ExamSet.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: examSet,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    if (req.files) {
        const examSet = await ExamSet.findOne({
            where: {
                bo_de_thi_id: req.params.id,
            },
            attributes: ['anh_dai_dien'],
        });
        if (
            req.files['anh_dai_dien'] &&
            examSet.anh_dai_dien &&
            fs.existsSync(`public${examSet.anh_dai_dien}`)
        )
            fs.unlinkSync(`public${examSet.anh_dai_dien}`);
    }

    await ExamSet.update(
        {
            ...req.body,
        },
        {
            where: {
                bo_de_thi_id: req.params.id,
            },
        }
    );

    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const deleteById = async (req, res) => {
    const examSet = await ExamSet.findOne({
        where: {
            bo_de_thi_id: req.params.id,
        },
        attributes: ['anh_dai_dien'],
    });
    if (examSet.anh_dai_dien && fs.existsSync(`public${examSet.anh_dai_dien}`))
        fs.unlinkSync(`public${examSet.anh_dai_dien}`);

    await ExamSet.destroy({
        where: {
            bo_de_thi_id: req.params.id,
        },
    });

    const examSetMedias = await ExamSetMedia.findAll({
        where:{
            bo_de_thi_id: req.params.id,
        }
    })
    console.log(examSetMedias)
    for(const examSetMedia of examSetMedias){
        const media = await Media.findOne({
            where:{
                tep_tin_id: examSetMedia.tep_tin_id,
            }
        })
        if (media.duong_dan && fs.existsSync(`public${media.duong_dan}`))
            fs.unlinkSync(`public${media.duong_dan}`);
        await Media.destroy({
            where: {
                tep_tin_id: examSetMedia.tep_tin_id,
            },
        });
    }
    
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const uploadFileExams = async (req, res) => {
    const { files } = req.files;

    if (files.length === 0) {
        res.status(400).send({
            status: 'error',
            data: null,
            message: null,
        });
    }

    for (const file of files) {
        const media = await Media.create({
            loai: checkFileType(file),
            ten: file.originalname,
            duong_dan: `${file.destination.replace('public', '')}/${
                file.destination
            }`,
        });
        await ExamSetMedia.create({
            tep_tin_id: media.tep_tin_id,
            bo_de_thi_id: req.params.id,
        });
    }

    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const deleteFileExam = async (req, res) => {
    const examSetMedia = await ExamSetMedia.findOne({
        where:{
            bdttt_id: req.params.id
        }
    })
    await ExamSetMedia.destroy({
        where: {
            bdttt_id: req.params.id
        },
    });

    const media = await Media.findOne({
        where:{
            tep_tin_id: examSetMedia.tep_tin_id,
        }
    })
    if (media.duong_dan && fs.existsSync(`public${media.duong_dan}`))
        fs.unlinkSync(`public${media.duong_dan}`);
    await Media.destroy({
        where: {
            tep_tin_id: examSetMedia.tep_tin_id,
        },
    });

    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    getAll,
    getById,
    postCreate,
    putUpdate,
    deleteById,
    uploadFileExams,
    deleteFileExam,
};
