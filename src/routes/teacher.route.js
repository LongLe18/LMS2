const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const teacherController = require('../controllers/teacher.controller');
const { upload } = require('../middlewares/upload.middleware');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('teacher:create'),
    upload.single('anh_dai_dien'),
    tryCatch(teacherController.create)
);
//router.get('/create', authToken, authRole([2], 2), tryCatch(teacherController.getCreate));
router.get(
    '/:id/edit',
    authToken,
    permission('teacher:findOne'),
    tryCatch(teacherController.getUpdate)
);
router.put(
    '/:id',
    authToken,
    permission('teacher:update'),
    upload.single('anh_dai_dien'),
    tryCatch(teacherController.update)
);
router.get(
    '/change-state/:id',
    authToken,
    permission('teacher:update'),
    tryCatch(teacherController.stateChange)
);
router.delete(
    '/:id/force',
    authToken,
    permission('teacher:remove'),
    tryCatch(teacherController.remove)
);
router.get(
    '/dealer/user',
    authToken,
    permission('teacher:getDealerUser'),
    tryCatch(teacherController.getDealerUser)
);
router.get(
    '/dealers',
    authToken,
    permission('teacher:getDealers'),
    tryCatch(teacherController.getDealers)
);
router.get(
    '/statistical',
    authToken,
    permission('teacher:getStatistical'),
    tryCatch(teacherController.getStatistical)
);
router.get('/:id', authToken, tryCatch(teacherController.findOne));
router.get(
    '/',
    authToken,
    permission('teacher:findAll'),
    tryCatch(teacherController.findAll)
);

module.exports = router;
