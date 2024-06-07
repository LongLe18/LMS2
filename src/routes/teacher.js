const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const teacherController = require('../controllers/TeacherController');
const { upload } = require('../middlewares/upload');
const { authToken, authRole } = require('../middlewares/auth');

router.post(
    '/create', authToken, authRole([2], 2), 
    upload.single('anh_dai_dien'),
    tryCatch(teacherController.postCreate)
);
//router.get('/create', authToken, authRole([2], 2), tryCatch(teacherController.getCreate));
router.get('/:id/edit', authToken, authRole([2], 2), tryCatch(teacherController.getUpdate));
router.put(
    '/:id', authToken, authRole([1, 2], 2), 
    upload.single('anh_dai_dien'),
    tryCatch(teacherController.putUpdate)
);
router.get('/change-state/:id', authToken, authRole([2], 2), tryCatch(teacherController.stateChange));
router.delete('/:id/force', authToken, authRole([2], 2), tryCatch(teacherController.forceDelete));
router.get('/dealer/user', authToken, authRole([1], 5), tryCatch(teacherController.getDealerUser));
router.get('/dealers', authToken, authRole([1, 2], 5), tryCatch(teacherController.getDealers));
router.get('/statistical', authToken, authRole([1, 2], 0), tryCatch(teacherController.getStatistical));
router.get('/:id', authToken, tryCatch(teacherController.getById));
router.get('/', authToken, tryCatch(teacherController.getAll));

module.exports = router;
