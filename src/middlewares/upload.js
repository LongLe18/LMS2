const multer = require('multer');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const {extname} = require('path');
const moment = require('moment');
const fs = require('fs');

function checkMimeTypeCallback(file, cb) {
    const mimeTypes = [
        'image/jpg',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/bmp',
        'video/mp4',
        'application/pdf',
    ];
    const filetypes = /jpg|jpeg|png|gif|bmp|mp4|pdf/;
    const mimetype = mimeTypes.includes(file.mimetype);
    const checkExtname = filetypes.test(extname(file.originalname));
    if (mimetype && checkExtname) {
        return cb(null, true);
    }

    cb(null, false);
}

const MEDIA_TYPE = {
    IMAGE : 'IMAGE',
    VIDEO : 'VIDEO',
    AUDIO : 'AUDIO',
    DOCUMENT : 'DOCUMENT',
    MISC : 'MISC',
}

function checkFileType(file) {
    // Read the file's MIME type
    // const mimeType = mime.getType(filePath);
    const mimeType = file.mimetype;

    // Check if the MIME type belongs to an image, video or document
    if (mimeType.startsWith('image/')) {
        return MEDIA_TYPE.IMAGE;
    } else if (mimeType.startsWith('video/')) {
        return MEDIA_TYPE.VIDEO;
    } else if (
        [
            'application/pdf',
            'application/msword',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ].includes(mimeType)
    ) {
        return MEDIA_TYPE.DOCUMENT;
    } else {
        // File is of some other type
        return MEDIA_TYPE.MISC;
    }
}

function getFilePathByType(type){
    switch (type) {
        case MEDIA_TYPE.IMAGE:
            return 'image';
        case MEDIA_TYPE.VIDEO:
            return 'video';
        case MEDIA_TYPE.DOCUMENT:
            return 'document';
        case MEDIA_TYPE.AUDIO:
            return 'audio';
        default:
            return 'misc';
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const ymdPath = `${moment().format('YYYY_MM_DD')}`;
        const fileTypePath = getFilePathByType(checkFileType(file));
        const filePath = `public/upload/${fileTypePath}/${ymdPath}`;
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, { recursive: true });
        }
        cb(null, filePath);
    },
    filename: function (req, file, cb) {
        const ymdPath = `${moment().format('YYYY_MM_DD')}`;
        const fileTypePath = getFilePathByType(checkFileType(file));
        const filePath = `/upload/${fileTypePath}/${ymdPath}`;
        const filename = `${moment().unix()}-${uuid()}${extname(file.originalname)}`
        req.body[file.fieldname] = `${filePath}/${filename}`;
        cb(null, filename);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 10MB in bytes
    },
    fileFilter: function (req, file, cb) {
        checkMimeTypeCallback(file, cb);
    },
});

module.exports = { upload };
