const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const dealerDiscountController = require('../controllers/DealerDiscountController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 4), tryCatch(dealerDiscountController.postCreate));
router.put('/:id', authToken, authRole([2], 4), tryCatch(dealerDiscountController.putUpdate));
router.delete('/:id', authToken, authRole([2], 4), tryCatch(dealerDiscountController.deleteById));
router.get('/state_change/:id', authToken, authRole([2], 4), tryCatch(dealerDiscountController.stateChange));
router.get('/by_dealer/:id', authToken, authRole([2], 5), tryCatch(dealerDiscountController.getDealerByAdmin));
router.get('/:id/v2', authToken, authRole([2], 5), tryCatch(dealerDiscountController.getByIdv2));
router.get('/:id', authToken, authRole([2], 5), tryCatch(dealerDiscountController.getById));
router.get('/', authToken, authRole([2], 5), tryCatch(dealerDiscountController.getAll));

module.exports = router;
