const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const dealerDiscountController = require('../controllers/dealer-discount.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware')

router.post(
    '/create',
    authToken,
    permission('dealerDiscount:create'),
    tryCatch(dealerDiscountController.create)
);
router.put(
    '/:id',
    authToken,
    permission('dealerDiscount:update'),
    tryCatch(dealerDiscountController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('dealerDiscount:remove'),
    tryCatch(dealerDiscountController.remove)
);
router.get(
    '/state_change/:id',
    authToken,
    permission('dealerDiscount:update'),
    tryCatch(dealerDiscountController.stateChange)
);
router.get(
    '/by_dealer/:id',
    authToken,
    permission('dealerDiscount:findAll'),
    tryCatch(dealerDiscountController.getDealerByAdmin)
);
router.get(
    '/:id/v2',
    authToken,
    permission('dealerDiscount:findOne'),
    tryCatch(dealerDiscountController.findOnev2)
);
router.get(
    '/:id',
    authToken,
    permission('dealerDiscount:findOne'),
    tryCatch(dealerDiscountController.findOne)
);
router.get(
    '/',
    authToken,
    permission('dealerDiscount:findAll'),
    tryCatch(dealerDiscountController.findAll)
);

module.exports = router;
