const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const teacherCourseAdController = require('../controllers/TeacherCourseAdController');
const { authToken, authRole } = require('../middlewares/auth');
const {upload}= require('../middlewares/upload');

router.post('/create', authToken, authRole([2], 0), upload.single('anh_dai_dien'), tryCatch(teacherCourseAdController.postCreate));
router.put('/:id', authToken, authRole([2], 0), upload.single('anh_dai_dien'), tryCatch(teacherCourseAdController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(teacherCourseAdController.deleteById));
router.get('/change-state/:id', authToken, authRole([2], 0), tryCatch(teacherCourseAdController.stateChange));
router.get('/:id', tryCatch(teacherCourseAdController.getById));
router.get('/', tryCatch(teacherCourseAdController.getAll));

module.exports = router;
