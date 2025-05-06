const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const footerController = require('../controllers/footer.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('footer:create'),
    tryCatch(footerController.create)
);
router.put(
    '/:id',
    authToken,
    permission('footer:update'),
    tryCatch(footerController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('footer:remove'),
    tryCatch(footerController.remove)
);
router.get('/:id', tryCatch(footerController.findOne));
router.get('/', tryCatch(footerController.findAll));

module.exports = router;
