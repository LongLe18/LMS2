const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const generateToken = (data, expiresIn) => {
    const token = jwt.sign(data, process.env.AUTH_TOKEN_SECRET, {
        expiresIn: expiresIn,
    });
    return token;
};

const verifyToken = (token) => {
    const data = jwt.verify(token, process.env.AUTH_TOKEN_SECRET);
    return data;
};

const generateRefreshToken = (data) => {
    const token = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET);
    return token;
};

const hashPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS) || 8));
};

const comparePassword = (hashPassword, password) => {
    return bcrypt.compareSync(password, hashPassword);
};

const generatePassword = () => {
    let length1 = 2;
    let length2 = 2;
    let length3 = 2;
    let length4 = 2;
    let charset1 = 'abcdefghijklmnopqrstuvwxyz';
    let charset2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let charset3 = '0123456789';
    let charset4 = '!@#$%^&*';
    let retVal1 = '';
    let retVal2 = '';
    let retVal3 = '';
    let retVal4 = '';
    for (var i = 0; i < length1; ++i) {
        retVal1 += charset1.charAt(Math.floor(Math.random() * charset1.length));
    }
    for (var i = 0; i < length2; ++i) {
        retVal2 += charset2.charAt(Math.floor(Math.random() * charset2.length));
    }
    for (var i = 0; i < length3; ++i) {
        retVal3 += charset3.charAt(Math.floor(Math.random() * charset3.length));
    }
    for (var i = 0; i < length4; ++i) {
        retVal4 += charset4.charAt(Math.floor(Math.random() * charset4.length));
    }
    let charset = `${retVal1}${retVal2}${retVal3}${retVal4}`;
    // let retVal;
    // for (var i = 0; i < charset.length; ++i) {
    //     retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    // }
    return charset;
};
const makeid=(length)=>{
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = {
    generateToken,
    verifyToken,
    generateRefreshToken,
    hashPassword,
    comparePassword,
    generatePassword,
    makeid
};
