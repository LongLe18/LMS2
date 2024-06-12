const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const studentExamController = require('../controllers/StudentExamController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, tryCatch(studentExamController.postCreate));
router.put('/:id', authToken, tryCatch(studentExamController.putUpdate));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(studentExamController.forceDelete));
router.delete('/clear/:id', authToken, authRole([2], 6), tryCatch(studentExamController.clearAll));
router.get('/user', authToken, tryCatch(studentExamController.getUser));
router.get('/:id/export-report', authToken, tryCatch(studentExamController.exportReport));
router.get('/:id', authToken, tryCatch(studentExamController.getById));
router.get('/', authToken, tryCatch(studentExamController.getAll));

module.exports = router;
