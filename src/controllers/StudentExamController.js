const {
    Exam,
    StudentExam,
    SelectedAnswer,
    Answer,
    Question,
    ThematicCriteria,
    ModunCriteria,
    SyntheticCriteria,
} = require('../models');
const sequelize = require('../utils/db');

const getAll = async (req, res) => {
    let filter = {};
    if (req.query.de_thi_id) filter.de_thi_id = req.query.de_thi_id;
    if (req.query.mo_dun_id) filter['$de_thi.mo_dun_id$'] = req.query.mo_dun_id;
    if (req.query.loai_de_thi_id)
        filter['$de_thi.loai_de_thi_id$'] = req.query.loai_de_thi_id;
    let studentExams = await StudentExam.findAll({
        include: {
            model: Exam,
            attributes: ['tong_diem'],
        },
        where: {
            ...filter,
            $hoc_vien_id$: req.userId,
        },
    });
    studentExams.forEach((studentExam) => {
        if (studentExam.de_thi)
            studentExam.dataValues.tong_diem = studentExam.de_thi.tong_diem;
        delete studentExam.dataValues.de_thi;
    });
    if (req.query.loai_de_thi_id == 1 || req.query.loai_de_thi_id == 2) {
        let criteria;
        if (req.query.loai_de_thi_id == 1) {
            criteria = await ThematicCriteria.findOne({
                where: {
                    mo_dun_id: req.query.mo_dun_id,
                },
            });
        } else if (req.query.loai_de_thi_id == 2) {
            criteria = await ModunCriteria.findOne({
                where: {
                    mo_dun_id: req.query.mo_dun_id,
                },
            });
        }
        if (criteria) {
            let so_lan_thi_con_lai = criteria.so_lan_thi - studentExams.length;
            studentExams = {
                so_lan_thi_con_lai,
                studentExams,
            };
        } else {
            res.status(404).send({
                status: 'fail',
                data: null,
                message: 'no criteria',
            });
            return;
        }
    }
    res.status(200).send({
        status: 'success',
        data: studentExams,
        message: null,
    });
};

const getUser = async (req, res) => {
    let filter;
    let so_ngay='30';
    if(req.query.so_ngay){
        so_ngay=req.query.so_ngay;
    }
    filter=`AND DATEDIFF(NOW(),de_thi_hoc_vien.ngay_tao)<=${so_ngay}`;
    const exams=await sequelize.query(
        `SELECT de_thi.ten_de_thi, de_thi.anh_dai_dien, de_thi_hoc_vien.* FROM de_thi JOIN de_thi_hoc_vien 
        ON de_thi.de_thi_id=de_thi_hoc_vien.de_thi_id WHERE de_thi_hoc_vien.hoc_vien_id=${req.userId} ${filter} 
        AND de_thi_hoc_vien.thoi_diem_ket_thuc IS NOT NULL ORDER BY de_thi_hoc_vien.ngay_tao DESC LIMIT 30`,
        { type: sequelize.QueryTypes.SELECT});
    res.status(200).send({
        status: 'success',
        data: exams,
        message: null,
    });
}

