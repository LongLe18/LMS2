const {
    Modun,
    Exam,
    StudentExam,
} = require('../models');
const fs = require('fs');
const sequelize= require('../utils/db');

const getTeaching = async (req, res) => {
    const moduns=await sequelize.query(`
        SELECT mo_dun.*, khoa_hoc.ten_khoa_hoc, khoa_hoc.trang_thai, (SELECT COUNT(DISTINCT khoa_hoc_hoc_vien.hoc_vien_id) AS SL 
        FROM khoa_hoc_hoc_vien WHERE khoa_hoc_hoc_vien.khoa_hoc_id=khoa_hoc.khoa_hoc_id) AS so_luong
        FROM mo_dun JOIN khoa_hoc ON mo_dun.khoa_hoc_id=khoa_hoc.khoa_hoc_id 
        WHERE mo_dun.giao_vien_id=${req.userId} LIMIT 100000
            `,
            {type: sequelize.QueryTypes.SELECT});
    res.status(200).send({
        status: 'success',
        data: moduns,
        message: null,
    });
};

//[GET] modun?id
const getAll = async (req, res) => {
    let khoa_hoc_id =1;
    let trang_thai = 1;
    if (req.query.khoa_hoc_id) {
        khoa_hoc_id = 'mo_dun.khoa_hoc_id=:khoa_hoc_id';
    }
    if (req.query.trang_thai) {
        trang_thai = 'mo_dun.trang_thai=:trang_thai';
    }
    let filter=`WHERE ${khoa_hoc_id} AND ${trang_thai}`;
    let moduns = await sequelize.query(`
        SELECT mo_dun.*, giao_vien.ho_ten, khoa_hoc.ten_khoa_hoc, tieu_chi_de_mo_dun.yeu_cau AS muc_tieu FROM mo_dun 
        LEFT JOIN giao_vien ON giao_vien.giao_vien_id=mo_dun.giao_vien_id LEFT JOIN khoa_hoc ON mo_dun.khoa_hoc_id=khoa_hoc.khoa_hoc_id 
        LEFT JOIN tieu_chi_de_mo_dun ON mo_dun.mo_dun_id=tieu_chi_de_mo_dun.mo_dun_id ${filter} LIMIT 100`,
        {
            replacements: {
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
                trang_thai: parseInt(req.query.trang_thai)
            },
            type: sequelize.QueryTypes.SELECT
        });
    let percentAchieved;
    for (let modun of moduns) {
        let totalExam = await Exam.count({
            where: {
                loai_de_thi_id: 1,
                trang_thai: true,
                mo_dun_id: modun.mo_dun_id,
            },
        });
        let passingExam = await Exam.count({
            include: {
                model: StudentExam,
            },
            where: {
                loai_de_thi_id: 1,
                mo_dun_id: modun.mo_dun_id,
                trang_thai: true,
                '$de_thi_hoc_viens.hoc_vien_id$': req.userId,
                '$de_thi_hoc_viens.dat_yeu_cau$': true,
            },
        });
        if (totalExam != 0) {
            percentAchieved = parseFloat(passingExam / totalExam);
            modun.percentAchieved =Math.round( (percentAchieved * 10000))/100;
        } else {
            modun.percentAchieved = 0;
        }
    }
    res.status(200).send({
        status: 'success',
        data: moduns,
        message: null,
    });
};

