const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const examSetStudentController = require('../controllers/exam-set-student.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware')

router.post(
    '',
    authToken,
    permission('examSetStudent:create'),
    tryCatch(examSetStudentController.create)
);
router.put(
    '/:id',
    authToken,
    permission('examSetStudent:update'),
    tryCatch(examSetStudentController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('examSetStudent:remove'),
    tryCatch(examSetStudentController.remove)
);
router.get('/u', authToken, tryCatch(examSetStudentController.getAllByUser));
router.get('/:id', authToken, tryCatch(examSetStudentController.findOne));
router.get(
    '/',
    authToken,
    permission('examSetStudent:findAll'),
    tryCatch(examSetStudentController.findAll)
);

module.exports = router;
