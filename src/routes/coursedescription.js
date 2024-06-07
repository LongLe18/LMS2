const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const courseDescriptionController = require('../controllers/CourseDescriptionController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 6), tryCatch(courseDescriptionController.postCreate));
router.put('/:id', authToken, authRole([2], 6), tryCatch(courseDescriptionController.putUpdate));
router.delete('/:id', authToken, authRole([2], 6), tryCatch(courseDescriptionController.deleteById));
router.get('/:id', tryCatch(courseDescriptionController.getById));
router.get('/', tryCatch(courseDescriptionController.getAll));

module.exports = router;
