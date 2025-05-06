const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const gradeController = require('../controllers/grade.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('grade:create'),
    tryCatch(gradeController.create)
);
router.get(
    '/:id/edit',
    authToken,
    permission('grade:findOne'),
    tryCatch(gradeController.getUpdate)
);
router.put(
    '/:id',
    authToken,
    permission('grade:update'),
    tryCatch(gradeController.update)
);
router.delete(
    '/:id/force',
    authToken,
    permission('grade:remove'),
    tryCatch(gradeController.remove)
);
router.get('/:id', tryCatch(gradeController.findOne));
router.get('/', tryCatch(gradeController.findAll));

module.exports = router;
