const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const courseStudentController = require('../controllers/CourseStudentController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 6), tryCatch(courseStudentController.postCreate));
router.put('/:id', authToken, authRole([2], 6), tryCatch(courseStudentController.putUpdate));
router.delete('/:id', authToken, authRole([2], 6), tryCatch(courseStudentController.deleteById));
router.get('/:id', authToken, tryCatch(courseStudentController.getById));
router.get('/',  authToken, authRole([2]), tryCatch(courseStudentController.getAll));

module.exports = router;