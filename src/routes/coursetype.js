const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const courseTypeController = require('../controllers/CourseTypeController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 6), tryCatch(courseTypeController.postCreate));
router.put('/:id', authToken, authRole([2], 6), tryCatch(courseTypeController.putUpdate));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(courseTypeController.forceDelete));
router.get('/:id', authToken, authRole([2], 7), tryCatch(courseTypeController.getById));
router.get('/', authToken, authRole([2]), tryCatch(courseTypeController.getAll));

module.exports = router;
