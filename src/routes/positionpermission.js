const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const positionPermissionController = require('../controllers/PositionPermissionController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 0), tryCatch(positionPermissionController.postCreate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(positionPermissionController.deleteById));
router.get('/:id', tryCatch(positionPermissionController.getById));
router.get('/', tryCatch(positionPermissionController.getAll));

module.exports = router;