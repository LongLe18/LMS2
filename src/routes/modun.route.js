const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const modunController = require('../controllers/modun.controller');
const { upload } = require('../middlewares/upload.middleware');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('modun:create'),
    upload.fields([
        { name: 'anh_dai_dien', maxCount: 1 },
        { name: 'video_gioi_thieu', maxCount: 1 },
    ]),
    tryCatch(modunController.create)
);
//router.get('/create', authToken, permission('modun:create'), tryCatch(modunController.getCreate));
router.put(
    '/:id',
    authToken,
    permission('modun:update'),
    upload.fields([
        { name: 'anh_dai_dien', maxCount: 1 },
        { name: 'video_gioi_thieu', maxCount: 1 },
    ]),
    tryCatch(modunController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('modun:update'),
    tryCatch(modunController.deleteById)
);
router.delete(
    '/:id/force',
    authToken,
    permission('modun:remove'),
    tryCatch(modunController.remove)
);
router.patch(
    '/:id/restore',
    authToken,
    permission('modun:update'),
    tryCatch(modunController.restore)
);
router.get('/filter', tryCatch(modunController.getByFilter));
router.get('/teaching', authToken, tryCatch(modunController.getTeaching));
router.get(
    '/user/course/:id',
    authToken,
    tryCatch(modunController.getByUserCourse)
);
router.get('/v2', tryCatch(modunController.getAllv2));
router.get('/by_course/:id', tryCatch(modunController.getByCourseId));
router.get('/statistical/:id', tryCatch(modunController.getStatistical));
router.get(
    '/by-teacher',
    authToken,
    tryCatch(modunController.findAllv2)
);
router.get(
    '/:id',
    authToken,
    permission('modun:findOne'),
    tryCatch(modunController.findOne)
);
router.get(
    '/',
    authToken,
    permission('modun:findAll'),
    tryCatch(modunController.findAll)
);

module.exports = router;
