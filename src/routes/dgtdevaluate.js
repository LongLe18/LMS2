const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const dgtdEvaluateController = require('../controllers/DGTDEvaluateController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 0), tryCatch(dgtdEvaluateController.postCreate));
router.put('/:id', authToken, authRole([2], 0), tryCatch(dgtdEvaluateController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(dgtdEvaluateController.deleteById));
router.get('/:id/export-report', authToken, tryCatch(dgtdEvaluateController.download));
router.get('/:id', authToken, tryCatch(dgtdEvaluateController.getById));
router.get('/', authToken, tryCatch(dgtdEvaluateController.getAll));

module.exports = router;
