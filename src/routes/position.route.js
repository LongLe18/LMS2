const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const positionController = require('../controllers/position.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('position:create'),
    tryCatch(positionController.create)
);
router.put(
    '/:id',
    authToken,
    permission('position:update'),
    tryCatch(positionController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('position:remove'),
    tryCatch(positionController.remove)
);
router.get('/:id', tryCatch(positionController.findOne));
router.get('/', tryCatch(positionController.findAll));

module.exports = router;
