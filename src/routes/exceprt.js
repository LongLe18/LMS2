const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const excerptController = require('../controllers/ExceprtController');
const { authToken, authRole } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload2');

router.post(
    '/create', authToken, authRole([2], 6), 
    upload.single('noi_dung'),
    tryCatch(excerptController.postCreate)
);
router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(excerptController.getUpdate));
router.put(
    '/:id', authToken, authRole([2], 6), 
    upload.single('noi_dung'),
    tryCatch(excerptController.putUpdate)
);
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(excerptController.forceDelete));
router.get('/:id', authToken, authRole([2], 7), tryCatch(excerptController.getById));
router.get('/', authToken, authRole([2], 7), tryCatch(excerptController.getAll));

module.exports = router;
