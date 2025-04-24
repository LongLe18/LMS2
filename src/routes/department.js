const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const departmentController = require('../controllers/DepartmentController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 0), tryCatch(departmentController.postCreate));
router.put('/:id', authToken, authRole([2], 0), tryCatch(departmentController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(departmentController.deleteById));
router.get('/:id', tryCatch(departmentController.getById));
router.get('/', tryCatch(departmentController.getAll));

module.exports = router;