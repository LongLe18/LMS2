const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const detailedDiscountController = require('../controllers/DetailedDiscountController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 4), tryCatch(detailedDiscountController.postCreate));
router.put('/:id', authToken, tryCatch(detailedDiscountController.putUpdate));
router.delete('/:id', authToken, authRole([2], 4), tryCatch(detailedDiscountController.deleteById));
router.post('/delete/list', authToken, authRole([2], 4), tryCatch(detailedDiscountController.deleteList));
router.post('/change-state', authToken, authRole([2], 4), tryCatch(detailedDiscountController.changeState));
router.get('/check-code', authToken, tryCatch(detailedDiscountController.checkCode));
router.get('/user', authToken, authRole([1], 5), tryCatch(detailedDiscountController.getDetailByUser));
router.get('/:id', authToken, authRole([2], 5), tryCatch(detailedDiscountController.getById));
router.get('/', authToken, authRole([2], 5), tryCatch(detailedDiscountController.getAll));

module.exports = router;
