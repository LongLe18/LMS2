const multer = require('multer');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const { extname } = require('path');
const moment = require('moment');
const fs = require('fs');
const Minio = require('minio');

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
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    AUDIO: 'AUDIO',
    DOCUMENT: 'DOCUMENT',
    MISC: 'MISC',
};

function checkFileType(file) {
    const mimeType = file.mimetype;
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
        return MEDIA_TYPE.MISC;
    }
}

function getFilePathByType(type) {
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

const minioClient = new Minio.Client({
    endPoint: 'localhost', // Thay bằng endpoint của bạn
    port: 9000,            // Thay bằng port của bạn
    useSSL: false,         // Sử dụng true nếu server bật SSL
    accessKey: 'admin',
    secretKey: '^P*XQ3*0H7%6Ny',
});

const storage = multer.memoryStorage(); // Chuyển sang memory storage để xử lý file trước khi upload lên MinIO

function createDynamicUploader(fieldsConfig) {
    return multer({
        storage: storage,
        limits: {
            fileSize: 500 * 1024 * 1024, // 500MB
        },
        fileFilter: function (req, file, cb) {
            checkMimeTypeCallback(file, cb);
        },
    }).fields(fieldsConfig);
}

async function uploadToMinio(file, filePath) {
    try {
        await minioClient.putObject('bucket-public', filePath, file.buffer, file.mimetype);
        console.log(`Upload thành công: ${filePath}`);
    } catch (err) {
        console.error('Lỗi khi upload lên MinIO:', err);
        throw err;
    }
}

async function handleFileUpload(req, res) {
    const fieldsConfig = req.body.fieldsConfig

    const upload = createDynamicUploader(fieldsConfig);

    upload(req, res, async function (err) {
        if (err) {
            return res.status(500).json({ error: 'Lỗi khi upload file' });
        }

        const fileUrls = {};

        try {
            if (req.files) {
                for (const fieldName in req.files) {
                    const files = req.files[fieldName];

                    for (const file of files) {
                        const fileTypePath = getFilePathByType(checkFileType(file));
                        const ymdPath = `${moment().format('YYYY_MM_DD')}`;
                        const filename = `${moment().unix()}-${uuid()}${extname(file.originalname)}`;
                        const filePath = `upload/${fileTypePath}/${ymdPath}/${filename}`;

                        await uploadToMinio(file, filePath);
                        fileUrls[fieldName] = `/${filePath}`; // Thay URL base phù hợp với setup của bạn
                    }
                }
            }

            req.body.fileUrls = fileUrls;
            res.json({ success: true, fileUrls });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi upload lên MinIO' });
        }
    });
}

module.exports = { createDynamicUploader, handleFileUpload };
