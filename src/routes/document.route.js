const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const documentController = require('../controllers/document.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('document:create'),
    upload.fields([
        { name: 'anh_dai_dien', maxCount: 1 },
        { name: 'noi_dung', maxCount: 1 },
    ]),
    tryCatch(documentController.create)
);
router.put(
    '/:id',
    authToken,
    permission('document:update'),
    upload.fields([
        { name: 'anh_dai_dien', maxCount: 1 },
        { name: 'noi_dung', maxCount: 1 },
    ]),
    tryCatch(documentController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('document:remove'),
    tryCatch(documentController.remove)
);
router.get(
    '/change-state/:id',
    authToken,
    permission('document:update'),
    tryCatch(documentController.stateChange)
);
router.get('/:id', authToken, tryCatch(documentController.findOne));
router.get('/', authToken, tryCatch(documentController.findAll));

module.exports = router;
