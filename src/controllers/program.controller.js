const fs = require('fs');

const Program = require('../models/program.model');

const findAll = async (req, res) => {
    const program = await Program.findAll({
        where: {
            ...(req.query.trang_thai && { trang_thai: req.query.trang_thai }),
        },
        limit: 100,
    });

    return res.status(200).send({
        status: 'success',
        data: program,
        message: null,
    });
};

const findOne = async (req, res) => {
    const program = await Program.findOne({
        where: {
            kct_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: program,
        message: null,
    });
};

const getCreate = async (req, res) => {
    res.send('create');
};

const create = async (req, res) => {
    const program = await Program.create({
        ...req.body,
        nguoi_tao: req.userId,
    });

    return res.status(200).send({
        status: 'success',
        data: program,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const program = await Program.findOne({
        where: {
            kct_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: program,
        message: null,
    });
};

const update = async (req, res) => {
    const program = await Program.findOne({
        where: {
            kct_id: req.params.id,
        },
    });

    if (req.file && program?.anh_dai_dien) {
        const imagePath = `public${program.anh_dai_dien}`;
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    await Program.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                kct_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const deleteById = async (req, res) => {
    await Program.update(
        {
            trang_thai: false,
            nguoi_sua: req.userId,
        },
        {
            where: {
                kct_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const restore = async (req, res) => {
    await Program.update(
        {
            trang_thai: true,
            nguoi_sua: req.userId,
        },
        {
            where: {
                kct_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const remove = async (req, res) => {
    const program = await Program.findOne({
        where: {
            kct_id: req.params.id,
        },
    });

    if (program?.anh_dai_dien) {
        const imagePath = `public${program.anh_dai_dien}`;
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    await Program.destroy({
        where: {
            kct_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'Program deleted successfully',
    });
};

module.exports = {
    findAll,
    findOne,
    getCreate,
    create,
    getUpdate,
    update,
    deleteById,
    restore,
    remove,
};
