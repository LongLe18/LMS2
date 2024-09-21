const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const thematicCriteriaController = require('../controllers/ThematicCriteriaController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([2], 6), tryCatch(thematicCriteriaController.postCreate));
router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(thematicCriteriaController.getUpdate));
router.put('/:id', authToken, authRole([2], 6), tryCatch(thematicCriteriaController.putUpdate));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(thematicCriteriaController.forceDelete));
router.get('/all_admin', authToken, authRole([2], 7), tryCatch(thematicCriteriaController.getAll_admin));
router.get('/:id/quantity-exam-publish', authToken, authRole([2], 7), tryCatch(thematicCriteriaController.getQuantityExamPublish));
router.get(
    '/by_thematic/:id',
    tryCatch(thematicCriteriaController.getByThematic)
);
router.get('/:id', tryCatch(thematicCriteriaController.getById));

module.exports = router;
