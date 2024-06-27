const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const answerController = require('../controllers/AnswerController');
const { authToken, authRole } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload2');

router.post(
    '/create', authToken, authRole([2], 6),
    upload.fields([
        { name: 'tep_dinh_kem1', maxCount: 10 },
        { name: 'tep_dinh_kem2', maxCount: 10 },
        { name: 'tep_dinh_kem3', maxCount: 10 },
        { name: 'tep_dinh_kem4', maxCount: 10 },
    ]),
    tryCatch(answerController.postCreate)
);
router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(answerController.getUpdate));
router.put(
    '/',  authToken, authRole([2], 6),
    upload.fields([
        { name: 'tep_dinh_kem1', maxCount: 10 },
        { name: 'tep_dinh_kem2', maxCount: 10 },
        { name: 'tep_dinh_kem3', maxCount: 10 },
        { name: 'tep_dinh_kem4', maxCount: 10 },
    ]),
    tryCatch(answerController.putUpdate)
);
router.delete('/:id', authToken, authRole([2], 6), tryCatch(answerController.deleteByIdQuestion));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(answerController.forceDelete));
router.get('/:id', authToken, authRole([2], 7), tryCatch(answerController.getById));
router.get('/',  authToken, authRole([2], 7), tryCatch(answerController.getAll));

module.exports = router;
