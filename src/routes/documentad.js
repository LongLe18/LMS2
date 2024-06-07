const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const documentAdController = require('../controllers/DocumentAdController');
const { authToken, authRole } = require('../middlewares/auth');
const {upload}= require('../middlewares/upload');

router.post('/create', authToken, authRole([2], 0), upload.single('anh_dai_dien'), tryCatch(documentAdController.postCreate));
router.put('/:id', authToken, authRole([2], 0), upload.single('anh_dai_dien'), tryCatch(documentAdController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(documentAdController.deleteById));
router.get('/change-state/:id', authToken, authRole([2], 0), tryCatch(documentAdController.stateChange));
router.get('/:id', tryCatch(documentAdController.getById));
router.get('/', tryCatch(documentAdController.getAll));

module.exports = router;
