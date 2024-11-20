const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const dgtdCriteriaController = require('../controllers/DGTDCriteriaController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 6), tryCatch(dgtdCriteriaController.postCreate));
router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(dgtdCriteriaController.getUpdate));
router.put('/:id', authToken, authRole([2], 6), tryCatch(dgtdCriteriaController.putUpdate));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(dgtdCriteriaController.forceDelete));
router.get('/all_admin', authToken, authRole([2], 7), tryCatch(dgtdCriteriaController.getAll_admin));
router.get('/:id/quantity-exam-publish', authToken, authRole([2], 7), tryCatch(dgtdCriteriaController.getQuantityExamPublish));
router.get('/by_course/:id', authToken, tryCatch(dgtdCriteriaController.getByCourse));
router.get('/:id', tryCatch(dgtdCriteriaController.getById));

module.exports = router;
