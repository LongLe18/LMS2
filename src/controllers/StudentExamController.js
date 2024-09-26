const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { Op } = require('sequelize');

const {
    Exam,
    StudentExam,
    SelectedAnswer,
    Answer,
    Question,
    ThematicCriteria,
    ModunCriteria,
    OnlineCriteria,
    ExamQuestion,
    Student,
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
    let so_ngay = '30';
    if (req.query.so_ngay) {
        so_ngay = req.query.so_ngay;
    }
    filter = `AND DATEDIFF(NOW(),de_thi_hoc_vien.ngay_tao)<=${so_ngay}`;
    const exams = await sequelize.query(
        `SELECT de_thi.ten_de_thi, de_thi.anh_dai_dien, de_thi_hoc_vien.* FROM de_thi JOIN de_thi_hoc_vien 
        ON de_thi.de_thi_id=de_thi_hoc_vien.de_thi_id WHERE de_thi_hoc_vien.hoc_vien_id=${req.userId} ${filter} 
        AND de_thi_hoc_vien.thoi_diem_ket_thuc IS NOT NULL ORDER BY de_thi_hoc_vien.ngay_tao DESC LIMIT 30`,
        { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).send({
        status: 'success',
        data: exams,
        message: null,
    });
};

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
        hoc_vien_id: req.userId,
    });
    // await sequelize.query(
    //     `
    //     INSERT INTO dap_an_da_chon (cau_hoi_id, dthv_id)
    //         SELECT cau_hoi_id, :dthv_id FROM cau_hoi_de_thi
    //         WHERE de_thi_id = :de_thi_id
    // `,
    //     {
    //         type: sequelize.QueryTypes.INSERT,
    //         replacements: {
    //             dthv_id: Number(studentExam.dthv_id),
    //             de_thi_id: Number(req.body.de_thi_id),
    //         },
    //     }
    // );
    res.status(200).send({
        status: 'success',
        data: studentExam,
        message: null,
    });
};

