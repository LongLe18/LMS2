const multer = require('multer');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `src/public/image/ThiTN`);
    },
    filename: function (req, file, cb) {
        const filename = `${Date.now()}_${crypto
            .randomBytes(16)
            .toString('hex')}_${crypto
            .randomBytes(16)
            .toString('hex')}.${file.originalname.split('.').pop()}`;
        req.body[file.fieldname] = `/image/ThiTN/${filename}`;
        cb(null, filename);
    },
});

const upload = multer({ 
    storage: storage,
    limits:{fileSize: 1000000000},
    fileFilter: function (req, file, cb) {
        if(file.mimetype=='video/mp4'||file.mimetype=='image/png'||file.mimetype=='image/jpeg'){
            cb(null, true)
        }else{
            cb(null, false)
        }
    }
 });

module.exports = { upload };
