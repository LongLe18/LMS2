const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const programController = require('../controllers/ProgramController');
const { upload } = require('../middlewares/upload');
const { authToken, authRole } = require('../middlewares/auth');

router.post(
    '/create', authToken, authRole([2], 6),
    upload.single('anh_dai_dien'),
    tryCatch(programController.postCreate)
);
router.get('/create', authToken, authRole([2], 6), tryCatch(programController.getCreate));
router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(programController.getUpdate));
router.put(
    '/:id', authToken, authRole([2], 6), 
    upload.single('anh_dai_dien'),
    tryCatch(programController.putUpdate)
);
router.delete('/:id', authToken, authRole([2], 6), tryCatch(programController.deleteById));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(programController.forceDelete));
router.patch('/:id/restore', authToken, authRole([2], 6), tryCatch(programController.restore));
router.get('/:id', tryCatch(programController.getById));
router.get('/', tryCatch(programController.getAll));

module.exports = router;
