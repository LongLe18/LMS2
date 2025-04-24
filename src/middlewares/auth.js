const { send } = require('express/lib/response');
const security = require('../utils/security');
const { oauth } = require('../config');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const authToken = (req, res, next) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            return res.status(401).send('Unauthorized');
        } else {
            const decodedToken = security.verifyToken(token);
            if (decodedToken.userId) {
                req.userId = decodedToken.userId;
                req.role = decodedToken.role;
                req.type = decodedToken.type;
                req.positionId = decodedToken.positionId;
                req.departmentId = decodedToken.departmentId;
                next();
            } else {
                return res.status(401).send('Unauthorized');
            }
        }
    } catch (error) {
        return res.status(401).send('Unauthorized');
    }
};

const getToken = (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader.split(' ')[1];
    return token;
};

const authRole = (role, iType) => {
    return (req, res, next) => {
        if (role.includes(req.role)) {
            // role của user có trong role được phép thực hiện
            if (req.role == 2) {
                // nhân viên
                if (req.type.charAt(iType) === '1') {
                    next();
                } else {
                    return res
                        .status(403)
                        .send('Bạn không có quyền thực hiện chức năng này');
                }
            } else if (req.role == 1) {
                // giáo viên
                next();
            } else {
                // học viên
                return res
                    .status(403)
                    .send('Bạn không có quyền thực hiện chức năng này');
            }
        } else {
            return res
                .status(403)
                .send('Bạn không có quyền thực hiện chức năng này');
        }
    };
};

passport.use(
    new GoogleStrategy(
        {
            clientID: oauth.GOOGLE_CLIENT_ID,
            clientSecret: oauth.GOOGLE_CLIENT_SECRET,
            callbackURL: oauth.CALLBACK_URL,
            passReqToCallback: true,
        },
        function (req, accessToken, refreshToken, profile, cb) {
            return cb(null, profile);
        }
    )
);

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (user, cb) {
    cb(null, user);
});

module.exports = { authToken, authRole, passport, getToken };
