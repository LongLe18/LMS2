const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const examSetStudentController = require('../controllers/ExamSetStudentController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('', authToken, authRole([2], 0), tryCatch(examSetStudentController.postCreate));
router.put('/:id', authToken, authRole([2], 0), tryCatch(examSetStudentController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(examSetStudentController.deleteById));
router.get('/u', authToken, tryCatch(examSetStudentController.getAllByUser));
router.get('/:id', authToken, tryCatch(examSetStudentController.getById));
router.get('/', authToken, authRole([2], 0), tryCatch(examSetStudentController.getAll));

module.exports = router;