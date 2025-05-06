const multer = require('multer');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const { extname } = require('path');
const moment = require('moment');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const filePath = `public/Picture/word/media/${req.query.de_thi_id}`;
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, { recursive: true });
        }
        cb(null, filePath);
    },
    filename: function (req, file, cb) {
        const filename = `${moment().unix()}-${uuid()}${extname(
            file.originalname
        )}`;
        req.body[
            file.fieldname
        ] = `\\begin{center}\\includegraphics[scale = 0.5]{Picture/word/media/${req.query.de_thi_id}/${filename}}\\end{center}\\\n`;
        cb(null, filename);
    },
});

const uploadWordMedia = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB in bytes
    },
    fileFilter: function (req, file, cb) {
        cb(null, true);
    },
});

module.exports = { uploadWordMedia };
