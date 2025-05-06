const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const menuController = require('../controllers/menu.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('menu:create'),
    tryCatch(menuController.create)
);
router.put(
    '/:id',
    authToken,
    permission('menu:update'),
    tryCatch(menuController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('menu:remove'),
    tryCatch(menuController.remove)
);
router.get('/:id', tryCatch(menuController.findOne));
router.get('/', tryCatch(menuController.findAll));

module.exports = router;
