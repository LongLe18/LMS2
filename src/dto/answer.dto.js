const { body } = require('express-validator');

const CreateAnswerDto = () => {
    return [
        body('ten_ngan_hang')
            .isString()
            .withMessage('ten_ngan_hang must be a string')
            .notEmpty()
            .withMessage('ten_ngan_hang is required'),

        body('so_tai_khoan')
            .isString()
            .withMessage('so_tai_khoan must be a string')
            .notEmpty()
            .withMessage('so_tai_khoan is required'),

        body('ten_dvth')
            .isString()
            .withMessage('ten_dvth must be a string')
            .notEmpty()
            .withMessage('ten_dvth is required'),

        body('chi_nhanh')
            .isString()
            .withMessage('chi_nhanh must be a string')
            .notEmpty()
            .withMessage('chi_nhanh is required'),
    ];
};

const UpdateAnswerDto = () => {
    return [
        body('ten_ngan_hang')
            .isString()
            .withMessage('ten_ngan_hang must be a string')
            .notEmpty()
            .withMessage('ten_ngan_hang is required'),

        body('so_tai_khoan')
            .isString()
            .withMessage('so_tai_khoan must be a string')
            .notEmpty()
            .withMessage('so_tai_khoan is required'),

        body('ten_dvth')
            .isString()
            .withMessage('ten_dvth must be a string')
            .notEmpty()
            .withMessage('ten_dvth is required'),

        body('chi_nhanh')
            .isString()
            .withMessage('chi_nhanh must be a string')
            .notEmpty()
            .withMessage('chi_nhanh is required'),
    ];
};

module.exports = { CreateAnswerDto, UpdateAnswerDto };
