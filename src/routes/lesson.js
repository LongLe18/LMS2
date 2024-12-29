const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const lessonController = require('../controllers/LessonController');
const {
    upload,
    uploadToMinio,
    uploadMultipleToMinio,
} = require('../middlewares/upload6');
const { authToken, authRole } = require('../middlewares/auth');

router.post(
    '/create',
    authToken,
    authRole([2], 6),
    upload.fields([{ name: 'link_bai_giang', maxCount: 1 }]),
    uploadMultipleToMinio,
    tryCatch(lessonController.postCreate)
);
router.post(
    '/upload_videos',
    authToken,
    authRole([2], 6),
    upload.fields([{ name: 'video', maxCount: 10 }]),
    uploadMultipleToMinio,
    tryCatch(lessonController.uploadVideos)
);
router.get(
    '/create',
    authToken,
    authRole([2], 6),
    tryCatch(lessonController.getCreate)
);
router.get(
    '/:id/edit',
    authToken,
    authRole([2], 6),
    tryCatch(lessonController.getUpdate)
);
router.put(
    '/:id',
    authToken,
    authRole([2], 6),
    upload.fields([{ name: 'link_bai_giang', maxCount: 1 }]),
    uploadMultipleToMinio,
    tryCatch(lessonController.putUpdate)
);
router.delete(
    '/:id',
    authToken,
    authRole([2], 6),
    tryCatch(lessonController.deleteById)
);
router.delete(
    '/:id/force',
    authToken,
    authRole([2], 6),
    tryCatch(lessonController.forceDelete)
);
router.patch(
    '/:id/restore',
    authToken,
    authRole([2], 6),
    tryCatch(lessonController.restore)
);
//router.get('/all', authToken, tryCatch(lessonController.getAllv2));
router.get(
    '/filter',
    authToken,
    authRole([2]),
    tryCatch(lessonController.getByFilter)
);
router.get(
    '/by_thematic/:id',
    authToken,
    tryCatch(lessonController.getByIDThematic)
);
router.get('/:id', authToken, tryCatch(lessonController.getById)); // không sử dụng
router.get('/', authToken, tryCatch(lessonController.getAll)); //

module.exports = router;
