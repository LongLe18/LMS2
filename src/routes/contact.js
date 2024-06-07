const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const contactController = require('../controllers/ContactController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 0), tryCatch(contactController.postCreate));
router.put('/:id', authToken, authRole([2], 0), tryCatch(contactController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(contactController.deleteById));
router.get('/:id', tryCatch(contactController.getById));
router.get('/', tryCatch(contactController.getAll));

module.exports = router;