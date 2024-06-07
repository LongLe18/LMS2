const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const examTypeController = require('../controllers/ExamTypeController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 6), tryCatch(examTypeController.postCreate));
router.put('/:id', authToken, authRole([2], 6), tryCatch(examTypeController.putUpdate));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(examTypeController.forceDelete));
router.get('/:id', authToken, authRole([2], 7), tryCatch(examTypeController.getById));
router.get('/', authToken, authRole([2]), tryCatch(examTypeController.getAll));

module.exports = router;
