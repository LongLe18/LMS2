const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const permissionController = require('../controllers/permission.controller');
const { authToken, authRole } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

router.get('/:id', tryCatch(permissionController.findOne));
router.get('/', tryCatch(permissionController.findAll));

module.exports = router;
