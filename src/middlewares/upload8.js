const multer = require('multer');
const { Client } = require('minio');
const { v4: uuid } = require('uuid');
const { extname } = require('path');
const moment = require('moment');
const { minioClient } = require('../services/minio');

function checkMimeTypeCallback(file, cb) {
    const mimeTypes = [
        'image/jpg',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/bmp',
        'video/mp4',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const filetypes = /jpg|jpeg|png|gif|bmp|mp4|doc|docx/;
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

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024, // 10MB in bytes
    },
    fileFilter: function (req, file, cb) {
        checkMimeTypeCallback(file, cb);
    },
});

// Bucket name
const bucketName = 'bucket-public';

// Đảm bảo bucket tồn tại
const ensureBucketExists = async (bucketName) => {
    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`Bucket "${bucketName}" created successfully.`);
        }
    } catch (err) {
        console.error(
            `Error checking or creating bucket "${bucketName}":`,
            err
        );
        throw new Error('Failed to ensure bucket existence.');
    }
};

const uploadToMinio = (req, res, next) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const fileName = req.file.originalname;
    const fileBuffer = req.file.buffer;

    // Upload file to MinIO
    minioClient.putObject(bucketName, fileName, fileBuffer, (err, etag) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(500).send('File upload failed.');
        }
        console.log(`File uploaded successfully. ETag: ${etag}`);
        req.minioFile = { fileName, etag }; // Lưu thông tin để middleware tiếp theo sử dụng
        next(); // Tiếp tục xử lý
    });
};

const uploadMultipleToMinio = async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    try {
        await ensureBucketExists(bucketName); // Đảm bảo bucket tồn tại

        const uploadPromises = Object.entries(req.files).flatMap(
            ([fieldName, files]) =>
                files.map((file) => {
                    const ymdPath = `${moment().format('YYYY_MM_DD')}`;
                    const fileTypePath = getFilePathByType(checkFileType(file));
                    const filePath = `ThiTN/${fileTypePath}/${ymdPath}`;
                    const fileName = `${moment().unix()}-${uuid()}${extname(
                        file.originalname
                    )}`;
                    const fileBuffer = file.buffer;

                    if (!req.body[fieldName]) {
                        req.body[fieldName] = `/${filePath}/${fileName}`; // Nếu chưa có, gán giá trị đầu tiên
                    } else {
                        req.body[fieldName] += `,/${filePath}/${fileName}`; // Nếu đã có, nối thêm file mới
                    }

                    return new Promise((resolve, reject) => {
                        minioClient.putObject(
                            bucketName,
                            `${filePath}/${fileName}`,
                            fileBuffer,
                            (err, etag) => {
                                if (err) {
                                    console.error(
                                        `Error uploading file: ${fileName}`,
                                        err
                                    );
                                    reject(err);
                                } else {
                                    console.log(
                                        `File uploaded successfully: ${fileName}, ETag: ${etag}`
                                    );
                                    resolve({ fieldName, fileName, etag });
                                }
                            }
                        );
                    });
                })
        );

        const uploadedFiles = await Promise.all(uploadPromises);
        req.minioFiles = uploadedFiles; // Lưu thông tin các file đã upload
        next();
    } catch (err) {
        console.error('Error uploading files:', err);
        return res.status(500).send('Error uploading files.');
    }
};

module.exports = { upload, uploadToMinio, uploadMultipleToMinio };
