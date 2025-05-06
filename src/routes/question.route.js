const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const questionController = require('../controllers/question.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const { uploadWordMedia } = require('../middlewares/upload4.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('question:create'),
    uploadWordMedia.fields([
        { name: 'tep_dinh_kem_noi_dung', maxCount: 1 },
        { name: 'tep_dinh_kem_loi_giai', maxCount: 1 },
    ]),
    tryCatch(questionController.create)
);
//router.get('/:id/edit', authToken, permission('question:create'), tryCatch(questionController.getUpdate));
router.put(
    '/:id',
    authToken,
    permission('question:update'),
    uploadWordMedia.fields([
        { name: 'tep_dinh_kem_noi_dung', maxCount: 10 },
        { name: 'tep_dinh_kem_loi_giai', maxCount: 10 },
    ]),
    tryCatch(questionController.update)
);
router.get(
    '/getByExam',
    authToken,
    permission('question:getByExam'),
    tryCatch(questionController.getByExam)
);
router.delete(
    '/:id/force',
    authToken,
    permission('question:remove'),
    tryCatch(questionController.remove)
);
router.get(
    '/all_admin',
    authToken,
    permission('question:findAll'),
    tryCatch(questionController.getAll_admin)
);
router.post(
    '/:id/add-details',
    authToken,
    permission('question:update'),
    tryCatch(questionController.addDetails)
);
router.post(
    '/:id/add-detail',
    authToken,
    permission('question:update'),
    tryCatch(questionController.addDetail)
);
router.get(
    '/:id/get-details',
    authToken,
    permission('question:findOne'),
    tryCatch(questionController.getDetails)
);
router.put(
    '/update-detail/:detailId',
    authToken,
    permission('question:update'),
    tryCatch(questionController.updateDetail)
);
router.delete(
    '/remove-detail/:detailId',
    authToken,
    permission('question:update'),
    tryCatch(questionController.removeDetail)
);

router.post(
    '/:id/add-option',
    authToken,
    permission('question:update'),
    tryCatch(questionController.addOption)
);
router.get(
    '/:id/get-option',
    authToken,
    permission('question:findOne'),
    tryCatch(questionController.getOption)
);
router.put(
    '/update-option/:optionId',
    authToken,
    permission('question:update'),
    tryCatch(questionController.updateOption)
);
router.delete(
    '/remove-option/:optionId',
    authToken,
    permission('question:update'),
    tryCatch(questionController.removeOption)
);
router.get(
    '/:id',
    authToken,
    permission('question:findOne'),
    tryCatch(questionController.findOne)
);
router.get(
    '/',
    authToken,
    permission('question:findAll'),
    tryCatch(questionController.findAll)
);

module.exports = router;