// Dùng cho thi đánh giá năng lực mới ->. không dùng
const postCreatev2 = async (req, res) => {
    const { khoa_hoc_id, chuyen_nganh_ids, ...rest } = req.body;

    const sampleExam = await Exam.findOne({
        where: {
            de_mau: true,
            xuat_ban: true,
            trang_thai: true,
            khoa_hoc_id,
        },
    });

    if (!sampleExam) {
        return res.status(404).send({
            status: 'error',
            data: null,
            message: 'Đề mẫu của khóa học không tồn tại',
        });
    }

    const exam = await Exam.create({
        ten_de_thi: 'THI ĐÁNH GIÁ NĂNG LỰC',
        tong_diem: 150,
        xuat_ban: true,
        trang_thai: true,
        kct_id: 1,
        khoa_hoc_id,
        loai_de_thi_id: 4,
        de_mau_id: sampleExam.de_thi_id,
    });

    let criteria = await OnlineCriteria.findOne({
        where: {
            khoa_hoc_id: khoa_hoc_id,
        },
    });

    // phần 1
    await sequelize.query(
        `
        INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan)
            SELECT cau_hoi_id, ${exam.dataValues.de_thi_id}, 1 FROM cau_hoi
            WHERE chuyen_nganh_id = 1 AND kct_id = 1 AND de_thi_id = ${sampleExam.de_thi_id}
            ORDER BY RAND() LIMIT ${criteria.so_cau_hoi_phan_1}
    `,
        {
            type: sequelize.QueryTypes.INSERT,
        }
    );

    // phần 2
    await sequelize.query(
        `
            INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan)
                SELECT cau_hoi_id, ${exam.dataValues.de_thi_id}, 2 FROM cau_hoi
                WHERE chuyen_nganh_id = 7 AND kct_id = 1 AND de_thi_id = ${sampleExam.de_thi_id}
                ORDER BY trich_doan_id ASC, RAND()
                LIMIT ${criteria.so_cau_hoi_phan_2}
        `,
        {
            type: sequelize.QueryTypes.INSERT,
        }
    );

    // phần 3
    if (chuyen_nganh_ids === '5') {
        await sequelize.query(
            `
        INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan)
            SELECT cau_hoi_id, ${exam.dataValues.de_thi_id}, 3 FROM cau_hoi
            WHERE chuyen_nganh_id = 5 AND kct_id = 1 AND de_thi_id = ${sampleExam.de_thi_id}
            ORDER BY cau_hoi_id ASC
            LIMIT ${criteria.so_cau_hoi_phan_3}
    `,
            {
                type: sequelize.QueryTypes.INSERT,
            }
        );
    } else if (
        chuyen_nganh_ids
            .split(',')
            .every(
                (element) =>
                    typeof element === 'string' &&
                    !isNaN(parseFloat(element)) &&
                    isFinite(element)
            )
    ) {
        const so_cau_hoi_tung_chuyen_nganh = parseInt(
            Number(criteria.so_cau_hoi_phan_3) / 3
        );
        for (const chuyen_nganh_id of chuyen_nganh_ids.split(',')) {
            await sequelize.query(
                `
                        INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan)
                            SELECT cau_hoi_id, ${exam.dataValues.de_thi_id}, 3 FROM cau_hoi
                            WHERE chuyen_nganh_id = :chuyen_nganh_id AND kct_id = 1 AND de_thi_id = ${sampleExam.de_thi_id}
                            ORDER BY RAND() LIMIT ${so_cau_hoi_tung_chuyen_nganh}
                    `,
                {
                    type: sequelize.QueryTypes.INSERT,
                    replacements: {
                        chuyen_nganh_id: Number(chuyen_nganh_id),
                    },
                }
            );
        }
        await sequelize.query(
            `
                    INSERT INTO cau_hoi_de_thi (cau_hoi_id, de_thi_id, phan)
                        SELECT cau_hoi_id, ${
                            exam.dataValues.de_thi_id
                        }, 3 FROM cau_hoi
                        WHERE chuyen_nganh_id IN (${chuyen_nganh_ids}) AND kct_id = 1 AND de_thi_id = ${
                sampleExam.de_thi_id
            }
                        AND cau_hoi_id NOT IN (SELECT cau_hoi_id
                        FROM cau_hoi_de_thi
                        WHERE de_thi_id = ${exam.de_thi_id})
                        ORDER BY RAND() LIMIT ${
                            criteria.so_cau_hoi_phan_3 -
                            so_cau_hoi_tung_chuyen_nganh * 3
                        }
                `,
            {
                type: sequelize.QueryTypes.INSERT,
            }
        );
    }

    const studentExam = await StudentExam.create({
        ...rest,
        de_thi_id: exam.dataValues.de_thi_id,
        hoc_vien_id: req.userId,
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
        order: [[sequelize.col('dap_an_id'), 'ASC']],
    });
    let ket_qua_diem = 0;
    let so_cau_tra_loi_dung = 0;
    let so_cau_tra_loi_sai = 0;
    let ket_qua_chons;
    let dap_ans;
    let result;
    for (const selectedAnswer of selectedAnswers) {
        result = false;
        if (selectedAnswer.cau_hoi.loai_cau_hoi === 1) {
            // Câu trắc nghiệm
            ket_qua_chons = selectedAnswer.ket_qua_chon.toString().split('');
            dap_ans = selectedAnswer.cau_hoi.dap_ans;
            if (
                ket_qua_chons.every(
                    (ket_qua_chon, index) =>
                        ket_qua_chon == dap_ans[index].dap_an_dung
                )
            )
                result = true;
        } else if (selectedAnswer.cau_hoi.loai_cau_hoi === 2) {
            // Câu trắc nghiệm đúng sai
            const ket_qua_chons = [...selectedAnswer.ket_qua_chon.toString()];
            const dap_ans = selectedAnswer.cau_hoi.dap_ans;
            const bangDiem = {
                0: 0,
                1: selectedAnswer.cau_hoi.diem / 10,
                2: selectedAnswer.cau_hoi.diem / 4,
                3: selectedAnswer.cau_hoi.diem / 2,
            };
            let so_cau_dung = ket_qua_chons.reduce(
                (acc, ket_qua_chon, index) =>
                    acc +
                    ((ket_qua_chon === '1') === dap_ans[index].dap_an_dung),
                0
            );
            ket_qua_diem += parseFloat(bangDiem[so_cau_dung] || 0);
            if (so_cau_dung === 4) result = true;
        } else {
            // câu tự luận
            if (
                selectedAnswer.cau_hoi &&
                selectedAnswer.cau_hoi.loai_cau_hoi === 0 &&
                selectedAnswer.noi_dung_tra_loi &&
                selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an &&
                selectedAnswer.noi_dung_tra_loi.trim().toLowerCase() ==
                    selectedAnswer.cau_hoi.dap_ans[0].noi_dung_dap_an
                        .trim()
                        .toLowerCase()
            )
                result = true;
        }
        if (result) {
            ket_qua_diem += parseFloat(selectedAnswer.cau_hoi.diem);
            so_cau_tra_loi_dung++;
        }
    }
    let exam = await sequelize.query(
        `
        SELECT de_thi.* FROM de_thi JOIN de_thi_hoc_vien ON de_thi.de_thi_id=de_thi_hoc_vien.de_thi_id 
        WHERE de_thi_hoc_vien.dthv_id=:dthv_id`,
        {
            replacements: {
                dthv_id: req.params.id,
            },
            type: sequelize.QueryTypes.SELECT,
        }
    );
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
            criteria = await OnlineCriteria.findOne({
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

const putUpdatev2 = async (data, hoc_vien_id, dthv_id) => {
    try {
        const studentExam = await StudentExam.findOne({ where: { dthv_id } });
        if (!studentExam) {
            return 'Student exam not found';
        }
        if (studentExam.hoc_vien_id != hoc_vien_id) {
            return 'Student id not match';
        }
        await studentExam.update({
            thoi_gian_lam_bai: data.thoi_gian_lam_bai,
        });
        await sequelize.query(
            `
         UPDATE dap_an_da_chon
            SET ket_qua_chon = CASE 
                ${data.dap_an_da_chons.map((item) => {
                    return `WHEN dadc_id = ${item.dadc_id} THEN '${
                        item.ket_qua_chon ?? ''
                    }'`;
                })}
            END,
            noi_dung_tra_loi = CASE 
                 ${data.dap_an_da_chons.map((item) => {
                     return `WHEN dadc_id = ${item.dadc_id} THEN '${
                         item.noi_dung_tra_loi ?? ''
                     }'`;
                 })}
            END
            WHERE dthv_id = :dthv_id
     `,
            {
                replacements: {
                    dthv_id: Number(dthv_id),
                },
            }
        );
        return 'saved exam';
    } catch (err) {
        console.log(err);
        return 'error';
    }
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

const exportReport = async (req, res) => {
    try {
        const content = fs.readFileSync(
            path.join(process.cwd(), '/public/templates/export_report.xlsx')
        );
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(content);

        workbook.creator = 'Me';
        workbook.lastModifiedBy = 'Her';
        workbook.created = new Date();
        const workSheet = workbook.getWorksheet('Sheet1');

        const list = await sequelize.query(
            `
            SELECT dt.de_thi_id, dt.ten_de_thi, hv.hoc_vien_id, hv.ho_ten, hv.email, dthv_s.ket_qua_diem FROM de_thi dt INNER JOIN 
                (SELECT dthv.dthv_id, dthv.hoc_vien_id, dthv.de_thi_id, dthv.ket_qua_diem FROM (SELECT dthv.de_thi_id, dthv.hoc_vien_id, MAX(dthv.ngay_tao) ngay_tao FROM de_thi_hoc_vien dthv 
                    WHERE dthv.ngay_tao BETWEEN :ngay_bat_dau AND :ngay_ket_thuc GROUP BY dthv.de_thi_id, dthv.hoc_vien_id) dthv_new
                    INNER JOIN de_thi_hoc_vien dthv ON dthv_new.de_thi_id = dthv.de_thi_id AND dthv_new.hoc_vien_id = dthv.hoc_vien_id
                        AND dthv_new.ngay_tao = dthv.ngay_tao) dthv_s
                        ON dt.de_thi_id = dthv_s.de_thi_id
                        INNER JOIN hoc_vien hv ON dthv_s.hoc_vien_id = hv.hoc_vien_id`,
            {
                replacements: {
                    ngay_bat_dau: req.query.ngay_bat_dau || '2000-01-01',
                    ngay_ket_thuc: req.query.ngay_ket_thuc || '2100-01-01',
                },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        // Nhóm các phần tử theo de_thi_id và lấy các thuộc tính ten_de_thi duy nhất
        const deThiIds = list.reduce((acc, current) => {
            const { de_thi_id, ten_de_thi } = current;
            if (!acc[de_thi_id]) {
                acc[de_thi_id] = { de_thi_id, ten_de_thi };
            }
            return acc;
        }, {});

        // Chuyển đối tượng thành mảng
        const uniqueDeThiIds = Object.values(deThiIds);

        // Nhóm các phần tử theo hoc_vien_id và lấy các thuộc tính ho_ten duy nhất
        const hocVienIds = list.reduce((acc, current) => {
            const { hoc_vien_id, ho_ten, email } = current;
            if (!acc[hoc_vien_id]) {
                acc[hoc_vien_id] = { hoc_vien_id, ho_ten, email };
            }
            return acc;
        }, {});

        // Chuyển đối tượng thành mảng
        const uniqueHocVienIds = Object.values(hocVienIds);

        let row;
        let indexCol = 3;

        for (const item of uniqueDeThiIds) {
            row = workSheet.getRow(2);

            const order = row.getCell(indexCol);
            order.value = item.ten_de_thi;

            indexCol++;
        }

        let indexRow = 3;
        let count = 1;

        for (const item of uniqueHocVienIds) {
            row = workSheet.getRow(indexRow);

            const order = row.getCell(1);
            order.value = count;

            const fullName = row.getCell(2);
            fullName.value = `${item.ho_ten} - ${item.email}`;

            indexRow++;
            count++;
        }

        for (const item of list) {
            indexRow = uniqueHocVienIds.findIndex(
                (item2) => item2.hoc_vien_id === item.hoc_vien_id
            );
            indexCol = uniqueDeThiIds.findIndex(
                (item2) => item2.de_thi_id === item.de_thi_id
            );
            row = workSheet.getRow(indexRow + 3);

            const score = row.getCell(indexCol + 3);
            score.value = item.ket_qua_diem;
        }

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'export_report.xlsx'
        );
        await workbook.xlsx.write(res);

        return res.end();
    } catch (err) {
        console.log(err);
        res.status(500).send({
            status: 'error',
            data: null,
            message: err,
        });
    }
};

module.exports = {
    getAll,
    getById,
    postCreate,
    putUpdate,
    getUser,
    forceDelete,
    clearAll,
    exportReport,
    postCreatev2,
    putUpdatev2,
};
