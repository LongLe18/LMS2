const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const notificationController = require('../controllers/notification.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');

router.post('/create', authToken, tryCatch(notificationController.create));
router.put('/:id', authToken, tryCatch(notificationController.update));
router.delete('/:id', authToken, tryCatch(notificationController.remove));
router.get('/user', authToken, tryCatch(notificationController.getByUser));
router.get(
    '/change-state/:id',
    authToken,
    tryCatch(notificationController.changeStatev2)
);
router.get(
    '/change-state',
    authToken,
    tryCatch(notificationController.changeState)
);
router.get('/:id', tryCatch(notificationController.findOne));
router.get('/', tryCatch(notificationController.findAll));

module.exports = router;
