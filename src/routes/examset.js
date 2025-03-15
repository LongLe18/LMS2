const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const examSetController = require('../controllers/ExamSetController');
const { authToken, authRole } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

router.post(
    '/create',
    authToken,
    authRole([2], 0),
    upload.fields([{ name: 'anh_dai_dien', maxCount: 1 }]),
    tryCatch(examSetController.postCreate)
);
router.post(
    '/:id/upload-file-exam',
    authToken,
    authRole([2], 6),
    upload.fields([{ name: 'files', maxCount: 10 }]),
    tryCatch(examSetController.uploadFileExams)
);
router.put(
    '/:id',
    authToken,
    authRole([2], 0),
    upload.fields([{ name: 'anh_dai_dien', maxCount: 1 }]),
    tryCatch(examSetController.putUpdate)
);
router.delete(
    '/delete-file-exam/:id',
    authToken,
    authRole([2], 6),
    tryCatch(examSetController.deleteFileExam)
);
router.delete(
    '/:id',
    authToken,
    authRole([2], 0),
    tryCatch(examSetController.deleteById)
);
router.get('/:id', tryCatch(examSetController.getById));
router.get('/', tryCatch(examSetController.getAll));

module.exports = router;
