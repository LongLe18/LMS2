const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const provinceController = require('../controllers/province.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('province:create'),
    tryCatch(provinceController.create)
);
router.put(
    '/:id',
    authToken,
    permission('province:update'),
    tryCatch(provinceController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('province:remove'),
    tryCatch(provinceController.remove)
);
router.get('/:id', tryCatch(provinceController.findOne));
router.get('/', tryCatch(provinceController.findAll));

module.exports = router;
