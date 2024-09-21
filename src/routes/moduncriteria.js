const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const modunCriteriaController = require('../controllers/ModunCriteriaController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 6), tryCatch(modunCriteriaController.postCreate));
router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(modunCriteriaController.getUpdate));
router.put('/:id', authToken, authRole([2], 6), tryCatch(modunCriteriaController.putUpdate));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(modunCriteriaController.forceDelete));
router.get('/all_admin', authToken, authRole([2], 7), tryCatch(modunCriteriaController.getAll_admin));
router.get('/:id/quantity-exam-publish', authToken, authRole([2], 7), tryCatch(modunCriteriaController.getQuantityExamPublish));
router.get('/by_modun/:id', tryCatch(modunCriteriaController.getByModun));
router.get('/:id', authToken, authRole([2], 7), tryCatch(modunCriteriaController.getById));

module.exports = router;
