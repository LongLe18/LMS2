const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const staffController = require('../controllers/StaffController');
const { upload } = require('../middlewares/upload');
const { authToken, authRole } = require('../middlewares/auth');
const permission = require('../middlewares/permission');

router.post(
    '/create',
    authToken,
    permission('staff:create'),
    upload.single('anh_dai_dien'),
    tryCatch(staffController.postCreate)
);
//router.get('/create', authToken, authRole([2], 2), tryCatch(staffController.getCreate));
router.get(
    '/:id/edit',
    authToken,
    authRole([2], 2),
    tryCatch(staffController.getUpdate)
);
router.put(
    '/:id',
    authToken,
    authRole([2], 2),
    upload.single('anh_dai_dien'),
    tryCatch(staffController.putUpdate)
);
router.get(
    '/change-state/:id',
    authToken,
    authRole([2], 2),
    tryCatch(staffController.stateChange)
);
router.delete(
    '/:id/force',
    authToken,
    authRole([2], 2),
    tryCatch(staffController.forceDelete)
);
router.get('/:id', authToken, tryCatch(staffController.getById));
router.get('/', authToken, authRole([1, 2]), tryCatch(staffController.getAll)); // có quyền đọc api nhân sự

module.exports = router;
