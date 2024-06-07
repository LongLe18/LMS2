const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const commentController = require('../controllers/CommentController');
const { authToken, authRole } = require('../middlewares/auth');
const {upload} = require('../middlewares/upload');

router.post('/create', authToken, upload.array('anh_dinh_kem', 10), tryCatch(commentController.postCreate));
router.put('/:id', authToken, upload.array('anh_dinh_kem', 10), tryCatch(commentController.putUpdate));
router.delete('/:id', authToken, tryCatch(commentController.deleteById));
//router.get('/v2',tryCatch(commentController.getAllv2));
router.get('/:id', authToken, tryCatch(commentController.getById));
router.get('/', tryCatch(commentController.getAll));

module.exports = router;
