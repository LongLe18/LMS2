const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const permissionController = require('../controllers/PermissionController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 0), tryCatch(permissionController.postCreate));
router.put('/:id', authToken, authRole([2], 0), tryCatch(permissionController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(permissionController.deleteById));
router.get('/:id', tryCatch(permissionController.getById));
router.get('/', tryCatch(permissionController.getAll));

module.exports = router;