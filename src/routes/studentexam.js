const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const studentExamController = require('../controllers/StudentExamController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, tryCatch(studentExamController.postCreate));
router.post('/dgnl/create', authToken, tryCatch(studentExamController.postCreateDGNL));
router.post('/dgtd/create', authToken, tryCatch(studentExamController.postCreateDGTD));
router.put('/:id/work-time', authToken, tryCatch(studentExamController.putUpdatev3));
router.put('/:id/dgnl', authToken, tryCatch(studentExamController.putUpdatev2));
router.put('/:id/dgtd', authToken, tryCatch(studentExamController.putUpdateDGTD));
router.put('/:id', authToken, tryCatch(studentExamController.putUpdate));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(studentExamController.forceDelete));
router.delete('/clear/:id', authToken, authRole([2], 6), tryCatch(studentExamController.clearAll));
router.get('/user', authToken, tryCatch(studentExamController.getUser));
router.get('/export-report', authToken, tryCatch(studentExamController.exportReport));
router.get('/dgnl', authToken, tryCatch(studentExamController.getAllDGNL));
router.get('/by-exam', authToken, tryCatch(studentExamController.getByExamId));
router.get('/by-exam-dgnl', authToken, tryCatch(studentExamController.getByExamIdDGNL));
router.get('/:id', authToken, tryCatch(studentExamController.getById));
router.get('/:id', authToken, tryCatch(studentExamController.getById));
router.get('/', authToken, tryCatch(studentExamController.getAll));

module.exports = router;
