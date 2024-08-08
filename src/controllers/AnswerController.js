const { Answer } = require('../models');
const fs = require('fs');

const getAll = async (req, res) => {
    let filter = {};
    if (req.query.cau_hoi_id) filter.cau_hoi_id = req.query.cau_hoi_id;
    const answers = await Answer.findAll({
        where: {
            ...filter,
        },
        limit: 100,
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
            ...(req.files &&
                req.files.tep_dinh_kem1 && {
                    noi_dung_dap_an: `${req.body.noi_dung_dap_an1} ${req.body.tep_dinh_kem1}`,
                }),
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
            ...(req.files &&
                req.files.tep_dinh_kem2 && {
                    noi_dung_dap_an: `${req.body.noi_dung_dap_an2} ${req.body.tep_dinh_kem2}`,
                }),
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
            ...(req.files &&
                req.files.tep_dinh_kem3 && {
                    noi_dung_dap_an: `${req.body.noi_dung_dap_an3} ${req.body.tep_dinh_kem3}`,
                }),
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
            ...(req.files &&
                req.files.tep_dinh_kem4 && {
                    noi_dung_dap_an: `${req.body.noi_dung_dap_an4} ${req.body.tep_dinh_kem4}`,
                }),
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
        if (!req.body.dap_an_dung1) {
            req.body.dap_an_dung1 = 0;
        }
        await Answer.update(
            {
                noi_dung_dap_an: req.body.noi_dung_dap_an1,
                dap_an_dung: req.body.dap_an_dung1,
                ...(req.files &&
                    req.files.tep_dinh_kem1 && {
                        noi_dung_dap_an: `${req.body.noi_dung_dap_an1} ${req.body.tep_dinh_kem1}`,
                    }),
            },
            {
                where: {
                    dap_an_id: req.body.dap_an_id1,
                },
            }
        );
        if (req.body.loai_cau_hoi === '1') {
            // câu hỏi trắc nghiệm
            if (!req.body.dap_an_dung2) {
                req.body.dap_an_dung2 = 0;
            }
            await Answer.update(
                {
                    noi_dung_dap_an: req.body.noi_dung_dap_an2,
                    dap_an_dung: req.body.dap_an_dung2,
                    ...(req.files &&
                        req.files.tep_dinh_kem2 && {
                            noi_dung_dap_an: `${req.body.noi_dung_dap_an2} ${req.body.tep_dinh_kem2}`,
                        }),
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
                    ...(req.files &&
                        req.files.tep_dinh_kem3 && {
                            noi_dung_dap_an: `${req.body.noi_dung_dap_an3} ${req.body.tep_dinh_kem3}`,
                        }),
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
                    ...(req.files &&
                        req.files.tep_dinh_kem4 && {
                            noi_dung_dap_an: `${req.body.noi_dung_dap_an4} ${req.body.tep_dinh_kem4}`,
                        }),
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
    });
    answers.forEach(async (answer) => {
        if (
            answer.noi_dung_dap_an &&
            fs.existsSync(`public${answer.noi_dung_dap_an}`)
        )
            fs.unlinkSync(`public${answer.noi_dung_dap_an}`);
        if (answer.tep_dinh_kem) {
            for (const tep_dinh_kem of answer.tep_dinh_kem.split(',')) {
                if (fs.existsSync(`public${tep_dinh_kem}`))
                    fs.unlinkSync(`public${tep_dinh_kem}`);
            }
        }
        await Answer.destroy({
            where: {
                dap_an_id: answer.dap_an_id,
            },
        });
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

const forceDelete = async (req, res) => {
    const answer = await Answer.findOne({
        where: {
            dap_an_id: req.params.id,
        },
    });

    if (answer.tep_dinh_kem) {
        for (const tep_dinh_kem of answer.tep_dinh_kem.split(',')) {
            if (fs.existsSync(`public${tep_dinh_kem}`))
                fs.unlinkSync(`public${tep_dinh_kem}`);
        }
    }
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
