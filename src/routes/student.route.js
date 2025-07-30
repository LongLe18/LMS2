const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/try-catch.middleware');
const studentController = require('../controllers/student.controller');
const { upload } = require('../middlewares/upload.middleware');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('student:create'),
    upload.single('anh_dai_dien'),
    tryCatch(studentController.create)
);
router.post(
    '/create-by-prefix',
    authToken,
    permission('student:createByPrefix'),
    tryCatch(studentController.postCreateMoreByPrefix)
);

router.post(
    '/adminCreate',
    authToken,
    permission('student:create'),
    upload.single('anh_dai_dien'),
    tryCatch(studentController.postCreateAdmin)
);

// router.get('/create', authToken, tryCatch(studentController.getCreate));
router.get('/:id/edit', authToken, tryCatch(studentController.getUpdate));
router.put(
    '/:id',
    authToken,
    upload.single('anh_dai_dien'),
    tryCatch(studentController.update)
);
router.get(
    '/change-state/:id',
    authToken,
    permission('student:update'),
    tryCatch(studentController.stateChange)
);
router.delete(
    '/:id/force',
    authToken,
    permission('student:remove'),
    tryCatch(studentController.remove)
);
router.get('/v2', tryCatch(studentController.getAllv2));
router.get('/v3', authToken, tryCatch(studentController.getAllv3));
router.get(
    '/statistical',
    authToken,
    tryCatch(studentController.getStatistical)
);
router.get('/detail_modun', authToken, tryCatch(studentController.getDetail));
router.get('/of_course/:id', tryCatch(studentController.getOfCourse));
router.get('/by_email', tryCatch(studentController.getByEmail));
router.post(
    '/add/course/:id',
    authToken,
    permission('student:addCourse'),
    tryCatch(studentController.addCourse)
);
router.get(
    '/list/course',
    authToken,
    tryCatch(studentController.getCourseOfUser)
);
router.get('/download-file-import', authToken, tryCatch(studentController.downloadFileImportStudent));
router.get('/:id', authToken, tryCatch(studentController.findOne));
router.get(
    '/',
    authToken,
    permission('student:findAll'),
    tryCatch(studentController.findAll)
);

module.exports = router;
