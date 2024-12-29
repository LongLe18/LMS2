const { Client } = require('minio');

require('dotenv').config();
const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT, // Change to your MinIO server's endpoint
    port: Number(process.env.MINIO_PORT), // Change to your MinIO server's port if different
    useSSL: false, // Set true if using HTTPS
    accessKey: process.env.MINIO_ACCESS_KEY, // Replace with your MinIO access key
    secretKey: process.env.MINIO_SECRET_KEY, // Replace with your MinIO secret key
});

module.exports = { minioClient };
