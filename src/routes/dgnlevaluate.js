const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const dgnlEvaluateController = require('../controllers/DGNLEvaluateController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 0), tryCatch(dgnlEvaluateController.postCreate));
router.put('/:id', authToken, authRole([2], 0), tryCatch(dgnlEvaluateController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(dgnlEvaluateController.deleteById));
router.get('/:id/export-report', authToken, tryCatch(dgnlEvaluateController.download));
router.get('/:id', authToken, tryCatch(dgnlEvaluateController.getById));
router.get('/', authToken, tryCatch(dgnlEvaluateController.getAll));

module.exports = router;
