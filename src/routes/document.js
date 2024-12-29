const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const documentController = require('../controllers/DocumentController');
const { authToken, authRole } = require('../middlewares/auth');
const { upload, uploadToMinio, uploadMultipleToMinio } = require('../middlewares/upload6');

router.post(
    '/create', authToken, authRole([2], 4), 
    upload.fields([
        { name: 'anh_dai_dien', maxCount: 1 },
        { name: 'noi_dung', maxCount: 1 },
    ]),
    uploadMultipleToMinio,
    tryCatch(documentController.postCreate)
);
router.put(
    '/:id', authToken, authRole([2], 4),  
    upload.fields([
        { name: 'anh_dai_dien', maxCount: 1 },
        { name: 'noi_dung', maxCount: 1 },
    ]),
    uploadMultipleToMinio,
    tryCatch(documentController.putUpdate)
);
router.delete('/:id', authToken, authRole([2], 4),  tryCatch(documentController.deleteById));
router.get('/change-state/:id', authToken, authRole([2], 4),  tryCatch(documentController.stateChange));
router.get('/:id', authToken, tryCatch(documentController.getById));
router.get('/', authToken, tryCatch(documentController.getAll));

module.exports = router;
