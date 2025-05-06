const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const detailedDiscountController = require('../controllers/detailed-discount.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('detailedDiscount:create'),
    tryCatch(detailedDiscountController.create)
);
router.put(
    '/:id',
    authToken,
    permission('detailedDiscount:update'),
    tryCatch(detailedDiscountController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('detailedDiscount:remove'),
    tryCatch(detailedDiscountController.remove)
);
router.post(
    '/delete/list',
    authToken,
    permission('detailedDiscount:remove'),
    tryCatch(detailedDiscountController.deleteList)
);
router.post(
    '/change-state',
    authToken,
    permission('detailedDiscount:update'),
    tryCatch(detailedDiscountController.changeState)
);
router.get(
    '/check-code',
    authToken,
    tryCatch(detailedDiscountController.checkCode)
);
router.get(
    '/user',
    authToken,
    tryCatch(detailedDiscountController.getDetailByUser)
);
router.get(
    '/:id',
    authToken,
    permission('detailedDiscount:findOne'),
    tryCatch(detailedDiscountController.findOne)
);
router.get(
    '/',
    authToken,
    permission('detailedDiscount:findAll'),
    tryCatch(detailedDiscountController.findAll)
);

module.exports = router;