const getByIDCourse = async (req, res) => {
    const moduns=await sequelize.query(`
        SELECT mo_dun.mo_dun_id, mo_dun.mo_dun_ma, mo_dun.ten_mo_dun, mo_dun.linh_vuc, mo_dun.mo_ta, mo_dun.video_gioi_thieu, 
        mo_dun.anh_dai_dien, mo_dun.loai_tong_hop, mo_dun.giao_vien_id, 50 AS tien_do, COUNT(chuyen_de.chuyen_de_id) AS so_chuyen_de 
        FROM mo_dun LEFT JOIN chuyen_de ON mo_dun.mo_dun_id=chuyen_de.mo_dun_id WHERE mo_dun.khoa_hoc_id=:khoa_hoc_id GROUP BY 
        mo_dun.mo_dun_id, mo_dun.mo_dun_ma, mo_dun.ten_mo_dun, mo_dun.linh_vuc, mo_dun.mo_ta, mo_dun.video_gioi_thieu, 
        mo_dun.anh_dai_dien, mo_dun.loai_tong_hop, mo_dun.giao_vien_id LIMIT 100`,
        {
          replacements:{
            khoa_hoc_id: parseInt(req.params.id)
          },
          type: sequelize.QueryTypes.SELECT
        });
    let nums;
    if(req.query.hoc_vien_id){
        for(const modun of moduns){
            nums=await sequelize.query(`
                SELECT (SELECT COUNT(de_thi.de_thi_id) FROM de_thi JOIN de_thi_hoc_vien ON de_thi.de_thi_id=de_thi_hoc_vien.de_thi_id
                WHERE de_thi.loai_de_thi_id=1 AND de_thi.trang_thai=true AND de_thi.mo_dun_id=${modun.mo_dun_id} AND de_thi_hoc_vien.hoc_vien_id=:hoc_vien_id
                AND de_thi_hoc_vien.dat_yeu_cau=true) AS so_de_dat, (SELECT COUNT(de_thi.de_thi_id) FROM de_thi WHERE 
                de_thi.loai_de_thi_id=1 AND de_thi.trang_thai=true AND de_thi.mo_dun_id=${modun.mo_dun_id}) AS tong_so_de`,
                {
                  replacements: {
                    hoc_vien_id: parseInt(req.query.hoc_vien_id)
                  },
                  type: sequelize.QueryTypes.SELECT
                });
            if(nums[0].tong_so_de!=0){
                modun.tien_do=parseFloat(nums[0].so_de_dat/nums[0].tong_so_de)*100;
            }else{
                modun.tien_do=0;
            }
        }
    }
    res.status(200).send({
        status: 'success',
        data: moduns,
        message: null,
    });
}

const getByUserCourse = async (req, res) => {
    const moduns=await sequelize.query(`
      SELECT mo_dun.*, ((SELECT COUNT(DISTINCT de_thi.chuyen_de_id) FROM de_thi JOIN de_thi_hoc_vien ON 
      de_thi.de_thi_id=de_thi_hoc_vien.de_thi_id WHERE de_thi.loai_de_thi_id=1 AND de_thi.trang_thai=true 
      AND de_thi_hoc_vien.dat_yeu_cau=true AND de_thi_hoc_vien.hoc_vien_id=${req.userId})/(SELECT COUNT(*) FROM chuyen_de WHERE 
      chuyen_de.mo_dun_id=mo_dun.mo_dun_id)) AS tien_do FROM mo_dun WHERE mo_dun.khoa_hoc_id=:khoa_hoc_id LIMIT 100`,
      {
        replacements: {
            khoa_hoc_id: parseInt(req.params.id)
        },
        type: sequelize.QueryTypes.SELECT
      });
    res.status(200).send({
      status: 'success',
      data: moduns,
      message: null,
  });
}

