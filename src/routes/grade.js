const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const gradeController = require('../controllers/GradeController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 6), tryCatch(gradeController.postCreate));
router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(gradeController.getUpdate));
router.put('/:id', authToken, authRole([2], 6), tryCatch(gradeController.putUpdate));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(gradeController.forceDelete));
router.get('/:id', tryCatch(gradeController.getById));
router.get('/',  tryCatch(gradeController.getAll));

module.exports = router;
