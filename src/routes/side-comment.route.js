const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const sideCommentController = require('../controllers/side-comment.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

router.post(
    '/create',
    authToken,
    upload.array('anh_dinh_kem', 10),
    tryCatch(sideCommentController.create)
);
router.put(
    '/:id',
    authToken,
    upload.array('anh_dinh_kem', 10),
    tryCatch(sideCommentController.update)
);
router.delete('/:id', authToken, tryCatch(sideCommentController.remove));
router.get('/:id', tryCatch(sideCommentController.findOne));
router.get('/', tryCatch(sideCommentController.findAll));

module.exports = router;
