const { Exceprt } = require('../models');
const fs = require('fs');

const getAll = async (req, res) => {
    const { count, rows } = await Exceprt.findAndCountAll({
        where: {
            ...(req.query.id && {
                id: req.query.id,
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
    const exceprt = await Exceprt.findOne({
        where: {
            trich_doan_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: exceprt,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const exceprt = await Exceprt.create({
        ...req.body,
        ...(req.files &&
            req.files.tep_dinh_kem && {
                tep_dinh_kem: req.files.tep_dinh_kem
                    .map(
                        (item) =>
                            item.destination.replace('public', '') +
                            '/' +
                            item.filename
                    )
                    .join(','),
            }),
    });
    res.status(200).send({
        status: 'success',
        data: exceprt,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const exceprt = await Exceprt.findOne({
        where: {
            trich_doan_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: exceprt,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    if (req.file) {
        const exceprt = await Exceprt.findOne({
            where: {
                trich_doan_id: req.params.id,
            },
        });
        if (exceprt.noi_dung && fs.existsSync(`public${exceprt.noi_dung}`))
            fs.unlinkSync(`public${exceprt.noi_dung}`);
        if (req.files['tep_dinh_kem'] && exceprt.tep_dinh_kem) {
            for (const tep_dinh_kem of exceprt.tep_dinh_kem.split(',')) {
                if (fs.existsSync(`public${tep_dinh_kem}`))
                    fs.unlinkSync(`public${tep_dinh_kem}`);
            }
        }
    }
    await Exceprt.update(
        {
            ...req.body,
            ...(req.files &&
                req.files.tep_dinh_kem && {
                    tep_dinh_kem: req.files.tep_dinh_kem
                        .map(
                            (item) =>
                                item.destination.replace('public', '') +
                                '/' +
                                item.filename
                        )
                        .join(','),
                }),
        },
        {
            where: {
                trich_doan_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    const exceprt = await Exceprt.findOne({
        where: {
            trich_doan_id: req.params.id,
        },
    });

    const media = /\\begin{center}\n\\includegraphics\[scale = 0.5]{\s*([\s\S]*?)\s*}\n\\end{center}/g.exec(exceprt.noi_dung);
    if(media!==null && fs.existsSync(`public/${media[1]}`)){
        fs.unlinkSync(`public/${media}`);
    }

    if (exceprt.tep_dinh_kem) {
        for (const tep_dinh_kem of exceprt.tep_dinh_kem.split(',')) {
            if (fs.existsSync(`public${tep_dinh_kem}`))
                fs.unlinkSync(`public${tep_dinh_kem}`);
        }
    }

    await Exceprt.destroy({
        where: {
            trich_doan_id: req.params.id,
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
    getUpdate,
    putUpdate,
    forceDelete,
};
