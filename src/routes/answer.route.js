const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const answerController = require('../controllers/answer.controller');
const { authToken } = require('../middlewares/auth.middleware');
const { uploadWordMedia } = require('../middlewares/upload4.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('answer:create'),
    uploadWordMedia.fields([
        { name: 'tep_dinh_kem1', maxCount: 1 },
        { name: 'tep_dinh_kem2', maxCount: 1 },
        { name: 'tep_dinh_kem3', maxCount: 1 },
        { name: 'tep_dinh_kem4', maxCount: 1 },
    ]),
    tryCatch(answerController.create)
);
router.put(
    '/',
    authToken,
    permission('answer:update'),
    uploadWordMedia.fields([
        { name: 'tep_dinh_kem1', maxCount: 1 },
        { name: 'tep_dinh_kem2', maxCount: 1 },
        { name: 'tep_dinh_kem3', maxCount: 1 },
        { name: 'tep_dinh_kem4', maxCount: 1 },
    ]),
    tryCatch(answerController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('answer:removeByQuestionId'),
    tryCatch(answerController.removeByQuestionId)
);
router.delete(
    '/:id/force',
    authToken,
    permission('answer:remove'),
    tryCatch(answerController.remove)
);
router.get(
    '/:id',
    authToken,
    permission('answer:findOne'),
    tryCatch(answerController.findOne)
);
router.get(
    '/',
    authToken,
    permission('answer:findAll'),
    tryCatch(answerController.findAll)
);

module.exports = router;
