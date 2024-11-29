const express = require('express');
const router = express.Router();
const { tryCatch } = require('../middlewares/tryCatch');
const questionController = require('../controllers/QuestionController');
const { authToken, authRole } = require('../middlewares/auth');
const { uploadWordMedia } = require('../middlewares/upload4');

router.post(
    '/create', authToken, authRole([2], 6),
    uploadWordMedia.fields([
        { name: 'tep_dinh_kem_noi_dung', maxCount: 1 },
        { name: 'tep_dinh_kem_loi_giai', maxCount: 1 },
    ]),
    tryCatch(questionController.postCreate)
);
//router.get('/:id/edit', authToken, authRole([2], 6), tryCatch(questionController.getUpdate));
router.put(
    '/:id', authToken, authRole([2], 6), 
    uploadWordMedia.fields([
        { name: 'tep_dinh_kem_noi_dung', maxCount: 10 },
        { name: 'tep_dinh_kem_loi_giai', maxCount: 10 },
    ]),
    tryCatch(questionController.putUpdate)
    );
router.get('/getByExam', authToken, authRole([2], 7), tryCatch(questionController.getByExam));
router.delete('/:id/force', authToken, authRole([2], 6), tryCatch(questionController.forceDelete));
router.get('/all_admin', authToken, authRole([2], 7), tryCatch(questionController.getAll_admin));

router.post('/:id/add-details', authToken, authRole([2], 7), tryCatch(questionController.addDetails));
router.post('/:id/add-detail', authToken, authRole([2], 7), tryCatch(questionController.addDetail));
router.get('/:id/get-details', authToken, authRole([2], 7), tryCatch(questionController.getDetails));
router.put('/update-detail/:detailId', authToken, authRole([2], 7), tryCatch(questionController.updateDetail));
router.delete('/remove-detail/:detailId', authToken, authRole([2], 7), tryCatch(questionController.removeDetail));

router.post('/:id/add-option', authToken, authRole([2], 7), tryCatch(questionController.addOption));
router.get('/:id/get-option', authToken, authRole([2], 7), tryCatch(questionController.getOption));
router.put('/update-option/:optionId', authToken, authRole([2], 7), tryCatch(questionController.updateOption));
router.delete('/remove-option/:optionId', authToken, authRole([2], 7), tryCatch(questionController.removeOption));

router.get('/:id', authToken, authRole([2], 7), tryCatch(questionController.getById));
router.get('/', authToken, authRole([2], 7), tryCatch(questionController.getAll));

module.exports = router;