const getById = async (req, res) => {
    let studentExam = await StudentExam.findOne({
        include: {
            model: SelectedAnswer,
        },
        where: {
            dthv_id: req.params.id,
        },
    });
    studentExam.dap_an_da_chons.forEach((dap_an_da_chon) => {
        if (dap_an_da_chon.ket_qua_chon)
            dap_an_da_chon.ket_qua_chon =
                dap_an_da_chon.ket_qua_chon.toString();
    });
    res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

const postCreate = async (req, res) => {
    const studentExam = await StudentExam.create({
        ...req.body,
        hoc_vien_id: req.userId
    });
    res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

const putUpdate = async (req, res) => {
    const selectedAnswers = await SelectedAnswer.findAll({
        include: {
            model: Question,
            attributes: ['loai_cau_hoi', 'diem'],
            include: {
                model: Answer,
                attributes: ['noi_dung_dap_an', 'dap_an_dung'],
            },
        },
        where: {
            dthv_id: req.params.id,
        },
    });
    let ket_qua_diem = 0;
    let so_cau_tra_loi_dung = 0;
    let so_cau_tra_loi_sai = 0;
    let ket_qua_chons;
    let dap_ans;
    let result;
    for (const selectedAnswer of selectedAnswers) {
        result = false;
        if (selectedAnswer.cau_hoi.loai_cau_hoi === 1) { // Câu trắc nghiệm
            ket_qua_chons = selectedAnswer.ket_qua_chon.toString().split('');
            dap_ans = selectedAnswer.cau_hoi.dap_ans;
            if (
                ket_qua_chons.every(
                    (ket_qua_chon, index) =>
                        ket_qua_chon == dap_ans[index].dap_an_dung
                )
            )
                result = true;
        } else if (selectedAnswer.cau_hoi.loai_cau_hoi === 2) { // Câu trắc nghiệm đúng sai
            const ket_qua_chons = [...selectedAnswer.ket_qua_chon.toString()];
            const dap_ans = selectedAnswer.cau_hoi.dap_ans;
            const bangDiem = {
                0: 0, 
                1: selectedAnswer.cau_hoi.diem / 10, 
                2: selectedAnswer.cau_hoi.diem / 4, 
                3: selectedAnswer.cau_hoi.diem / 2, 
            };
            let so_cau_dung = ket_qua_chons.reduce((acc, ket_qua_chon, index) => acc + (ket_qua_chon === '1' === dap_ans[index].dap_an_dung), 0);  
            ket_qua_diem += parseFloat(bangDiem[so_cau_dung] || 0);
            if (so_cau_dung === 4) result = true;
        } else { // câu tự luận
            if (
                selectedAnswer.noi_dung_tra_loi ==
                selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an
            )
                result = true;
        }
        if (result) {
            ket_qua_diem += parseFloat(selectedAnswer.cau_hoi.diem);
            so_cau_tra_loi_dung++;
        }
    }
    let exam=await sequelize.query(`
        SELECT de_thi.* FROM de_thi JOIN de_thi_hoc_vien ON de_thi.de_thi_id=de_thi_hoc_vien.de_thi_id 
        WHERE de_thi_hoc_vien.dthv_id=:dthv_id`,
        {
            replacements:{
                dthv_id: req.params.id
            },
            type: sequelize.QueryTypes.SELECT
        });
    let criteria;
    if (exam[0]) {
        exam = exam[0];
        if (exam.loai_de_thi_id == 1) {
            criteria = await ThematicCriteria.findOne({
                where: {
                    mo_dun_id: exam.mo_dun_id,
                },
            });
        } else if (exam.loai_de_thi_id == 2) {
            criteria = await ModunCriteria.findOne({
                where: {
                    mo_dun_id: exam.mo_dun_id,
                },
            });
        } else if (exam.loai_de_thi_id == 3) {
            criteria = await SyntheticCriteria.findOne({
                where: {
                    khoa_hoc_id: exam.khoa_hoc_id,
                },
            });
        }
    }
    let dat_yeu_cau;
    if (criteria) {
        so_cau_tra_loi_sai = criteria.so_cau_hoi - so_cau_tra_loi_dung;
        let ket_qua = (ket_qua_diem / exam.tong_diem) * 100;
        if (ket_qua > criteria.yeu_cau) dat_yeu_cau = true;
        else {
            dat_yeu_cau = false;
        }
    }
    const studentExam = await StudentExam.update(
        {
            ...req.body,
            ket_qua_diem: ket_qua_diem,
            so_cau_tra_loi_dung: so_cau_tra_loi_dung,
            so_cau_tra_loi_sai: so_cau_tra_loi_sai,
            dat_yeu_cau: dat_yeu_cau,
        },
        {
            where: {
                dthv_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

const forceDelete = async (req, res) => {
    await StudentExam.destroy({
        where: {
            dthv_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

const clearAll = async (req, res) => {
    await sequelize.query(
        `
        DELETE de_thi_hoc_vien, dap_an_da_chon FROM de_thi_hoc_vien LEFT JOIN 
        dap_an_da_chon ON de_thi_hoc_vien.dthv_id=dap_an_da_chon.dthv_id 
        WHERE de_thi_hoc_vien.hoc_vien_id = :id`,
        {
            replacements: { id: req.params.id },
            type: sequelize.QueryTypes.DELETE,
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'cleared',
    });
};

module.exports = {
    getAll,
    getById,
    postCreate,
    putUpdate,
    getUser,
    forceDelete,
    clearAll,
};
