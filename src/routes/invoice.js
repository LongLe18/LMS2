const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const invoiceController = require('../controllers/InvoiceController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, tryCatch(invoiceController.postCreate));
router.put('/:id',  authToken, authRole([2], 4),tryCatch(invoiceController.putUpdate));
router.delete('/:id', authToken, tryCatch(invoiceController.deleteById));
router.put('/state-change/:id', authToken, authRole([2], 4), tryCatch(invoiceController.stateChange));
router.get('/:id', authToken, tryCatch(invoiceController.getById));
router.get('/', authToken, tryCatch(invoiceController.getAll));

module.exports = router;
