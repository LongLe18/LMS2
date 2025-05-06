const { Op } = require('sequelize');
const fs = require('fs');

const { Exceprt } = require('../models');

const findAll = async (req, res) => {
    const { count, rows } = await Exceprt.findAndCountAll({
        where: {
            ...(req.query.search && {
                [Op.or]: [{ noi_dung: { [Op.like]: `%${req.query.search}%` } }],
            }),
            ...(req.query.trich_doan_id && {
                trich_doan_id: req.query.trich_doan_id,
            }),
            loai_trich_doan_id: {
                [Op.not]: 0,
            },
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

    return res.status(200).send({
        status: 'success',
        data: rows,
        pageIndex: Number(req.query.pageIndex || 1),
        pageSize: Number(req.query.pageSize || 10),
        totalCount: count,
        totalPage: Math.ceil(count / Number(req.query.pageSize || 10)),
        message: null,
    });
};

const findOne = async (req, res) => {
    const exceprt = await Exceprt.findOne({
        where: {
            trich_doan_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: exceprt,
        message: null,
    });
};

const create = async (req, res) => {
    const { body, files } = req;
    let filePaths = null;

    if (files?.tep_dinh_kem?.length) {
        filePaths = files.tep_dinh_kem
            .map(
                (item) =>
                    item.destination.replace('public', '') + '/' + item.filename
            )
            .join(',');
    }

    const exceprt = await Exceprt.create({
        ...body,
        ...(filePaths && { tep_dinh_kem: filePaths }),
    });

    return res.status(200).send({
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

    return res.status(200).send({
        status: 'success',
        data: exceprt,
        message: null,
    });
};

const update = async (req, res) => {
    const { file, files, body, params } = req;

    if (file) {
        const exceprt = await Exceprt.findOne({
            where: { trich_doan_id: params.id },
        });

        if (exceprt) {
            if (exceprt.noi_dung) {
                const noiDungPath = `public${exceprt.noi_dung}`;
                if (fs.existsSync(noiDungPath)) {
                    fs.unlinkSync(noiDungPath);
                }
            }

            if (files?.tep_dinh_kem && exceprt.tep_dinh_kem) {
                const oldFiles = exceprt.tep_dinh_kem.split(',');
                for (const filePath of oldFiles) {
                    const fullPath = `public${filePath}`;
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
            }
        }
    }

    const updateData = {
        ...body,
        ...(files?.tep_dinh_kem && {
            tep_dinh_kem: files.tep_dinh_kem
                .map(
                    (item) =>
                        item.destination.replace('public', '') +
                        '/' +
                        item.filename
                )
                .join(','),
        }),
    };

    await Exceprt.update(updateData, {
        where: { trich_doan_id: params.id },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const remove = async (req, res) => {
    const exceprt = await Exceprt.findOne({
        where: { trich_doan_id: req.params.id },
    });

    if (exceprt) {
        const mediaMatch =
            /\\begin{center}\n\\includegraphics\[scale = 0.5]{\s*([\s\S]*?)\s*}\n\\end{center}/g.exec(
                exceprt.noi_dung
            );
        if (mediaMatch && fs.existsSync(`public/${mediaMatch[1]}`)) {
            fs.unlinkSync(`public/${mediaMatch[1]}`);
        }

        if (exceprt.tep_dinh_kem) {
            for (const tep_dinh_kem of exceprt.tep_dinh_kem.split(',')) {
                const filePath = `public${tep_dinh_kem}`;
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        await Exceprt.destroy({
            where: { trich_doan_id: req.params.id },
        });

        return res.status(200).send({
            status: 'success',
            data: null,
            message: 'deleted',
        });
    } else {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'Excerpt not found',
        });
    }
};

module.exports = {
    findAll,
    findOne,
    create,
    getUpdate,
    update,
    remove,
};
