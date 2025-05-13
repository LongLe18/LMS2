const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const staffController = require('../controllers/staff.controller');
const { upload } = require('../middlewares/upload.middleware');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('staff:create'),
    upload.single('anh_dai_dien'),
    tryCatch(staffController.create)
);
//router.get('/create', authToken, permission('staff:update'), tryCatch(staffController.getCreate));
// router.get(
//     '/:id/edit',
//     authToken,
//     permission('staff:update'),
//     tryCatch(staffController.getUpdate)
// );
router.put(
    '/:id',
    authToken,
    permission('staff:update'),
    upload.single('anh_dai_dien'),
    tryCatch(staffController.update)
);
router.get(
    '/change-state/:id',
    authToken,
    permission('staff:update'),
    tryCatch(staffController.stateChange)
);
router.delete(
    '/:id/force',
    authToken,
    permission('staff:remove'),
    tryCatch(staffController.remove)
);
router.get('/:id', authToken, tryCatch(staffController.findOne));
router.get(
    '/',
    authToken,
    permission('staff:findAll'),
    tryCatch(staffController.findAll)
); // có quyền đọc api nhân sự

module.exports = router;
