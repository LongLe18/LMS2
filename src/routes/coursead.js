const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const courseAdController = require('../controllers/CourseAdController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 0), tryCatch(courseAdController.postCreate));
router.put('/:id', authToken, authRole([2], 0), tryCatch(courseAdController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(courseAdController.deleteById));
router.get('/change-state/:id', authToken, authRole([2], 0), tryCatch(courseAdController.stateChange));
router.get('/:id', tryCatch(courseAdController.getById));
router.get('/', tryCatch(courseAdController.getAll));

module.exports = router;
