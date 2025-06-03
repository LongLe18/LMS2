const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const thematicController = require('../controllers/thematic.controller');
const permission = require('../middlewares/permission.middleware');

router.post(
    '/create',
    authToken,
    permission('thematic:create'),
    tryCatch(thematicController.create)
);
// router.get(
//     '/create',
//     authToken,
//     permission('thematic:create'),
//     tryCatch(thematicController.getCreate)
// );
router.get('/:id/edit', authToken, tryCatch(thematicController.getUpdate));
router.put(
    '/:id',
    authToken,
    permission('thematic:update'),
    tryCatch(thematicController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('thematic:update'),
    tryCatch(thematicController.deleteById)
);
router.delete(
    '/:id/force',
    authToken,
    permission('thematic:remove'),
    tryCatch(thematicController.remove)
);
router.patch(
    '/:id/restore',
    authToken,
    permission('thematic:update'),
    tryCatch(thematicController.restore)
);
router.get('/all', tryCatch(thematicController.getAllv2));
router.get('/by_modun/:id', tryCatch(thematicController.getByModunId));
router.get('/filter', tryCatch(thematicController.getByFilter));
router.get('/by-teacher', authToken, tryCatch(thematicController.findAllv2));
router.get('/:id', tryCatch(thematicController.findOne));
router.get('/', tryCatch(thematicController.findAll));

module.exports = router;
