const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const provinceController = require('../controllers/ProvinceController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 0), tryCatch(provinceController.postCreate));
router.put('/:id', authToken, authRole([2], 0), tryCatch(provinceController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(provinceController.deleteById));
router.get('/:id', tryCatch(provinceController.getById));
router.get('/', tryCatch(provinceController.getAll));

module.exports = router;