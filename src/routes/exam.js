const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const examController = require('../controllers/ExamController');
const { authToken, authRole } = require('../middlewares/auth');
const {
    upload,
    uploadToMinio,
    uploadMultipleToMinio,
} = require('../middlewares/upload8');
const {
    upload: upload2,
    uploadToMinio: uploadToMinio2,
    uploadMultipleToMinio: uploadMultipleToMinio2,
} = require('../middlewares/upload7');

router.post(
    '/create',
    authToken,
    authRole([2], 6),
    upload.fields([{ name: 'anh_dai_dien', maxCount: 1 }]),
    uploadMultipleToMinio,
    tryCatch(examController.postCreate)
);
router.post(
    '/upload-word-media',
    authToken,
    authRole([2], 6),
    upload2.single('file'),
    uploadToMinio2,
    tryCatch(examController.uploadWordMedia)
);
router.get(
    '/:id/edit',
    authToken,
    authRole([2], 6),
    tryCatch(examController.getUpdate)
);
router.get(
    '/:id/criteria',
    authToken,
    authRole([2], 6),
    tryCatch(examController.getCriteriaByExamId)
);
router.put(
    '/:id',
    authToken,
    authRole([2], 6),
    upload.fields([{ name: 'anh_dai_dien', maxCount: 1 }]),
    uploadMultipleToMinio,
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
router.get('/dgnl', authToken, tryCatch(examController.getExamDGNL));
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
router.get('/dgtd/:id', authToken, tryCatch(examController.getByIdDGTD));
router.get('/:id', authToken, tryCatch(examController.getById));

module.exports = router;
