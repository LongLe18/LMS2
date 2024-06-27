const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const questionController = require('../controllers/QuestionController');
const { authToken, authRole } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload2');

router.post(
    '/create', authToken, authRole([2], 6),
    upload.fields([
        { name: 'tep_dinh_kem_noi_dung', maxCount: 10 },
        { name: 'tep_dinh_kem_loi_giai', maxCount: 10 },
    ]),
    tryCatch(questionController.postCreate)
);
//router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(questionController.getUpdate));
router.put(
    '/:id', authToken, authRole([2], 6), 
    upload.fields([
        { name: 'tep_dinh_kem_noi_dung', maxCount: 10 },
        { name: 'tep_dinh_kem_loi_giai', maxCount: 10 },
    ]),
    tryCatch(questionController.putUpdate)
    );
router.get('/getByExam', authToken, authRole([2], 7), tryCatch(questionController.getByExam));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(questionController.forceDelete));
router.get('/all_admin', authToken, authRole([2], 7), tryCatch(questionController.getAll_admin));
router.get('/:id', authToken, authRole([2], 7), tryCatch(questionController.getById));
router.get('/', authToken, authRole([2], 7), tryCatch(questionController.getAll));

module.exports = router;
