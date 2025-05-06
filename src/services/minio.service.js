const { Minio } = require('minio');

const minioClient = new Minio({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'admin',
    secretKey: '^P*XQ3*0H7%6Ny',
});

module.exports = minioClient;
