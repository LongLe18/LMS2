const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const departmentController = require('../controllers/department.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('department:create'),
    tryCatch(departmentController.create)
);
router.put(
    '/:id',
    authToken,
    permission('department:update'),
    tryCatch(departmentController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('department:remove'),
    tryCatch(departmentController.remove)
);
router.get(
    '/:id',
    authToken,
    permission('department:findOne'),
    tryCatch(departmentController.findOne)
);
router.get(
    '/',
    authToken,
    permission('department:findAll'),
    tryCatch(departmentController.findAll)
);

module.exports = router;
