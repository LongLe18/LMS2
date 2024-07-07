const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const studentController = require('../controllers/StudentController');
const { upload } = require('../middlewares/upload');
const { authToken, authRole } = require('../middlewares/auth');

router.post(
    '/create',
    authToken,
    authRole([2], 2),
    upload.single('anh_dai_dien'),
    tryCatch(studentController.postCreate)
);

router.post(
    '/adminCreate',
    authToken,
    authRole([2], 2),
    upload.single('anh_dai_dien'),
    tryCatch(studentController.postCreateAdmin)
);

router.get('/create', authToken, tryCatch(studentController.getCreate));
router.get('/:id/edit', authToken, tryCatch(studentController.getUpdate));
router.put(
    '/:id', authToken,
    upload.single('anh_dai_dien'), 
    tryCatch(studentController.putUpdate)
);
router.get('/change-state/:id', authToken, authRole([2], 2), tryCatch(studentController.stateChange));
router.delete('/:id/force', authToken, authRole([2], 2), tryCatch(studentController.forceDelete));
router.get('/v2', tryCatch(studentController.getAllv2));
router.get('/v3', authToken, tryCatch(studentController.getAllv3));
router.get('/statistical', authToken, tryCatch(studentController.getStatistical));
router.get('/detail_modun', authToken, tryCatch(studentController.getDetail));
router.get('/of_course/:id', tryCatch(studentController.getOfCourse));
router.get('/by_email', tryCatch(studentController.getByEmail));
router.post('/add/course/:id', authToken, authRole([2], 6), tryCatch(studentController.addCourse));
router.get('/list/course', authToken, tryCatch(studentController.getCourseOfUser));
router.get('/:id', authToken, tryCatch(studentController.getById));
router.get('/', authToken, authRole([1, 2]), tryCatch(studentController.getAll));

module.exports = router;
