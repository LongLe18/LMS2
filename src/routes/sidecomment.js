const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const sideCommentController = require('../controllers/SideCommentController');
const { authToken, authRole } = require('../middlewares/auth');
const {upload} = require('../middlewares/upload');

router.post('/create', authToken, upload.array('anh_dinh_kem', 10), tryCatch(sideCommentController.postCreate));
router.put('/:id', authToken, upload.array('anh_dinh_kem', 10), tryCatch(sideCommentController.putUpdate));
router.delete('/:id', authToken, tryCatch(sideCommentController.deleteById));
router.get('/:id', tryCatch(sideCommentController.getById));
router.get('/', tryCatch(sideCommentController.getAll));

module.exports = router;
