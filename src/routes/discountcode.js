const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const discountCodeController = require('../controllers/DiscountCodeController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 4), tryCatch(discountCodeController.postCreate));
router.put('/:id', authToken, authRole([2], 4), tryCatch(discountCodeController.putUpdate));
router.delete('/:id', authToken, authRole([2], 4), tryCatch(discountCodeController.deleteById));
router.get('/state-change/:id', authToken, authRole([2], 4), tryCatch(discountCodeController.stateChange));
router.get('/by_course/:id', tryCatch(discountCodeController.getByCourse));
router.get('/:id', authToken, authRole([2], 5), tryCatch(discountCodeController.getById));
router.get('/', authToken, authRole([2], 5), tryCatch(discountCodeController.getAll));

module.exports = router;
