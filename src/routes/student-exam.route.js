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
router.get('/:id', authToken, tryCatch(studentExamController.findOne));
router.get('/', authToken, tryCatch(studentExamController.findAll));

module.exports = router;
