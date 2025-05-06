const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const excerptController = require('../controllers/exceprt.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload2.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('exceprt:create'),
    upload.fields([{ name: 'tep_dinh_kem', maxCount: 10 }]),
    tryCatch(excerptController.create)
);
router.put(
    '/:id',
    authToken,
    permission('exceprt:update'),
    upload.fields([{ name: 'tep_dinh_kem', maxCount: 10 }]),
    tryCatch(excerptController.update)
);
router.delete(
    '/:id/force',
    authToken,
    permission('exceprt:remove'),
    tryCatch(excerptController.remove)
);
router.get(
    '/:id',
    authToken,
    permission('exceprt:findOne'),
    tryCatch(excerptController.findOne)
);
router.get(
    '/',
    authToken,
    permission('exceprt:findAll'),
    tryCatch(excerptController.findAll)
);

module.exports = router;
