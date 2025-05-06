const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const documentTypeController = require('../controllers/document-type.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('documentType:create'),
    tryCatch(documentTypeController.create)
);
router.put(
    '/:id',
    authToken,
    permission('documentType:update'),
    tryCatch(documentTypeController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('documentType:remove'),
    tryCatch(documentTypeController.remove)
);
router.get(
    '/:id',
    authToken,
    permission('documentType:findOne'),
    tryCatch(documentTypeController.findOne)
);
router.get(
    '/',
    authToken,
    permission('documentType:findAll'),
    tryCatch(documentTypeController.findAll)
);

module.exports = router;
