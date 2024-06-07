const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const selectedAnswerController = require('../controllers/SelectedAnswerController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, tryCatch(selectedAnswerController.postCreate));
router.put('/:id', authToken, tryCatch(selectedAnswerController.putUpdate));
router.delete('/:id/force', authToken, tryCatch(selectedAnswerController.forceDelete));
router.get('/:id', authToken, tryCatch(selectedAnswerController.getById));
router.get('/', authToken, tryCatch(selectedAnswerController.getAll));

module.exports = router;
