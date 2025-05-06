const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const contactController = require('../controllers/contact.controller');
const { authToken } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('contact:create'),
    tryCatch(contactController.create)
);
router.put(
    '/:id',
    authToken,
    permission('contact:update'),
    tryCatch(contactController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('contact:remove'),
    tryCatch(contactController.remove)
);
router.get('/:id', tryCatch(contactController.findOne));
router.get('/', tryCatch(contactController.findAll));

module.exports = router;
