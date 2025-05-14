const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const evaluateController = require('../controllers/evaluate.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware')

router.post(
    '/create',
    authToken,
    permission('evaluate:create'),
    tryCatch(evaluateController.create)
);
router.put(
    '/:id',
    authToken,
    permission('evaluate:update'),
    tryCatch(evaluateController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('evaluate:remove'),
    tryCatch(evaluateController.remove)
);
router.get(
    '/:id/export-report',
    authToken,
    tryCatch(evaluateController.download)
);
router.get('/:id', authToken, tryCatch(evaluateController.findOne));
router.get('/', authToken, tryCatch(evaluateController.findAll));

module.exports = router;
