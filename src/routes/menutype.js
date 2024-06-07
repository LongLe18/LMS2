const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const menuTypeController = require('../controllers/MenuTypeController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 0), tryCatch(menuTypeController.postCreate));
router.put('/:id', authToken, authRole([2], 0), tryCatch(menuTypeController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(menuTypeController.deleteById));
router.get('/:id', authToken, authRole([2], 1), tryCatch(menuTypeController.getById));
router.get('/', authToken, authRole([2], 1), tryCatch(menuTypeController.getAll));

module.exports = router;
