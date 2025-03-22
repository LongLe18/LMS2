const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const courseController = require('../controllers/CourseController');
const { authToken, authRole } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

router.post(
    '/create', authToken, authRole([2], 6),
    upload.fields([
        { name: 'anh_dai_dien', maxCount: 1 },
        { name: 'video_mo_ta', maxCount: 1 },
    ]),
    tryCatch(courseController.postCreate)
);
router.post(
    '/:id/upload-file-exam', authToken, authRole([2], 6),
    upload.fields([
        { name: 'files', maxCount: 10 },
    ]),
    tryCatch(courseController.uploadFileExams)
);
//router.get('/create', authToken, authRole([2], 6), tryCatch(courseController.getCreate));
router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(courseController.getUpdate));
router.get('/u/:id/exam-set', authToken, tryCatch(courseController.getExamSetByUser));
router.get('/:id/exam-set', authToken, authRole([2], 6), tryCatch(courseController.getExamSet));
router.put(
    '/:id', authToken, authRole([2], 6), 
    upload.fields([
        { name: 'anh_dai_dien', maxCount: 1 },
        { name: 'video_mo_ta', maxCount: 1 },
    ]),
    tryCatch(courseController.putUpdate)
);
router.delete('/:id/exam-set', authToken, authRole([2], 6), tryCatch(courseController.deleteExamSet));
router.delete('/file-exam/:id', authToken, authRole([2], 6), tryCatch(courseController.deleteFileExam));
router.delete('/:id', authToken, authRole([2], 6), tryCatch(courseController.deleteById));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(courseController.forceDelete));
router.patch('/:id/restore', authToken, authRole([2], 6), tryCatch(courseController.restore));
router.get('/statistical', authToken,  authRole([1, 2], 0), tryCatch(courseController.getStatistical));
router.get('/all', tryCatch(courseController.getAll));
router.get('/thematic_user', authToken, tryCatch(courseController.getThematicOfUsers));
router.get('/thematic_user/v2', authToken, tryCatch(courseController.getThematicOfUserv2));
router.get('/news', authToken, tryCatch(courseController.getOfNews));
router.get('/by_program/:id', authToken, tryCatch(courseController.getByIDProgram));
router.get('/by_user/v2/:id', authToken, authRole([1, 2], 0), tryCatch(courseController.getByUserv2));
router.get('/by_user/:id', tryCatch(courseController.getByUser));
//router.get('/user', authToken, tryCatch(courseController.getByUser));
router.get('/filter',tryCatch(courseController.getByFilter));
router.get('/student/list/:id', authToken, authRole([2], 7), tryCatch(courseController.getStudents));
router.post('/add/student/:id', authToken, authRole([2], 6), tryCatch(courseController.addStudent));
router.get('/add/student/list/:id', authToken, authRole([2], 6), tryCatch(courseController.getAddStudents));
router.get('/by-program', tryCatch(courseController.getAllByProgram));
router.get('/:id', tryCatch(courseController.getById));
router.get('/', tryCatch(courseController.getAll));

module.exports = router;
