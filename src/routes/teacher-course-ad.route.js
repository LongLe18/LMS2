const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const teacherCourseAdController = require('../controllers/teacher-course-ad.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('teacherCourseAd:create'),
    upload.single('anh_dai_dien'),
    tryCatch(teacherCourseAdController.create)
);
router.put(
    '/:id',
    authToken,
    permission('teacherCourseAd:update'),
    upload.single('anh_dai_dien'),
    tryCatch(teacherCourseAdController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('teacherCourseAd:remove'),
    tryCatch(teacherCourseAdController.remove)
);
router.get(
    '/change-state/:id',
    authToken,
    permission('teacherCourseAd:update'),
    tryCatch(teacherCourseAdController.stateChange)
);
router.get('/:id', tryCatch(teacherCourseAdController.findOne));
router.get('/', tryCatch(teacherCourseAdController.findAll));

module.exports = router;
