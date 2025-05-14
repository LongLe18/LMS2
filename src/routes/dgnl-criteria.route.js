const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const dgnlCriteriaController = require('../controllers/dgnl-criteria.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('dgnlCriteria:create'),
    tryCatch(dgnlCriteriaController.create)
);
router.put(
    '/:id',
    authToken,
    permission('dgnlCriteria:update'),
    tryCatch(dgnlCriteriaController.update)
);
router.delete(
    '/:id/force',
    authToken,
    permission('dgnlCriteria:remove'),
    tryCatch(dgnlCriteriaController.remove)
);
router.get(
    '/all_admin',
    authToken,
    permission('dgnlCriteria:findAll'),
    tryCatch(dgnlCriteriaController.findAll)
);
router.get(
    '/:id/quantity-exam-publish',
    authToken,
    permission('dgnlCriteria:findOne'),
    tryCatch(dgnlCriteriaController.getQuantityExamPublish)
);
router.get(
    '/by_course/:id',
    authToken,
    tryCatch(dgnlCriteriaController.getByCourse)
);
router.get('/:id', tryCatch(dgnlCriteriaController.findOne));

module.exports = router;
