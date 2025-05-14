const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const programController = require('../controllers/program.controller');
const { upload } = require('../middlewares/upload.middleware');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('program:create'),
    upload.single('anh_dai_dien'),
    tryCatch(programController.create)
);
// router.get(
//     '/create',
//     authToken,
//     permission('program:create'),
//     tryCatch(programController.getCreate)
// );
// router.get(
//     '/:id/edit',
//     authToken,
//     permission('program:create'),
//     tryCatch(programController.getUpdate)
// );
router.put(
    '/:id',
    authToken,
    permission('program:update'),
    upload.single('anh_dai_dien'),
    tryCatch(programController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('program:update'),
    tryCatch(programController.deleteById)
);
router.delete(
    '/:id/force',
    authToken,
    permission('program:remove'),
    tryCatch(programController.remove)
);
router.patch(
    '/:id/restore',
    authToken,
    permission('program:update'),
    tryCatch(programController.restore)
);
router.get('/:id', tryCatch(programController.findOne));
router.get('/', tryCatch(programController.findAll));

module.exports = router;
