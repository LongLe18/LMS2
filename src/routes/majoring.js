const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const majoringController = require('../controllers/MajoringController');
const { authToken, authRole } = require('../middlewares/auth');

router.post('/create', authToken, authRole([1, 2]), tryCatch(majoringController.postCreate));
router.get('/:id/edit', authToken, authRole([1, 2]), tryCatch(majoringController.getUpdate));
router.put('/:id', authToken, authRole([1, 2]), tryCatch(majoringController.putUpdate));
router.delete('/:id/force', authToken, authRole([1, 2]), tryCatch(majoringController.forceDelete));
router.get('/:id', authToken, authRole([1, 2]), tryCatch(majoringController.getById));
router.get('/', authToken, authRole([1, 2]), tryCatch(majoringController.getAll));

module.exports = router;
