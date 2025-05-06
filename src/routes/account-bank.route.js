const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const accountBankController = require('../controllers/account-bank.controller');
const { authToken } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');
const { validateDto } = require('../middlewares/validate-dto.middleware');
const { CreateUserDto, UpdateUserDto } = require('../dto/accountBank.dto');

router.post(
    '/create',
    authToken,
    permission('accountBank:create'),
    validateDto(CreateUserDto()),
    tryCatch(accountBankController.create)
);
router.put(
    '/:id',
    authToken,
    permission('accountBank:update'),
    validateDto(UpdateUserDto()),
    tryCatch(accountBankController.update)
);
router.delete(
    '/:id',
    authToken,
    permission('accountBank:remove'),
    tryCatch(accountBankController.remmove)
);
router.get('/:id', tryCatch(accountBankController.findOne));
router.get('/', tryCatch(accountBankController.findAll));

module.exports = router;
