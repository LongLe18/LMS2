const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const syntheticCriteriaController = require('../controllers/synthetic-criteria.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('syntheticCriteria:create'),
    tryCatch(syntheticCriteriaController.create)
);
// router.get(
//     '/:id/edit',
//     authToken,
//     permission('syntheticCriteria:create'),
//     tryCatch(syntheticCriteriaController.getUpdate)
// );
router.put(
    '/:id',
    authToken,
    permission('syntheticCriteria:update'),
    tryCatch(syntheticCriteriaController.update)
);
router.delete(
    '/:id/force',
    authToken,
    permission('syntheticCriteria:remove'),
    tryCatch(syntheticCriteriaController.remove)
);
router.get(
    '/all_admin',
    authToken,
    permission('syntheticCriteria:findAll'),
    tryCatch(syntheticCriteriaController.findAll)
);
router.get(
    '/:id/quantity-exam-publish',
    authToken,
    permission('syntheticCriteria:getQuantityExamPublish'),
    tryCatch(syntheticCriteriaController.getQuantityExamPublish)
);
router.get(
    '/by_course/:id',
    authToken,
    tryCatch(syntheticCriteriaController.getByCourse)
);
router.get('/check', tryCatch(syntheticCriteriaController.checkCriteria));
router.get('/:id', tryCatch(syntheticCriteriaController.findOne));

module.exports = router;
