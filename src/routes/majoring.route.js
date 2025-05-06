const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const majoringController = require('../controllers/majoring.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('majoring:create'),
    tryCatch(majoringController.create)
);
router.put(
    '/:id',
    authToken,
    permission('majoring:update'),
    tryCatch(majoringController.update)
);
router.delete(
    '/:id/force',
    authToken,
    permission('majoring:remove'),
    tryCatch(majoringController.remove)
);
router.get(
    '/:id',
    authToken,
    permission('majoring:findOne'),
    tryCatch(majoringController.findOne)
);
router.get('/', authToken, tryCatch(majoringController.findAll));

module.exports = router;
