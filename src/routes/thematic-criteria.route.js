const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const thematicCriteriaController = require('../controllers/thematic-criteria.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('thematicCriteria:create'),
    tryCatch(thematicCriteriaController.create)
);
router.put(
    '/:id',
    authToken,
    permission('thematicCriteria:update'),
    tryCatch(thematicCriteriaController.update)
);
router.delete(
    '/:id/force',
    authToken,
    permission('thematicCriteria:remove'),
    tryCatch(thematicCriteriaController.remove)
);
router.get(
    '/all_admin',
    authToken,
    permission('thematicCriteria:findAll'),
    tryCatch(thematicCriteriaController.findAll)
);
router.get(
    '/:id/quantity-exam-publish',
    authToken,
    permission('thematicCriteria:getQuantityExamPublish'),
    tryCatch(thematicCriteriaController.getQuantityExamPublish)
);
router.get(
    '/by_thematic/:id',
    tryCatch(thematicCriteriaController.getByThematic)
);
router.get('/:id', tryCatch(thematicCriteriaController.findOne));

module.exports = router;
