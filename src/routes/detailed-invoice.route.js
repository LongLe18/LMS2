const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const detailedInvoiceController = require('../controllers/detailed-invoice.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post('/create', authToken, tryCatch(detailedInvoiceController.create));
router.put(
    '/:id',
    authToken,
    permission('detailedInvoice:update'),
    tryCatch(detailedInvoiceController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('detailedInvoice:remove'),
    tryCatch(detailedInvoiceController.remove)
);
router.get(
    '/by_user',
    authToken,
    tryCatch(detailedInvoiceController.getByUser)
);
router.get(
    '/by_TxnRef/:TxnRef',
    tryCatch(detailedInvoiceController.getByTxnRef)
);
router.get('/:id', authToken, tryCatch(detailedInvoiceController.findOne));
router.get(
    '/',
    authToken,
    permission('detailedInvoice:findAll'),
    tryCatch(detailedInvoiceController.findAll)
);

module.exports = router;
