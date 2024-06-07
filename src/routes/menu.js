const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const menuController = require('../controllers/MenuController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 0), tryCatch(menuController.postCreate));
router.put('/:id', authToken, authRole([2], 0), tryCatch(menuController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(menuController.deleteById));
router.get('/:id', tryCatch(menuController.getById));
router.get('/', tryCatch(menuController.getAll));

module.exports = router;
