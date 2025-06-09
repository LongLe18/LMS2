const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const commentController = require('../controllers/comment.controller');
const { authToken } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('comment:create'),
    upload.array('anh_dinh_kem', 10),
    tryCatch(commentController.create)
);
router.put(
    '/:id',
    authToken,
    permission('comment:update'),
    upload.array('anh_dinh_kem', 10),
    tryCatch(commentController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('comment:remove'),
    tryCatch(commentController.remove)
);
router.get('/v2', authToken, tryCatch(commentController.findAllv2));
router.get(
    '/:id',
    authToken,
    permission('comment:findOne'),
    tryCatch(commentController.findOne)
);
router.get('/', tryCatch(commentController.findAll));

module.exports = router;
