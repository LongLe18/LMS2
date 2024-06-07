const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const modunController = require('../controllers/ModunController');
const { upload } = require('../middlewares/upload');
const { authToken, authRole } = require('../middlewares/auth');

router.post(
    '/create', authToken, authRole([2], 6), 
    upload.fields([
        { name: 'anh_dai_dien', maxCount: 1 },
        { name: 'video_gioi_thieu', maxCount: 1 },
    ]),
    tryCatch(modunController.postCreate)
);
//router.get('/create', authToken, authRole([2], 6), tryCatch(modunController.getCreate));
router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(modunController.getUpdate));
router.put(
    '/:id', authToken, authRole([2], 6), 
    upload.fields([
        { name: 'anh_dai_dien', maxCount: 1 },
        { name: 'video_gioi_thieu', maxCount: 1 },
    ]),
    tryCatch(modunController.putUpdate)
);
router.delete('/:id', authToken, authRole([2], 6), tryCatch(modunController.deleteById));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(modunController.forceDelete));
router.patch('/:id/restore', authToken, authRole([2], 6), tryCatch(modunController.restore));
router.get('/filter', tryCatch(modunController.getByFilter));
router.get('/teaching', authToken, tryCatch(modunController.getTeaching));
router.get('/user/course/:id', authToken, tryCatch(modunController.getByUserCourse));
router.get('/v2', tryCatch(modunController.getAllv2));
router.get('/by_course/:id', tryCatch(modunController.getByIDCourse));
router.get('/statistical/:id', tryCatch(modunController.getStatistical));
router.get('/:id', tryCatch(modunController.getById));
router.get('/', authToken, tryCatch(modunController.getAll));

module.exports = router;
