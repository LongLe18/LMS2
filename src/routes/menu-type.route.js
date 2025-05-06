const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const menuTypeController = require('../controllers/menu-type.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('menuType:create'),
    tryCatch(menuTypeController.create)
);
router.put(
    '/:id',
    authToken,
    permission('menuType:update'),
    tryCatch(menuTypeController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('menuType:remove'),
    tryCatch(menuTypeController.remove)
);
router.get(
    '/:id',
    authToken,
    permission('menuType:findOne'),
    tryCatch(menuTypeController.findOne)
);
router.get(
    '/',
    authToken,
    permission('menuType:findAll'),
    tryCatch(menuTypeController.findAll)
);

module.exports = router;
