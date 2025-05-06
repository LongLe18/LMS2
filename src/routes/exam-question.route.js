const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const examQuestionController = require('../controllers/exam-question.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('examQuestion:create'),
    tryCatch(examQuestionController.create)
);
router.put('/v2/:id', authToken, tryCatch(examQuestionController.putUpdatev2));
router.put(
    '/:id',
    authToken,
    permission('examQuestion:update'),
    tryCatch(examQuestionController.update)
);
router.delete(
    '/:id/force',
    authToken,
    permission('examQuestion:remove'),
    tryCatch(examQuestionController.remove)
);
router.get('/:id', authToken, tryCatch(examQuestionController.findOne));
router.get(
    '/',
    authToken,
    permission('examQuestion:findAll'),
    tryCatch(examQuestionController.findAll)
);

module.exports = router;
