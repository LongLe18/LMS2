const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const dgnlCriteriaController = require('../controllers/DGNLCriteriaController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 6), tryCatch(dgnlCriteriaController.postCreate));
router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(dgnlCriteriaController.getUpdate));
router.put('/:id', authToken, authRole([2], 6), tryCatch(dgnlCriteriaController.putUpdate));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(dgnlCriteriaController.forceDelete));
router.get('/all_admin', authToken, authRole([2], 7), tryCatch(dgnlCriteriaController.getAll_admin));
router.get('/:id/quantity-exam-publish', authToken, authRole([2], 7), tryCatch(dgnlCriteriaController.getQuantityExamPublish));
router.get('/by_course/:id', authToken, tryCatch(dgnlCriteriaController.getByCourse));
router.get('/:id', tryCatch(dgnlCriteriaController.getById));

module.exports = router;
