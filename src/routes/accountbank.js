const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const accountBankController = require('../controllers/AccountBankController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 0), tryCatch(accountBankController.postCreate));
router.put('/:id', authToken, authRole([2], 0), tryCatch(accountBankController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(accountBankController.deleteById));
router.get('/:id', tryCatch(accountBankController.getById));
router.get('/', tryCatch(accountBankController.getAll));

module.exports = router;