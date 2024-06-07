const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const detailedInvoiceController = require('../controllers/DetailedInvoiceController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, tryCatch(detailedInvoiceController.postCreate));
router.put('/:id', authToken, authRole([2], 4), tryCatch(detailedInvoiceController.putUpdate));
router.delete('/:id', authToken, authRole([2], 4), tryCatch(detailedInvoiceController.deleteById));
router.get('/by_user', authToken, tryCatch(detailedInvoiceController.getByUser));
router.get('/by_TxnRef/:TxnRef', tryCatch(detailedInvoiceController.getByTxnRef));
router.get('/:id', authToken, tryCatch(detailedInvoiceController.getById));
router.get('/', authToken, authRole([2], 5), tryCatch(detailedInvoiceController.getAll));

module.exports = router;
