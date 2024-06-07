const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const syntheticCriteriaController = require('../controllers/SyntheticCriteriaController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 6), tryCatch(syntheticCriteriaController.postCreate));
router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(syntheticCriteriaController.getUpdate));
router.put('/:id', authToken, authRole([2], 6), tryCatch(syntheticCriteriaController.putUpdate));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(syntheticCriteriaController.forceDelete));
router.get('/all_admin', authToken, authRole([2], 7), tryCatch(syntheticCriteriaController.getAll_admin));
router.get('/by_course/:id', authToken, tryCatch(syntheticCriteriaController.getByCourse));
router.get('/:id', tryCatch(syntheticCriteriaController.getById));

module.exports = router;
