const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const courseAdController = require('../controllers/course-ad.controller');
const { authToken } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware')

router.post(
    '/create',
    authToken,
    permission('courseAd:create'),
    tryCatch(courseAdController.create)
);
router.put(
    '/:id',
    authToken,
    permission('courseAd:update'),
    tryCatch(courseAdController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('courseAd:remove'),
    tryCatch(courseAdController.remove)
);
router.get(
    '/change-state/:id',
    authToken,
    permission('courseAd:update'),
    tryCatch(courseAdController.stateChange)
);
router.get('/:id', tryCatch(courseAdController.findOne));
router.get('/', tryCatch(courseAdController.findAll));

module.exports = router;
