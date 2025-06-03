const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const lessonController = require('../controllers/lesson.controller');
const { upload } = require('../middlewares/upload.middleware');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('lesson:create'),
    upload.single('link_bai_giang'),
    tryCatch(lessonController.create)
);
router.post(
    '/upload_videos',
    authToken,
    permission('lesson:update'),
    upload.array('video', 10),
    tryCatch(lessonController.uploadVideos)
);
router.get(
    '/:id/edit',
    authToken,
    permission('lesson:findOne'),
    tryCatch(lessonController.getUpdate)
);
router.put(
    '/:id',
    authToken,
    permission('lesson:update'),
    upload.single('link_bai_giang'),
    tryCatch(lessonController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('lesson:update'),
    tryCatch(lessonController.deleteById)
);
router.delete(
    '/:id/force',
    authToken,
    permission('lesson:remove'),
    tryCatch(lessonController.remove)
);
router.patch(
    '/:id/restore',
    authToken,
    permission('lesson:update'),
    tryCatch(lessonController.restore)
);
//router.get('/all', authToken, tryCatch(lessonController.getAllv2));
router.get(
    '/filter',
    authToken,
    permission('lesson:findAll'),
    tryCatch(lessonController.getByFilter)
);
router.get(
    '/by_thematic/:id',
    authToken,
    tryCatch(lessonController.getByThematicId)
);
router.get('/by-teacher', authToken, tryCatch(lessonController.findAllv2)); //
router.get('/:id', authToken, tryCatch(lessonController.findOne)); // không sử dụng
router.get('/', authToken, tryCatch(lessonController.findAll)); //

module.exports = router;
