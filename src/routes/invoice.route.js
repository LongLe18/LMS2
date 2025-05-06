const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const invoiceController = require('../controllers/invoice.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post('/create', authToken, tryCatch(invoiceController.create));
router.put(
    '/:id',
    authToken,
    permission('invoice:update'),
    tryCatch(invoiceController.update)
);
router.delete('/:id', authToken, tryCatch(invoiceController.remove));
router.put(
    '/state-change/:id',
    authToken,
    permission('invoice:update'),
    tryCatch(invoiceController.stateChange)
);
router.get('/:id', authToken, tryCatch(invoiceController.findOne));
router.get('/', authToken, tryCatch(invoiceController.findAll));

module.exports = router;
