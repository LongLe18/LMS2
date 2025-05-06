const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const payment = require('../services/vnpay.service');

router.post('/vnpay_create', tryCatch(payment.createPayment));
router.get('/vnpay_return', tryCatch(payment.vnpayReturn));
router.get('/vnpay_ipn', tryCatch(payment.vnpayIPN));

module.exports = router;
