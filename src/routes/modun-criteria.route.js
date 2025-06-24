const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const modunCriteriaController = require('../controllers/modun-criteria.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('modunCriteria:create'),
    tryCatch(modunCriteriaController.create)
);
// router.get(
//     '/:id/edit',
//     authToken,
//     permission('modunCriteria:create'),
//     tryCatch(modunCriteriaController.getUpdate)
// );
router.put(
    '/:id',
    authToken,
    permission('modunCriteria:update'),
    tryCatch(modunCriteriaController.update)
);
router.delete(
    '/:id/force',
    authToken,
    permission('modunCriteria:remove'),
    tryCatch(modunCriteriaController.remove)
);
router.get(
    '/all_admin',
    authToken,
    permission('modunCriteria:findAll'),
    tryCatch(modunCriteriaController.findAll)
);
router.get(
    '/:id/quantity-exam-publish',
    authToken,
    permission('modunCriteria:getQuantityExamPublish'),
    tryCatch(modunCriteriaController.getQuantityExamPublish)
);
router.get('/by_modun/:id', tryCatch(modunCriteriaController.getByModun));
router.get('/check', tryCatch(modunCriteriaController.checkCriteria));
router.get(
    '/:id',
    authToken,
    permission('modunCriteria:findOne'),
    tryCatch(modunCriteriaController.findOne)
);

module.exports = router;
