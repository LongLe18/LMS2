const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const courseDescriptionController = require('../controllers/course-description.controller');
const { authToken } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('courseDescription:create'),
    tryCatch(courseDescriptionController.create)
);
router.put(
    '/:id',
    authToken,
    permission('courseDescription:update'),
    tryCatch(courseDescriptionController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('courseDescription:remove'),
    tryCatch(courseDescriptionController.remove)
);
router.get('/:id', tryCatch(courseDescriptionController.findOne));
router.get('/', tryCatch(courseDescriptionController.findAll));

module.exports = router;
