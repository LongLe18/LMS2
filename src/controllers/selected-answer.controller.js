const { SelectedAnswer } = require('../models');
const sequelize = require('../utils/db');

const findAll = async (req, res) => {
    let conditions = [];
    let replacements = {
        hoc_vien_id: parseInt(req.userId),
    };

    if (req.query.dthv_id) {
        conditions.push('dap_an_da_chon.dthv_id = :dthv_id');
        replacements.dthv_id = parseInt(req.query.dthv_id);
    }
    if (req.query.cau_hoi_id) {
        conditions.push('dap_an_da_chon.cau_hoi_id = :cau_hoi_id');
        replacements.cau_hoi_id = parseInt(req.query.cau_hoi_id);
    }
    conditions.push('de_thi_hoc_vien.hoc_vien_id = :hoc_vien_id');

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const selectedAnswers = await sequelize.query(
        `
    SELECT dap_an_da_chon.*
    FROM dap_an_da_chon
    JOIN de_thi_hoc_vien ON dap_an_da_chon.dthv_id = de_thi_hoc_vien.dthv_id
    ${whereClause}
    `,
        {
            replacements,
            type: sequelize.QueryTypes.SELECT,
        }
    );

    return res.status(200).send({
        status: 'success',
        data: selectedAnswers,
        message: null,
    });
};

const findOne = async (req, res) => {
    const selectedAnswer = await SelectedAnswer.findOne({
        where: {
            dadc_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: selectedAnswer,
        message: null,
    });
};

const create = async (req, res) => {
    const { ket_qua_chons = [], noi_dung_tra_lois = [], dthv_id } = req.body;

    const selectedAnswer = [
        ...ket_qua_chons.map((item) => ({
            ket_qua_chon: item.ket_qua,
            dthv_id,
            cau_hoi_id: item.cau_hoi_id,
            nguoi_tao: req.userId,
        })),
        ...noi_dung_tra_lois.map((item) => ({
            noi_dung_tra_loi: item.noi_dung,
            dthv_id,
            cau_hoi_id: item.cau_hoi_id,
            nguoi_tao: req.userId,
        })),
    ];

    await SelectedAnswer.bulkCreate(selectedAnswer);

    return res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

const update = async (req, res) => {
    const selectedAnswer = await SelectedAnswer.update(
        {
            ...req.body,
            nguoi_sua: req.userId,
        },
        {
            where: {
                dadc_id: req.params.id,
            },
        }
    );

    return res.status(200).send({
        status: 'success',
        data: selectedAnswer,
        message: null,
    });
};

const remove = async (req, res) => {
    await SelectedAnswer.destroy({
        where: {
            dadc_id: req.params.id,
        },
    });

    return res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

module.exports = {
    findAll,
    findOne,
    create,
    update,
    remove,
};
