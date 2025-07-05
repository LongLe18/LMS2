const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const courseController = require('../controllers/course.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('course:create'),
    upload.fields([
        { name: 'anh_dai_dien', maxCount: 1 },
        { name: 'video_mo_ta', maxCount: 1 },
    ]),
    tryCatch(courseController.create)
);
router.post(
    '/:id/upload-file-exam',
    authToken,
    permission('examSet:update'),
    upload.fields([
        { name: 'files', maxCount: 1 },
        { name: 'file_review', maxCount: 1 },
    ]),
    tryCatch(courseController.uploadFileExams)
);
router.get(
    '/exam-set/review/:id',
    authToken,
    tryCatch(courseController.getReviewExamSet)
);
router.get(
    '/exam-set/download/:id',
    authToken,
    tryCatch(courseController.downloadExamSet)
);
router.get(
    '/u/:id/exam-set',
    authToken,
    tryCatch(courseController.getExamSetByUser)
);
router.get(
    '/:id/exam-set',
    authToken,
    permission('examSet:findOne'),
    tryCatch(courseController.getExamSet)
);
router.get('/:id/exam-set/v2', tryCatch(courseController.getExamSetv2));
router.get(
    '/exam-set/:khttId/student/list',
    authToken,
    // permission('examSet:studentList'),
    tryCatch(courseController.getStudentsv2)
);
router.delete(
    '/exam-set/:id/student/:studentId',
    authToken,
    permission('examSet:removeStudent'),
    tryCatch(courseController.removeStudent)
);
router.put(
    '/exam-set/:id',
    authToken,
    permission('examSet:update'),
    tryCatch(courseController.updateExamSet)
);
router.put(
    '/:id',
    authToken,
    permission('course:update'),
    upload.fields([
        { name: 'anh_dai_dien', maxCount: 1 },
        { name: 'video_mo_ta', maxCount: 1 },
    ]),
    tryCatch(courseController.update)
);
router.delete(
    '/:id/exam-set',
    authToken,
    permission('examSet:remove'),
    tryCatch(courseController.removeExamSet)
);
router.delete(
    '/file-exam/:id',
    authToken,
    permission('examSet:remove'),
    tryCatch(courseController.removeFileExam)
);
router.delete(
    '/:id',
    authToken,
    permission('course:update'),
    tryCatch(courseController.remove)
);
router.delete(
    '/:id/force',
    authToken,
    permission('course:remove'),
    tryCatch(courseController.forceDelete)
);
router.patch(
    '/:id/restore',
    authToken,
    permission('course:update'),
    tryCatch(courseController.restore)
);
router.get(
    '/statistical',
    authToken,
    permission('course:statistical'),
    tryCatch(courseController.getStatistical)
);
router.get('/all', tryCatch(courseController.findAll));
router.get(
    '/thematic_user',
    authToken,
    tryCatch(courseController.getThematicOfUsers)
);
router.get(
    '/thematic_user/v2',
    authToken,
    tryCatch(courseController.getThematicOfUserv2)
);
router.get('/news', authToken, tryCatch(courseController.getOfNews));
router.get(
    '/by_program/:id',
    authToken,
    tryCatch(courseController.getByProgramId)
);
router.get(
    '/by_user/v2/:id',
    authToken,
    tryCatch(courseController.getByUserv2)
);
router.get('/by_user/:id', tryCatch(courseController.getByUser));
router.get('/filter', tryCatch(courseController.getByFilter));
router.get(
    '/student/list/:id',
    authToken,
    permission('course:studentList'),
    tryCatch(courseController.getStudents)
);
router.post(
    '/add/student/:id',
    authToken,
    authRole([2], 6),
    permission('course:addStudent'),
    tryCatch(courseController.addStudent)
);
router.get(
    '/add/student/list/:id',
    authToken,
    permission('course:studentList'),
    tryCatch(courseController.getAddStudents)
);
router.get('/by-program', tryCatch(courseController.getAllByProgram));
router.get(
    '/dashboard-by-teacher',
    authToken,
    tryCatch(courseController.dashboardByTeacher)
);
router.get('/by-teacher', authToken, tryCatch(courseController.findAllv2));
router.get('/:id', tryCatch(courseController.findOne));
router.get('/', tryCatch(courseController.findAll));

module.exports = router;
