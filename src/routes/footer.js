const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const footerController = require('../controllers/FooterController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 0), tryCatch(footerController.postCreate));
router.put('/:id', authToken, authRole([2], 0), tryCatch(footerController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(footerController.deleteById));
router.get('/:id', tryCatch(footerController.getById));
router.get('/', tryCatch(footerController.getAll));

module.exports = router;