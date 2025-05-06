const express = require('express');
const router = express.Router();

const { tryCatch } = require('../middlewares/try-catch.middleware');
const authController = require('../controllers/auth.controller');
const { authToken, passport } = require('../middlewares/auth.middleware');
const permission = require('../middlewares/permission.middleware');

let LOAI_TAI_KHOAN;
let URL;

router.post('/login/v1', tryCatch(authController.loginv1));
router.post('/login/v2', tryCatch(authController.loginv2));
router.post('/login/v3', tryCatch(authController.loginv3));
router.post('/register', tryCatch(authController.register));
router.get('/user', authToken, permission('auth:findAll'), tryCatch(authController.findAll));
router.post('/change-pass', authToken, tryCatch(authController.changePassword));
router.get('/confirm/v2/:token', tryCatch(authController.confirmv2));
router.get('/confirm/:token', tryCatch(authController.confirm));
router.post('/forget-password', tryCatch(authController.forgetPassword));
router.get('/of-user', authToken, tryCatch(authController.getProfile));
router.put('/update', authToken, tryCatch(authController.updateProfile));
//router.post('/password-recovery/:token', tryCatch(authController.passwordRecovery));
router.get('/success', tryCatch(authController.authGoogle));
router.get('/error', tryCatch(authController.authError));
router.get(
    '/oauth2',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google', (req, res) => {
    LOAI_TAI_KHOAN = req.query.loai_tai_khoan;
    URL=req.query.url;
    res.redirect('/auth/oauth2');
});
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/auth/error',
    }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect(`/auth/success?loai_tai_khoan=${LOAI_TAI_KHOAN}&url=${URL}`);
    }
);

module.exports = router;
