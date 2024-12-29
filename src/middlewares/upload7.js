const multer = require('multer');
const { Client } = require('minio');
const { v4: uuid } = require('uuid');
const { extname } = require('path');
const moment = require('moment');
const { minioClient } = require('../services/minio');

const upload = multer({ storage: multer.memoryStorage() });

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
    minioClient.putObject(
        bucketName,
        `Picture/word/media/${req.body.id}/${req.body.upload_times}/${fileName}`,
        fileBuffer,
        (err, etag) => {
            if (err) {
                console.error('Error uploading file:', err);
                return res.status(500).send('File upload failed.');
            }
            console.log(`File uploaded successfully. ETag: ${etag}`);
            req.minioFile = { fileName, etag }; // Lưu thông tin để middleware tiếp theo sử dụng
            next(); // Tiếp tục xử lý
        }
    );
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
                    const fileName = file.originalname;
                    const fileBuffer = file.buffer;

                    return new Promise((resolve, reject) => {
                        minioClient.putObject(
                            bucketName,
                            `Picture/word/media/${req.body.id}/${req.body.upload_times}`,
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
