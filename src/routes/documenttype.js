const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const documentTypeController = require('../controllers/DocumentTypeController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 6), tryCatch(documentTypeController.postCreate));
router.put('/:id', authToken, authRole([2], 6), tryCatch(documentTypeController.putUpdate));
router.delete('/:id', authToken, authRole([2], 6), tryCatch(documentTypeController.deleteById));
router.get('/:id', authToken, authRole([2], 7), tryCatch(documentTypeController.getById));
router.get('/', authToken, authRole([2], 7), tryCatch(documentTypeController.getAll));

module.exports = router;
