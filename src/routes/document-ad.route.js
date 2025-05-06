const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const documentAdController = require('../controllers/document-ad.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('documentAd:create'),
    upload.single('anh_dai_dien'),
    tryCatch(documentAdController.postCreate)
);
router.put(
    '/:id',
    authToken,
    permission('documentAd:update'),
    upload.single('anh_dai_dien'),
    tryCatch(documentAdController.putUpdate)
);
router.delete(
    '/:id',
    authToken,
    permission('documentAd:remove'),
    tryCatch(documentAdController.deleteById)
);
router.get(
    '/change-state/:id',
    authToken,
    permission('documentAd:update'),
    tryCatch(documentAdController.stateChange)
);
router.get('/:id', tryCatch(documentAdController.getById));
router.get('/', tryCatch(documentAdController.getAll));

module.exports = router;
