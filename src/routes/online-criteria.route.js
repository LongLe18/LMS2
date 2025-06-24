const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const OnlineCriteriaController = require('../controllers/online-criteria.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('onlineCriteria:create'),
    tryCatch(OnlineCriteriaController.create)
);
// router.get(
//     '/:id/edit',
//     authToken,
//     permission('onlineCriteria:create'),
//     tryCatch(OnlineCriteriaController.getUpdate)
// );
router.put(
    '/:id',
    authToken,
    permission('onlineCriteria:update'),
    tryCatch(OnlineCriteriaController.update)
);
router.delete(
    '/:id/force',
    authToken,
    permission('onlineCriteria:remove'),
    tryCatch(OnlineCriteriaController.remove)
);
router.get(
    '/all_admin',
    authToken,
    permission('onlineCriteria:findAll'),
    tryCatch(OnlineCriteriaController.findAll)
);
router.get(
    '/:id/quantity-exam-publish',
    authToken,
    permission('onlineCriteria:getQuantityExamPublish'),
    tryCatch(OnlineCriteriaController.getQuantityExamPublish)
);
router.get(
    '/by_course/:id',
    authToken,
    tryCatch(OnlineCriteriaController.getByCourse)
);
router.get('/check', tryCatch(OnlineCriteriaController.checkCriteria));
router.get('/:id', tryCatch(OnlineCriteriaController.findOne));

module.exports = router;
