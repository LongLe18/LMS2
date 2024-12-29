const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const commentController = require('../controllers/CommentController');
const { authToken, authRole } = require('../middlewares/auth');
const {
    upload,
    uploadToMinio,
    uploadMultipleToMinio,
} = require('../middlewares/upload6');

router.post(
    '/create',
    authToken,
    upload.fields([
        { name: 'anh_dinh_kem', maxCount: 10 },
    ]),
    uploadMultipleToMinio,
    tryCatch(commentController.postCreate)
);
router.put(
    '/:id',
    authToken,
    upload.fields([
        { name: 'anh_dinh_kem', maxCount: 10 },
    ]),
    uploadMultipleToMinio,
    tryCatch(commentController.putUpdate)
);
router.delete('/:id', authToken, tryCatch(commentController.deleteById));
//router.get('/v2',tryCatch(commentController.getAllv2));
router.get('/:id', authToken, tryCatch(commentController.getById));
router.get('/', tryCatch(commentController.getAll));

module.exports = router;
