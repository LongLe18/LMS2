const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const evaluateController = require('../controllers/EvaluateController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 0), tryCatch(evaluateController.postCreate));
router.put('/:id', authToken, authRole([2], 0), tryCatch(evaluateController.putUpdate));
router.delete('/:id', authToken, authRole([2], 0), tryCatch(evaluateController.deleteById));
router.get('/download', authToken, tryCatch(evaluateController.download));
router.get('/:id', authToken, tryCatch(evaluateController.getById));
router.get('/', authToken, tryCatch(evaluateController.getAll));

module.exports = router;
