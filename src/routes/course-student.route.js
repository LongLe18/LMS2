const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const courseStudentController = require('../controllers/course-student.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('courseStudent:create'),
    tryCatch(courseStudentController.create)
);
router.delete(
    '/:id',
    authToken,
    permission('courseStudent:remove'),
    tryCatch(courseStudentController.remove)
);
router.get('/:id', authToken, tryCatch(courseStudentController.findOne));
router.get(
    '/',
    authToken,
    permission('courseStudent:findAll'),
    tryCatch(courseStudentController.findAll)
);

module.exports = router;
