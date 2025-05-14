const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const dgnlEvaluateController = require('../controllers/dgnl-evaluate.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('dgnlEvaluate:create'),
    tryCatch(dgnlEvaluateController.create)
);
router.put(
    '/:id',
    authToken,
    permission('dgnlEvaluate:update'),
    tryCatch(dgnlEvaluateController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('dgnlEvaluate:remove'),
    tryCatch(dgnlEvaluateController.remove)
);
router.get(
    '/:id/export-report',
    authToken,
    tryCatch(dgnlEvaluateController.download)
);
router.get('/:id', authToken, tryCatch(dgnlEvaluateController.findOne));
router.get('/', authToken, tryCatch(dgnlEvaluateController.findAll));

module.exports = router;
