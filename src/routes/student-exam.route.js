const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const studentExamController = require('../controllers/student-exam.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post('/create', authToken, tryCatch(studentExamController.create));
router.post(
    '/dgnl/create',
    authToken,
    tryCatch(studentExamController.postCreateDGNL)
);
router.post(
    '/dgtd/create',
    authToken,
    tryCatch(studentExamController.postCreateDGTD)
);
router.put(
    '/:id/work-time',
    authToken,
    tryCatch(studentExamController.putUpdatev3)
);
router.put('/:id/dgnl', authToken, tryCatch(studentExamController.putUpdatev2));
router.put(
    '/:id/dgtd',
    authToken,
    tryCatch(studentExamController.putUpdateDGTD)
);
router.put('/:id', authToken, tryCatch(studentExamController.update));
router.delete(
    '/:id/force',
    authToken,
    permission('studentExam:remove'),
    tryCatch(studentExamController.remove)
);
router.delete(
    '/clear/:id',
    authToken,
    permission('studentExam:remove'),
    tryCatch(studentExamController.clearAll)
);
router.get('/user', authToken, tryCatch(studentExamController.getUser));
router.get(
    '/export-dgnl-v2',
    authToken,
    tryCatch(studentExamController.exportDGNLv2)
);
router.get(
    '/export-dgnl/:id',
    authToken,
    tryCatch(studentExamController.exportDGNL)
);
router.get(
    '/export-test-v2',
    authToken,
    tryCatch(studentExamController.exportTestv2)
);
router.get(
    '/export-test/:id',
    authToken,
    tryCatch(studentExamController.exportTest)
);
router.get(
    '/export-e-learning-v2',
    authToken,
    tryCatch(studentExamController.exportELearningv2)
);
router.get(
    '/export-e-learning/:id',
    authToken,
    tryCatch(studentExamController.exportELearning)
);
router.get(
    '/export-report',
    authToken,
    tryCatch(studentExamController.exportReport)
);
router.get('/dgnl', authToken, tryCatch(studentExamController.getAllDGNL));
router.get('/by-exam', authToken, tryCatch(studentExamController.getByExamId));
router.get(
    '/by-exam-dgnl',
    authToken,
    tryCatch(studentExamController.getByExamIdDGNL)
);
router.get(
    '/dashboard-by-teacher',
    authToken,
    tryCatch(studentExamController.dashBoardByTeacher)
);
router.get(
    '/dashboard-by-course/:id',
    authToken,
    tryCatch(studentExamController.dashBoardByCourse)
);
router.get(
    '/export',
    authToken,
    tryCatch(studentExamController.exportStudentExam)
);
router.get(
    '/student-list/by-online/:id',
    authToken,
    permission('studentExam:studentList'),
    tryCatch(studentExamController.getStudentListByOnline)
);
router.get(
    '/export-student-list/by-online/:id',
    authToken,
    permission('studentExam:exportStudentList'),
    tryCatch(studentExamController.exportStudentListByOnline)
);
router.get(
    '/student-list/by-modun/:id',
    authToken,
    permission('studentExam:studentList'),
    tryCatch(studentExamController.getStudentListByModun)
);
router.get(
    '/export-student-list/by-modun/:id',
    authToken,
    permission('studentExam:exportStudentList'),
    tryCatch(studentExamController.exportStudentListByModun)
);
router.get(
    '/student-list/by-thematic/:id',
    authToken,
    permission('studentExam:studentList'),
    tryCatch(studentExamController.getStudentListByThematic)
);
router.get(
    '/export-student-list/by-thematic/:id',
    authToken,
    permission('studentExam:exportStudentList'),
    tryCatch(studentExamController.exportStudentListByThematic)
);
router.get('/v2', authToken, tryCatch(studentExamController.findAllv2));
router.get('/:id', authToken, tryCatch(studentExamController.findOne));
router.get('/', authToken, tryCatch(studentExamController.findAll));

module.exports = router;
