const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const courseTypeController = require('../controllers/course-type.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('courseType:create'),
    tryCatch(courseTypeController.create)
);
router.put(
    '/:id',
    authToken,
    permission('courseType:update'),
    tryCatch(courseTypeController.update)
);
router.delete(
    '/:id/force',
    authToken,
    permission('courseType:remove'),
    tryCatch(courseTypeController.remove)
);
router.get(
    '/:id',
    authToken,
    permission('courseType:findOne'),
    tryCatch(courseTypeController.findOne)
);
router.get(
    '/',
    authToken,
    permission('courseType:findAll'),
    tryCatch(courseTypeController.findAll)
);

module.exports = router;
