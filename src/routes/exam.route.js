const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const examController = require('../controllers/exam.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload2.middleware');
const { uploadWordMedia } = require('../middlewares/upload3.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('exam:create'),
    upload.single('anh_dai_dien'),
    tryCatch(examController.create)
);
router.post(
    '/upload-word-media',
    authToken,
    permission('exam:create'),
    uploadWordMedia.single('file'),
    tryCatch(examController.uploadWordMedia)
);
router.get(
    '/:id/criteria',
    authToken,
    permission('exam:findOne'),
    tryCatch(examController.getCriteriaByExamId)
);
router.put(
    '/:id',
    authToken,
    permission('exam:update'),
    upload.single('anh_dai_dien'),
    tryCatch(examController.update)
);
router.delete(
    '/:id/force',
    authToken,
    permission('exam:remove'),
    tryCatch(examController.remove)
);
// router.delete(
//     '/clear',
//     authToken,
//     permission('exam:remove'),
//     tryCatch(examController.clearAll)
// );
router.get(
    '/state_change/:id',
    authToken,
    permission('exam:update'),
    tryCatch(examController.stateChange)
);
router.get(
    '/:id/publish',
    authToken,
    permission('exam:update'),
    tryCatch(examController.publish)
);
router.get(
    '/all_admin',
    authToken,
    permission('exam:findAll'),
    tryCatch(examController.findAll)
);
router.get(
    '/dgnl',
    authToken,
    permission('exam:getExamDGNL'),
    tryCatch(examController.getExamDGNL)
);
router.get(
    '/one_exam',
    authToken,
    permission('exam:findOne'),
    tryCatch(examController.getOneExam)
);
router.get('/synthetic', tryCatch(examController.getSynthetic));
router.get('/onlineExam', tryCatch(examController.getExamOnline));
router.get('/student/:id', tryCatch(examController.getStudentStatistic));
router.get('/synthetic/new', tryCatch(examController.getSyntheticNew));
router.get(
    '/reuse/:id',
    authToken,
    permission('exam:update'),
    tryCatch(examController.reuse)
);
router.get(
    '/dgnl/:id',
    authToken,
    permission('exam:findOne'),
    tryCatch(examController.getByIdv2)
);
router.get(
    '/dgtd/:id',
    authToken,
    permission('exam:findOne'),
    tryCatch(examController.getByIdDGTD)
);
router.get('/by-thematic', authToken, tryCatch(examController.findAllByThematicId));
router.get('/by-modun', authToken, tryCatch(examController.findAllByModunId));
router.get('/by-synthetic', authToken, tryCatch(examController.findAllByCourseId));
router.get(
    '/:id',
    authToken,
    permission('exam:findOne'),
    tryCatch(examController.findOne)
);

module.exports = router;
