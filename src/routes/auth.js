const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const authController = require('../controllers/AuthController');
const { authToken, passport, authRole } = require('../middlewares/auth');

let LOAI_TAI_KHOAN;
let URL;

router.post('/logout', authToken, tryCatch(authController.postLogout));
router.post('/logout/v2', tryCatch(authController.postLogoutV2));
router.post('/login', tryCatch(authController.postLogin));
router.post('/login/v2', tryCatch(authController.postLoginv2));
router.post('/register', tryCatch(authController.postRegister));
router.post('/register/v2', tryCatch(authController.postRegisterv2));
router.post('/register/v3', tryCatch(authController.postRegisterv3));
router.get('/user', authToken, authRole([2], 3), tryCatch(authController.getAll));
router.post('/change-pass', authToken, tryCatch(authController.changePass));
router.get('/confirm/v2/:token', tryCatch(authController.confirmv2));
router.get('/confirm/:token', tryCatch(authController.confirm));
router.post('/forget-password', tryCatch(authController.forgetPassword));
router.post('/forgot-password', tryCatch(authController.forgotPasswordv2));
router.get('/of-user', authToken, tryCatch(authController.getByUser));
router.put('/update', authToken, tryCatch(authController.putUpdate));
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
