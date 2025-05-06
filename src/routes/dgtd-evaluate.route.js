const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const dgtdEvaluateController = require('../controllers/dgtd-evaluate.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('dgtdEvaluate:create'),
    tryCatch(dgtdEvaluateController.create)
);
router.put(
    '/:id',
    authToken,
    permission('dgtdEvaluate:update'),
    tryCatch(dgtdEvaluateController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('dgtdEvaluate:remove'),
    tryCatch(dgtdEvaluateController.remove)
);
router.get(
    '/:id/export-report',
    authToken,
    tryCatch(dgtdEvaluateController.download)
);
router.get('/:id', authToken, tryCatch(dgtdEvaluateController.findOne));
router.get('/', authToken, tryCatch(dgtdEvaluateController.findAll));

module.exports = router;
