const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const examController = require('../controllers/ExamController');
const { authToken, authRole } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload2');
const { uploadWordMedia } = require('../middlewares/upload3');

router.post(
    '/create',
    authToken,
    authRole([2], 6),
    upload.single('anh_dai_dien'),
    tryCatch(examController.postCreate)
);
router.post(
    '/upload-word-media',
    authToken,
    authRole([2], 6),
    uploadWordMedia.single('file'),
    tryCatch(examController.uploadWordMedia)
);
router.get(
    '/:id/edit',
    authToken,
    authRole([2], 6),
    tryCatch(examController.getUpdate)
);
router.put(
    '/:id',
    authToken,
    authRole([2], 6),
    upload.single('anh_dai_dien'),
    tryCatch(examController.putUpdate)
);
router.delete(
    '/:id/force',
    authToken,
    authRole([2], 6),
    tryCatch(examController.forceDelete)
);
router.delete(
    '/clear',
    authToken,
    authRole([2], 6),
    tryCatch(examController.clearAll)
);
router.get(
    '/state_change/:id',
    authToken,
    authRole([2], 6),
    tryCatch(examController.stateChange)
);
router.get(
    '/:id/publish',
    authToken,
    authRole([2], 6),
    tryCatch(examController.publish)
);
router.get('/all_admin', authToken, examController.getAll_admin);
router.get('/one_exam', authToken, tryCatch(examController.getOneExam));
router.get('/synthetic', tryCatch(examController.getSynthetic));
router.get('/onlineExam', tryCatch(examController.getExamOnline));
router.get('/student/:id', tryCatch(examController.studentStatistic));
router.get('/synthetic/new', tryCatch(examController.getSyntheticNew));
router.get(
    '/reuse/:id',
    authToken,
    authRole([2], 6),
    tryCatch(examController.reuse)
);
router.get('/dgnl/:id', authToken, tryCatch(examController.getByIdv2));
router.get('/:id', authToken, tryCatch(examController.getById));

module.exports = router;
