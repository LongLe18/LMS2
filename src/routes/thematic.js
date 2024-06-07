const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const { authToken, authRole } = require('../middlewares/auth');
const thematicController = require('../controllers/ThematicController');

router.post('/create', authToken, authRole([2], 6), tryCatch(thematicController.postCreate));
router.get('/create', authToken, authRole([2], 6), tryCatch(thematicController.getCreate));
router.get('/:id/edit', authToken, tryCatch(thematicController.getUpdate));
router.put('/:id', authToken, authRole([2], 6), tryCatch(thematicController.putUpdate));
router.delete('/:id', authToken, authRole([2], 6), tryCatch(thematicController.deleteById));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(thematicController.forceDelete));
router.patch('/:id/restore', authToken, authRole([2], 6), tryCatch(thematicController.restore));
router.get('/all', tryCatch(thematicController.getAllv2));
router.get('/by_modun/:id', tryCatch(thematicController.getByIDModun));
router.get('/filter', tryCatch(thematicController.getByFilter));
router.get('/:id', tryCatch(thematicController.getById));
router.get('/', tryCatch(thematicController.getAll));

module.exports = router;
