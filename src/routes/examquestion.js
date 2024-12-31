const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const examQuestionController = require('../controllers/ExamQuestionController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 6), tryCatch(examQuestionController.postCreate));
router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(examQuestionController.getUpdate));
router.put('/:id', authToken, tryCatch(examQuestionController.putUpdate));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(examQuestionController.forceDelete));
router.get('/:id', authToken, tryCatch(examQuestionController.getById));
router.get('/', authToken, authRole([2], 7), tryCatch(examQuestionController.getAll));

module.exports = router;
