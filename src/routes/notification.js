const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const notificationController = require('../controllers/NotificationController');
const { authToken, authRole } = require('../middlewares/auth');
const {upload} = require('../middlewares/upload');

router.post('/create', authToken, tryCatch(notificationController.postCreate));
router.put('/:id', authToken, tryCatch(notificationController.putUpdate));
router.delete('/:id', authToken, tryCatch(notificationController.deleteById));
router.get('/user', authToken, tryCatch(notificationController.getByUser));
router.get('/change-state/:id', authToken, tryCatch(notificationController.changeStatev2));
router.get('/change-state', authToken, tryCatch(notificationController.changeState));
router.get('/:id',tryCatch(notificationController.getById));
router.get('/', tryCatch(notificationController.getAll));

module.exports = router;
