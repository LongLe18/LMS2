const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const discountCodeController = require('../controllers/discount-code.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('discountCode:create'),
    tryCatch(discountCodeController.create)
);
router.put(
    '/:id',
    authToken,
    permission('discountCode:update'),
    tryCatch(discountCodeController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('discountCode:remove'),
    tryCatch(discountCodeController.remove)
);
router.get(
    '/state-change/:id',
    authToken,
    permission('discountCode:update'),
    tryCatch(discountCodeController.stateChange)
);
router.get('/by_course/:id', tryCatch(discountCodeController.getByCourse));
router.get(
    '/:id',
    authToken,
    permission('discountCode:findOne'),
    tryCatch(discountCodeController.findOne)
);
router.get(
    '/',
    authToken,
    permission('discountCode:findAll'),
    tryCatch(discountCodeController.findAll)
);

module.exports = router;
