const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const positionController = require('../controllers/PositionController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 0), tryCatch(positionController.postCreate));
router.put('/:id', authToken, authRole([2], 0), tryCatch(positionController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(positionController.deleteById));
router.get('/:id', tryCatch(positionController.getById));
router.get('/', tryCatch(positionController.getAll));

module.exports = router;