const getAllv2 = async (req, res) => {
    let khoa_hoc_id=1;
    let trang_thai = 1;
    if (req.query.khoa_hoc_id) {
        khoa_hoc_id = 'mo_dun.khoa_hoc_id=:khoa_hoc_id';
    }
    if (req.query.trang_thai) {
        trang_thai = 'mo_dun.trang_thai=:trang_thai';
    }
    let filter=`WHERE ${khoa_hoc_id} AND ${trang_thai}`;
    let moduns = await sequelize.query(`
        SELECT mo_dun.*, IF(tieu_chi_de_mo_dun.yeu_cau IS NULL, 0, tieu_chi_de_mo_dun.yeu_cau) AS muc_tieu FROM mo_dun 
        LEFT JOIN tieu_chi_de_mo_dun ON mo_dun.mo_dun_id=tieu_chi_de_mo_dun.mo_dun_id ${filter} LIMIT 100`,
        {
            replacements: {
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
                trang_thai: parseInt(req.query.trang_thai)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: moduns,
        message: null,
    });
};

const getStatistical = async (req, res) => {
    let search=1;
    let trang_thai=1;
    let offset = 0;
    let limit =100;
    if(req.query.offset){
        offset=req.query.offset;
    }
    if(req.query.limit){
        limit=req.query.limit;
    }
    if(req.query.search){
        search='mo_dun.ten_mo_dun LIKE :search';
    }
    if(req.query.trang_thai){
        trang_thai= `khoa_hoc.trang_thai=:trang_thai`
    }
    filter=`AND ${search} AND ${trang_thai}`;
    let moduns=await sequelize.query(`  
        SELECT khoa_hoc.trang_thai, khoa_hoc.ten_khoa_hoc, mo_dun.ten_mo_dun, mo_dun.mo_dun_id,
        (SELECT COUNT(DISTINCT khoa_hoc_hoc_vien.hoc_vien_id) FROM khoa_hoc_hoc_vien 
        WHERE khoa_hoc_hoc_vien.khoa_hoc_id=khoa_hoc.khoa_hoc_id) AS so_hoc_vien, (SELECT COUNT(DISTINCT hoc_vien.hoc_vien_id) 
        FROM hoc_vien WHERE (SELECT COUNT(DISTINCT de_thi.chuyen_de_id) FROM de_thi_hoc_vien JOIN de_thi 
        ON de_thi_hoc_vien.de_thi_id=de_thi.de_thi_id WHERE de_thi_hoc_vien.hoc_vien_id=hoc_vien.hoc_vien_id 
        AND de_thi.loai_de_thi_id=1 AND de_thi.mo_dun_id=mo_dun.mo_dun_id AND de_thi_hoc_vien.dat_yeu_cau=true)
        =(SELECT COUNT(chuyen_de.chuyen_de_id) FROM chuyen_de JOIN mo_dun ON chuyen_de.mo_dun_id=mo_dun.mo_dun_id)
        AND (SELECT COUNT(*) FROM de_thi_hoc_vien JOIN de_thi ON de_thi_hoc_vien.de_thi_id=de_thi.de_thi_id 
        WHERE hoc_vien.hoc_vien_id=de_thi_hoc_vien.hoc_vien_id AND de_thi.loai_de_thi_id=2 AND 
        de_thi.mo_dun_id=mo_dun.mo_dun_id AND de_thi_hoc_vien.dat_yeu_cau=true)) AS so_luong FROM khoa_hoc 
        JOIN mo_dun ON khoa_hoc.khoa_hoc_id=mo_dun.khoa_hoc_id
        AND mo_dun.giao_vien_id=:giao_vien_id ${filter} LIMIT 100`,
        {
            replacements:{
                trang_thai: parseInt(req.query.trang_thai),
                search: `%${decodeURI(req.query.search)}%`,
                giao_vien_id: parseInt(req.params.id),
                limit: parseInt(limit),
                offset: parseInt(offset)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: moduns,
        message: null,
    });
}

const getByFilter = async (req, res) => {
    let search = 1;
    let ngay_tao=1;
    let khoa_hoc_id= 1;
    let trang_thai= 1;
    let offset = 0;
    let limit =100;
    if(req.query.offset){
        offset=req.query.offset;
    }
    if(req.query.limit){
        limit=req.query.limit;
    }
    if (req.query.search) {
        search = 'mo_dun.ten_mo_dun LIKE :search';
    }
    if (req.query.ngay_bat_dau&&req.query.ngay_ket_thuc) {
        ngay_tao = 'mo_dun.ngay_tao BETWEEN :ngay_bat_dau AND :ngay_ket_thuc';
    }
    if (req.query.khoa_hoc_id) {
        khoa_hoc_id = 'mo_dun.khoa_hoc_id=:khoa_hoc_id';
    }
    if (req.query.trang_thai) {
        trang_thai = 'mo_dun.trang_thai=:trang_thai';
    }
    const filter=`WHERE ${search} AND ${ngay_tao} AND ${khoa_hoc_id} AND ${trang_thai}`;
    const moduns=await sequelize.query(`
        SELECT mo_dun.*, khoa_hoc.ten_khoa_hoc, giao_vien.ho_ten AS ten_giao_vien FROM mo_dun LEFT JOIN khoa_hoc ON 
        mo_dun.khoa_hoc_id=khoa_hoc.khoa_hoc_id LEFT JOIN giao_vien ON 
        mo_dun.giao_vien_id=giao_vien.giao_vien_id ${filter} ORDER BY mo_dun.ngay_tao DESC LIMIT :offset, :limit`,
        {
            replacements: {
                trang_thai: parseInt(req.query.trang_thai),
                search: `%${decodeURI(req.query.search)}%`,
                ngay_bat_dau: req.query.ngay_bat_dau,
                ngay_ket_thuc: req.query.ngay_ket_thuc,
                khoa_hoc_id: parseInt(req.query.khoa_hoc_id),
                limit: parseInt(limit),
                offset: parseInt(offset)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: moduns,
        message: null,
    });
};

//[GET] modun/:id
const getById = async (req, res) => {
    const modun=await sequelize.query(`
        SELECT mo_dun.*, giao_vien.chuyen_nganh_id, giao_vien.ho_ten AS ten_giao_vien FROM mo_dun LEFT JOIN 
        giao_vien ON mo_dun.giao_vien_id=giao_vien.giao_vien_id WHERE mo_dun.mo_dun_id=:mo_dun_id`,
        {
            replacements: {
                mo_dun_id: parseInt(req.params.id)
            },
            type: sequelize.QueryTypes.SELECT
        });
    res.status(200).send({
        status: 'success',
        data: modun[0],
        message: null,
    });
};

//[POST] modun/create
const postCreate = async (req, res) => {
    if (req.body.loai_tong_hop === 'true') {
        const modun = await Modun.findOne({
            where: {
                khoa_hoc_id: req.body.khoa_hoc_id,
                loai_tong_hop: true,
            },
        });
        if (modun) {
            res.status(404).send({
                status: 'fail',
                data: null,
                message: 'Synthesis module already exists',
            });
            return;
        }
    }
    const modun = await Modun.create({
        ...req.body,
    });
    res.status(200).send({
        status: 'success',
        data: modun,
        message: null,
    });
};

//[GET] modun/:id/edit
const getUpdate = async (req, res) => {
    const modun = await Modun.findOne({
        where: {
            mo_dun_id: req.params.id,
        },
    });
    res.status(200).send({
        status: 'success',
        data: modun,
        message: null,
    });
};

//[PUT] modun/:id
const putUpdate = async (req, res) => {
    if (req.body.loai_tong_hop == 'true') {
        const modun = await Modun.findOne({
            where: {
                khoa_hoc_id: req.body.khoa_hoc_id,
                loai_tong_hop: true,
            },
        });
        if (modun) {
            res.send({
                status: 'fail',
                data: null,
                message: 'Synthesis module already exists',
            });
            return;
        }
    }
    if (req.files) {
        const modun = await Modun.findOne({
            where: {
                mo_dun_id: req.params.id,
            },
        });
        if (
            req.files['anh_dai_dien'] &&
            modun.anh_dai_dien &&
            fs.existsSync(`public${modun.anh_dai_dien}`)
        )
            fs.unlinkSync(`public${modun.anh_dai_dien}`);
        if (
            req.files['video_gioi_thieu'] &&
            modun.video_gioi_thieu &&
            fs.existsSync(`public${modun.video_gioi_thieu}`)
        )
            fs.unlinkSync(`public${modun.video_gioi_thieu}`);
    }
    await Modun.update(
        {
            ...req.body,
        },
        {
            where: {
                mo_dun_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[DELETE] modun/:id
const deleteById = async (req, res) => {
    await Modun.update(
        {
            trang_thai: false,
        },
        {
            where: {
                mo_dun_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: 'deleted',
    });
};

//[PATCH] modun/:id/restore
const restore = async (req, res) => {
    await Modun.update(
        {
            trang_thai: true,
        },
        {
            where: {
                mo_dun_id: req.params.id,
            },
        }
    );
    res.status(200).send({
        status: 'success',
        data: null,
        message: null,
    });
};

//[DELETE] modun/:id/force
const forceDelete = async (req, res) => {
    const modun = await Modun.findOne({
        where: {
            mo_dun_id: req.params.id,
        },
    });
    if (modun.anh_dai_dien && fs.existsSync(`public${modun.anh_dai_dien}`))
        fs.unlinkSync(`public${modun.anh_dai_dien}`);
    if (
        modun.video_gioi_thieu &&
        fs.existsSync(`public${modun.video_gioi_thieu}`)
    )
        fs.unlinkSync(`public${modun.video_gioi_thieu}`);
    await Modun.destroy({
        where: {
            mo_dun_id: req.params.id,
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
    getAllv2,
    getTeaching,
    getById,
    getByFilter,
    getStatistical,
    postCreate,
    getUpdate,
    putUpdate,
    deleteById,
    restore,
    forceDelete,
    getByIDCourse,
    getByUserCourse
};
