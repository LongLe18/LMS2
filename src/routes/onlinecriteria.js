const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const OnlineCriteriaController = require('../controllers/OnlineCriteriaController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 6), tryCatch(OnlineCriteriaController.postCreate));
router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(OnlineCriteriaController.getUpdate));
router.put('/:id', authToken, authRole([2], 6), tryCatch(OnlineCriteriaController.putUpdate));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(OnlineCriteriaController.forceDelete));
router.get('/dgnl', authToken, authRole([2], 7), tryCatch(OnlineCriteriaController.getAll_adminv2));
router.get('/all_admin', authToken, authRole([2], 7), tryCatch(OnlineCriteriaController.getAll_admin));
router.get('/:id/quantity-exam-publish', authToken, authRole([2], 7), tryCatch(OnlineCriteriaController.getQuantityExamPublish));
router.get('/by_course/:id', authToken, tryCatch(OnlineCriteriaController.getByCourse));
router.get('/:id', tryCatch(OnlineCriteriaController.getById));

module.exports = router;
