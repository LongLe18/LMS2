const { Answer } = require('../models');
const fs = require('fs');

const getAll = async (req, res) => {
    let filter = {};
    if (req.query.cau_hoi_id) filter.cau_hoi_id = req.query.cau_hoi_id;
    const answers = await Answer.findAll({
        where: {
            ...filter,
        },
        limit: 100
    });
    res.status(200).send({
        status: 'success',
        data: answers,
        message: null,
    });
};

const getById = async (req, res) => {
    const answer = await Answer.findOne({
        where: {
            dap_an_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: answer,
        message: null,
    });
};

const postCreate = async (req, res) => {
    if (!req.body.dap_an_dung1) {
        req.body.dap_an_dung1 = 0;
    }
    if (req.body.noi_dung_dap_an1) {
        await Answer.create({
            noi_dung_dap_an: req.body.noi_dung_dap_an1,
            dap_an_dung: req.body.dap_an_dung1,
            cau_hoi_id: req.body.cau_hoi_id,
        });
    }
    if (!req.body.dap_an_dung2) {
        req.body.dap_an_dung2 = 0;
    }
    if (req.body.noi_dung_dap_an2) {
        await Answer.create({
            noi_dung_dap_an: req.body.noi_dung_dap_an2,
            dap_an_dung: req.body.dap_an_dung2,
            cau_hoi_id: req.body.cau_hoi_id,
        });
    }
    if (!req.body.dap_an_dung3) {
        req.body.dap_an_dung3 = 0;
    }
    if (req.body.noi_dung_dap_an3) {
        await Answer.create({
            noi_dung_dap_an: req.body.noi_dung_dap_an3,
            dap_an_dung: req.body.dap_an_dung3,
            cau_hoi_id: req.body.cau_hoi_id,
        });
    }
    if (!req.body.dap_an_dung4) {
        req.body.dap_an_dung4 = 0;
    }
    if (req.body.noi_dung_dap_an4) {
        await Answer.create({
            noi_dung_dap_an: req.body.noi_dung_dap_an4,
            dap_an_dung: req.body.dap_an_dung4,
            cau_hoi_id: req.body.cau_hoi_id,
        });
    }
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const getUpdate = async (req, res) => {
    const answer = await Answer.findOne({
        where: {
            dap_an_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: answer,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    try {
        if (req.files['noi_dung_dap_an1']) {
            const answer = await Answer.findOne({
                where: {
                    dap_an_id: req.body.dap_an_id1,
                },
                raw: true,
            });
            if (answer.noi_dung_dap_an&&fs.existsSync(`src/public${answer.noi_dung_dap_an}`))
                fs.unlinkSync(`src/public${answer.noi_dung_dap_an}`);
        }
        if (req.files['noi_dung_dap_an2']) {
            const answer = await Answer.findOne({
                where: {
                    dap_an_id: req.body.dap_an_id2,
                },
                raw: true,
            });
            if (answer.noi_dung_dap_an&&fs.existsSync(`src/public${answer.noi_dung_dap_an}`))
                fs.unlinkSync(`src/public${answer.noi_dung_dap_an}`);
        }
        if (req.files['noi_dung_dap_an3']) {
            const answer = await Answer.findOne({
                where: {
                    dap_an_id: req.body.dap_an_id3,
                },
                raw: true,
            });
            if (answer.noi_dung_dap_an&&fs.existsSync(`src/public${answer.noi_dung_dap_an}`))
                fs.unlinkSync(`src/public${answer.noi_dung_dap_an}`);
        }
        if (req.files['noi_dung_dap_an4']) {
            const answer = await Answer.findOne({
                where: {
                    dap_an_id: req.body.dap_an_id4,
                },
                raw: true,
            });
            if (answer.noi_dung_dap_an&&fs.existsSync(`src/public${answer.noi_dung_dap_an}`))
                fs.unlinkSync(`src/public${answer.noi_dung_dap_an}`);
        }
        if (!req.body.dap_an_dung1) {
            req.body.dap_an_dung1 = 0;
        }
        await Answer.update(
            {
                noi_dung_dap_an: req.body.noi_dung_dap_an1,
                dap_an_dung: req.body.dap_an_dung1,
            },
            {
                where: {
                    dap_an_id: req.body.dap_an_id1,
                },
            }
        );
        if (req.body.loai_cau_hoi === '1') { // câu hỏi trắc nghiệm
            if (!req.body.dap_an_dung2) {
                req.body.dap_an_dung2 = 0;
            }
            await Answer.update(
                {
                    noi_dung_dap_an: req.body.noi_dung_dap_an2,
                    dap_an_dung: req.body.dap_an_dung2,
                },
                {
                    where: {
                        dap_an_id: req.body.dap_an_id2,
                    },
                }
            );
            if (!req.body.dap_an_dung3) {
                req.body.dap_an_dung3 = 0;
            }
            await Answer.update(
                {
                    noi_dung_dap_an: req.body.noi_dung_dap_an3,
                    dap_an_dung: req.body.dap_an_dung3,
                },
                {
                    where: {
                        dap_an_id: req.body.dap_an_id3,
                    },
                }
            );
            if (!req.body.dap_an_dung4) {
                req.body.dap_an_dung4 = 0;
            }
            await Answer.update(
                {
                    noi_dung_dap_an: req.body.noi_dung_dap_an4,
                    dap_an_dung: req.body.dap_an_dung4,
                },
                {
                    where: {
                        dap_an_id: req.body.dap_an_id4,
                    },
                }
            );
        }
        res.status(200).send({
            status: 'success',
            data: null,
            message: null,
        });
    } catch (error) {
        res.status(403).send({
            status: 'error',
            data: null,
            message: error,
        });
        console.log(error);
    }
};

const deleteByIdQuestion = async (req, res) => {
    const answers = await Answer.findAll({
        where: {
            cau_hoi_id: req.params.id,
        },
        raw: true,
    })
    answers.forEach(async answer => {
        if (answer.noi_dung_dap_an&&fs.existsSync(`src/public${answer.noi_dung_dap_an}`))
            fs.unlinkSync(`src/public${answer.noi_dung_dap_an}`);
        await Answer.destroy({
            where: {
                dap_an_id: answer.dap_an_id,
            },
        });
    })
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
}

const forceDelete = async (req, res) => {
    await Answer.destroy({
        where: {
            dap_an_id: req.params.id,
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
    deleteByIdQuestion,
    forceDelete,
};
