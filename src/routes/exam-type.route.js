const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const examTypeController = require('../controllers/exam-type.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('examType:create'),
    tryCatch(examTypeController.create)
);
router.put(
    '/:id',
    authToken,
    permission('examType:update'),
    tryCatch(examTypeController.update)
);
router.delete(
    '/:id/force',
    authToken,
    permission('examType:remove'),
    tryCatch(examTypeController.remove)
);
router.get(
    '/:id',
    authToken,
    permission('examType:findOne'),
    tryCatch(examTypeController.findOne)
);
router.get(
    '/',
    authToken,
    permission('examType:findAll'),
    tryCatch(examTypeController.findAll)
);

module.exports = router;
