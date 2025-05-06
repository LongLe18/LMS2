const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const selectedAnswerController = require('../controllers/selected-answer.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    tryCatch(selectedAnswerController.create)
);
router.put('/:id', authToken, tryCatch(selectedAnswerController.update));
router.delete(
    '/:id/force',
    authToken,
    tryCatch(selectedAnswerController.remove)
);
router.get('/:id', authToken, tryCatch(selectedAnswerController.findOne));
router.get('/', authToken, tryCatch(selectedAnswerController.findAll));

module.exports = router;
