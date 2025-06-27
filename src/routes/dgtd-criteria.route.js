const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const dgtdCriteriaController = require('../controllers/dgtd-criteria.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('dgtdCriteria:create'),
    tryCatch(dgtdCriteriaController.create)
);
router.put(
    '/:id',
    authToken,
    permission('dgtdCriteria:update'),
    tryCatch(dgtdCriteriaController.update)
);
router.delete(
    '/:id/force',
    authToken,
    permission('dgtdCriteria:remove'),
    tryCatch(dgtdCriteriaController.remove)
);
router.get(
    '/all_admin',
    authToken,
    permission('dgtdCriteria:findAll'),
    tryCatch(dgtdCriteriaController.findAll)
);
router.get(
    '/:id/quantity-exam-publish',
    authToken,
    permission('dgtdCriteria:findOne'),
    tryCatch(dgtdCriteriaController.getQuantityExamPublish)
);
router.get(
    '/by_course/:id',
    authToken,
    tryCatch(dgtdCriteriaController.getByCourse)
);
router.get('/check', tryCatch(dgtdCriteriaController.checkCriteria));
router.get(
    '/v2',
    authToken,
    permission('dgtdCriteria:findAll'),
    tryCatch(dgtdCriteriaController.findAllv2)
);
router.get('/:id', tryCatch(dgtdCriteriaController.findOne));

module.exports = router;
